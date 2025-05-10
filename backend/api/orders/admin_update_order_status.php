<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php'; 

$response = ['success' => false, 'message' => 'An error occurred.'];

if (!isset($_SESSION['user']) || !isset($_SESSION['user']['is_admin']) || !$_SESSION['user']['is_admin']) {
    $response['message'] = 'Unauthorized: Admin access required.';
    http_response_code(403);
    echo json_encode($response);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$order_id = $input['order_id'] ?? null;
$new_status = $input['status'] ?? null;
$reason = $input['reason'] ?? null; 

if (!$order_id || !$new_status) {
    $response['message'] = 'Order ID and new status are required.';
    http_response_code(400);
    echo json_encode($response);
    exit;
}

$allowed_statuses = ['pending_confirmation', 'confirmed', 'shipped', 'delivered', 'cancelled', 'processing'];
if (!in_array($new_status, $allowed_statuses)) {
    $response['message'] = 'Invalid status provided.';
    http_response_code(400);
    echo json_encode($response);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

try {
    $conn->beginTransaction();

    $updateSql = "UPDATE orders SET status = :status, updated_at = CURRENT_TIMESTAMP";
    $params = [':status' => $new_status, ':order_id' => $order_id];

    if ($new_status === 'cancelled' && $reason) {
        $updateSql .= ", cancellation_reason = :reason, cancellation_date = CURRENT_TIMESTAMP";
        $params[':reason'] = $reason;
    } elseif ($new_status === 'delivered') {
        $updateSql .= ", actual_delivery_date = COALESCE(actual_delivery_date, CURRENT_TIMESTAMP)";
    }
    elseif ($new_status === 'shipped') {
        $updateSql .= ", shipped_date = COALESCE(shipped_date, CURRENT_TIMESTAMP)";
    }


    $updateSql .= " WHERE id = :order_id";
    
    $stmt = $conn->prepare($updateSql);
    $stmt->execute($params);

    if ($stmt->rowCount() > 0) {
        $response['success'] = true;
        $response['message'] = "Order status updated to {$new_status}.";

        if ($new_status === 'delivered') {
            $itemsStmt = $conn->prepare("
                SELECT oi.id as order_item_id, oi.product_id, oi.quantity as quantity_sold_in_order, oi.price as sold_price_per_item, 
                       p.seller_id, o.user_id as buyer_id
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.order_id = :order_id
            ");
            $itemsStmt->execute([':order_id' => $order_id]);
            $orderItems = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($orderItems as $item) {
                if ($item['product_id'] === null) {
                    error_log("Skipping stock update for order_item_id: {$item['order_item_id']} in order_id: {$order_id} because product_id is NULL.");
                    continue; 
                }

                $updateProductQtyStmt = $conn->prepare("
                    UPDATE products 
                    SET quantity = quantity - :quantity_sold_in_order 
                    WHERE id = :product_id AND quantity >= :quantity_sold_in_order_check
                ");
                $updateProductQtyStmt->execute([
                    ':quantity_sold_in_order' => $item['quantity_sold_in_order'],
                    ':product_id' => $item['product_id'],
                    ':quantity_sold_in_order_check' => $item['quantity_sold_in_order']
                ]);

                if ($updateProductQtyStmt->rowCount() == 0) {
                    error_log("Stock update issue for product_id: {$item['product_id']} in order_id: {$order_id}. Quantity may have been insufficient or product not found for update.");
                }

                $checkQtyStmt = $conn->prepare("SELECT quantity FROM products WHERE id = :product_id");
                $checkQtyStmt->execute([':product_id' => $item['product_id']]);
                $currentProductQty = $checkQtyStmt->fetchColumn();

                if ($currentProductQty !== false && $currentProductQty <= 0) { 
                    $updateProductStatusStmt = $conn->prepare("
                        UPDATE products SET status = 'sold_out' 
                        WHERE id = :product_id
                    ");
                    $updateProductStatusStmt->execute([':product_id' => $item['product_id']]);
                }

                $insertSoldItemStmt = $conn->prepare("
                    INSERT INTO sold_items (order_item_id, product_id, order_id, seller_id, buyer_id, sold_price, quantity_sold, sold_at)
                    VALUES (:order_item_id, :product_id, :order_id, :seller_id, :buyer_id, :sold_price, :quantity_sold_in_order, CURRENT_TIMESTAMP)
                ");
                $insertSoldItemStmt->execute([
                    ':order_item_id' => $item['order_item_id'],
                    ':product_id' => $item['product_id'],
                    ':order_id' => $order_id,
                    ':seller_id' => $item['seller_id'],
                    ':buyer_id' => $item['buyer_id'],
                    ':sold_price' => $item['sold_price_per_item'], 
                    ':quantity_sold_in_order' => $item['quantity_sold_in_order']
                ]);
            }
        }
        $conn->commit();
    } else {
        $conn->rollBack(); 
        $response['message'] = "Failed to update order status or order not found.";
    }

} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    $response['message'] = 'Error: ' . $e->getMessage();
    http_response_code(500);
    error_log("Admin Update Order Status Error: " . $e->getMessage() . " for Order ID: " . $order_id . " Input: " . json_encode($input));
}

echo json_encode($response);
?>