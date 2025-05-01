<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user'])) {
        throw new Exception('User not logged in');
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = $_SESSION['user']['id'];

    $db = new Database();
    $conn = $db->getConnection();

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
        INSERT INTO orders (id, user_id, total_price, shipping_method, shipping_cost) 
        VALUES (:order_id, :user_id, :total_price, :shipping_method, :shipping_cost)
    ");

    $stmt->execute([
        ':order_id' => $orderId,
        ':user_id' => $user_id,
        ':total_price' => $data['total_price'],
        ':shipping_method' => $data['shipping_method'],
        ':shipping_cost' => $data['shipping_cost']
    ]);

    // Create order items
    $stmt = $conn->prepare("
        INSERT INTO order_items (order_id, product_id, quantity, price) 
        VALUES (:order_id, :product_id, :quantity, :price)
    ");

    foreach ($data['items'] as $item) {
        $stmt->execute([
            ':order_id' => $orderId,
            ':product_id' => $item['product_id'],
            ':quantity' => $item['quantity'],
            ':price' => $item['price']
        ]);
    }

    // Clear the cart
    $clearCart = $conn->prepare("DELETE FROM cart_items WHERE user_id = :user_id");
    $clearCart->execute([':user_id' => $user_id]);

    echo json_encode([
        'success' => true,
        'order_id' => $orderId,
        'message' => 'Order created successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}