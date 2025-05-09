<?php
// filepath: backend/api/orders/create_order.php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user'])) {
        throw new Exception('User not logged in');
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = $_SESSION['user']['id'];

    // Validate incoming data
    if (
        !isset($data['total_price']) || !isset($data['shipping_method']) ||
        !isset($data['shipping_cost']) || !isset($data['payment_method']) ||
        !isset($data['shipping_address']) || !isset($data['shipping_city']) ||
        !isset($data['shipping_state']) || !isset($data['shipping_zip']) ||
        !isset($data['shipping_country']) || !isset($data['items']) || !is_array($data['items'])
    ) {
        throw new Exception('Incomplete order data provided.');
    }


    $db = new Database();
    $conn = $db->getConnection();
    $conn->beginTransaction();

    // Get the current order number for this user
    $stmt = $conn->prepare("
        SELECT COUNT(*) as order_count 
        FROM orders 
        WHERE user_id = ?
    ");
    $stmt->execute([$user_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $orderNumber = str_pad($result['order_count'] + 1, 2, '0', STR_PAD_LEFT);

    // Generate order ID in format ORD-MMYY-USERIDORDERNUMBER
    $orderId = sprintf(
        "ORD-%s-%d%s",
        date('my'),
        $user_id,
        $orderNumber
    );

    // Create main order with the generated ID
    $stmt = $conn->prepare("
        INSERT INTO orders (
            id, user_id, total_price, shipping_method, shipping_cost, 
            shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country, 
            payment_method, status
        ) 
        VALUES (
            :order_id, :user_id, :total_price, :shipping_method, :shipping_cost,
            :shipping_address, :shipping_city, :shipping_state, :shipping_zip, :shipping_country,
            :payment_method, 'pending'
        )
    ");

    $stmt->execute([
        ':order_id' => $orderId,
        ':user_id' => $user_id,
        ':total_price' => $data['total_price'],
        ':shipping_method' => $data['shipping_method'],
        ':shipping_cost' => $data['shipping_cost'],
        ':shipping_address' => $data['shipping_address'],
        ':shipping_city' => $data['shipping_city'],
        ':shipping_state' => $data['shipping_state'],
        ':shipping_zip' => $data['shipping_zip'],
        ':shipping_country' => $data['shipping_country'],
        ':payment_method' => $data['payment_method']
    ]);

    // Create order items
    // Fetch product titles before inserting into order_items
    $itemInsertStmt = $conn->prepare("
        INSERT INTO order_items (order_id, product_id, product_title, quantity, price) 
        VALUES (:order_id, :product_id, :product_title, :quantity, :price)
    ");

    $productTitleStmt = $conn->prepare("SELECT title FROM products WHERE id = :product_id");

    foreach ($data['items'] as $item) {
        if (!isset($item['product_id']) || !isset($item['quantity']) || !isset($item['price'])) {
            throw new Exception('Incomplete item data in order.');
        }
        $productTitleStmt->execute([':product_id' => $item['product_id']]);
        $product = $productTitleStmt->fetch(PDO::FETCH_ASSOC);
        $product_title = $product ? $product['title'] : 'Product Title Not Found';

        $itemInsertStmt->execute([
            ':order_id' => $orderId,
            ':product_id' => $item['product_id'],
            ':product_title' => $product_title,
            ':quantity' => $item['quantity'],
            ':price' => $item['price']
        ]);
    }

    // Clear the cart
    $clearCart = $conn->prepare("DELETE FROM cart_items WHERE user_id = :user_id");
    $clearCart->execute([':user_id' => $user_id]);

    $conn->commit();

    echo json_encode([
        'success' => true,
        'order_id' => $orderId,
        'message' => 'Order created successfully'
    ]);

} catch (Exception $e) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    http_response_code(500);
    error_log("Create Order Error: " . $e->getMessage() . " - Data: " . json_encode($data ?? null));
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>