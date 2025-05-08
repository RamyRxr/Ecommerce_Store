<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php'; // Adjust path as needed

$response = ['success' => false, 'message' => 'An error occurred.'];

if (!isset($_SESSION['user']) || !$_SESSION['user']['is_admin']) {
    $response['message'] = 'Unauthorized: Admin access required.';
    http_response_code(403);
    echo json_encode($response);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$order_id = $input['order_id'] ?? null;
$new_status = $input['status'] ?? null;
$reason = $input['reason'] ?? null; // For cancellations

if (!$order_id || !$new_status) {
    $response['message'] = 'Order ID and new status are required.';
    http_response_code(400);
    echo json_encode($response);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

try {
    $conn->beginTransaction();

    // Update order status
    $updateSql = "UPDATE orders SET status = :status, updated_at = CURRENT_TIMESTAMP";
    $params = [':status' => $new_status, ':order_id' => $order_id];

    if ($new_status === 'cancelled' && $reason) {
        $updateSql .= ", cancellation_reason = :reason, cancellation_date = CURRENT_TIMESTAMP";
        $params[':reason'] = $reason;
    } elseif ($new_status === 'delivered') {
        // Add actual delivery date if not already set by another process
        $updateSql .= ", actual_delivery_date = COALESCE(actual_delivery_date, CURRENT_TIMESTAMP)";
    }
    // Add more conditions for other statuses if needed

    $updateSql .= " WHERE id = :order_id";
    
    $stmt = $conn->prepare($updateSql);
    $stmt->execute($params);

    if ($stmt->rowCount() > 0) {
        $response['success'] = true;
        $response['message'] = "Order status updated to {$new_status}.";

        // If order is marked as 'delivered', update product quantities and log sold items
        if ($new_status === 'delivered') {
            // Get order items
            $itemsStmt = $conn->prepare("
                SELECT oi.id as order_item_id, oi.product_id, oi.quantity, oi.price, p.seller_id, o.user_id as buyer_id
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.order_id = :order_id
            ");
            $itemsStmt->execute([':order_id' => $order_id]);
            $orderItems = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($orderItems as $item) {
                // 1. Decrement product quantity
                $updateProductQtyStmt = $conn->prepare("
                    UPDATE products 
                    SET quantity = quantity - :sold_quantity 
                    WHERE id = :product_id AND quantity >= :sold_quantity_check
                ");
                $updateProductQtyStmt->execute([
                    ':sold_quantity' => $item['quantity'],
                    ':product_id' => $item['product_id'],
                    ':sold_quantity_check' => $item['quantity'] // Ensure we don't go negative due to race conditions if stock wasn't pre-validated
                ]);

                if ($updateProductQtyStmt->rowCount() == 0) {
                    // This could happen if stock was already less than sold_quantity,
                    // which ideally shouldn't occur if stock is validated at order creation.
                    // For now, we'll log an error or warning if this happens.
                    error_log("Stock update issue for product_id: {$item['product_id']} in order_id: {$order_id}. Quantity may have been insufficient.");
                    // Optionally, throw an exception to rollback if this is critical
                    // throw new Exception("Stock update failed for product ID {$item['product_id']}. Insufficient quantity.");
                }


                // 2. Check if product quantity is now 0 and update status to 'sold_out'
                $checkQtyStmt = $conn->prepare("SELECT quantity FROM products WHERE id = :product_id");
                $checkQtyStmt->execute([':product_id' => $item['product_id']]);
                $currentProductQty = $checkQtyStmt->fetchColumn();

                if ($currentProductQty <= 0) { // Use <= 0 to be safe
                    $updateProductStatusStmt = $conn->prepare("
                        UPDATE products SET status = 'sold_out' 
                        WHERE id = :product_id
                    ");
                    $updateProductStatusStmt->execute([':product_id' => $item['product_id']]);
                }

                // 3. Insert into sold_items table
                $insertSoldItemStmt = $conn->prepare("
                    INSERT INTO sold_items (order_item_id, product_id, order_id, seller_id, buyer_id, sold_price, quantity_sold, sold_at)
                    VALUES (:order_item_id, :product_id, :order_id, :seller_id, :buyer_id, :sold_price, :quantity_sold, CURRENT_TIMESTAMP)
                ");
                $insertSoldItemStmt->execute([
                    ':order_item_id' => $item['order_item_id'],
                    ':product_id' => $item['product_id'],
                    ':order_id' => $order_id,
                    ':seller_id' => $item['seller_id'],
                    ':buyer_id' => $item['buyer_id'],
                    ':sold_price' => $item['price'],
                    ':quantity_sold' => $item['quantity']
                ]);
            }
        }
        $conn->commit();
    } else {
        $conn->rollBack(); // Rollback if order status update failed
        $response['message'] = "Failed to update order status or order not found.";
        // http_response_code(404); // Or appropriate error code
    }

} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    $response['message'] = 'Error: ' . $e->getMessage();
    http_response_code(500);
    error_log("Admin Update Order Status Error: " . $e->getMessage() . " for Order ID: " . $order_id);
}

echo json_encode($response);
?>