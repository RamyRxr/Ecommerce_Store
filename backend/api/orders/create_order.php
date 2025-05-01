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

    // 1. Create main order
    $stmt = $conn->prepare("
        INSERT INTO orders (user_id, total_price, shipping_method, shipping_cost) 
        VALUES (:user_id, :total_price, :shipping_method, :shipping_cost)
    ");

    $stmt->execute([
        ':user_id' => $user_id,
        ':total_price' => $data['total_price'],
        ':shipping_method' => $data['shipping_method'],
        ':shipping_cost' => $data['shipping_cost']
    ]);

    $order_id = $conn->lastInsertId();

    // 2. Create order items
    foreach ($data['items'] as $item) {
        $stmt = $conn->prepare("
            INSERT INTO order_items (order_id, product_id, quantity, price) 
            VALUES (:order_id, :product_id, :quantity, :price)
        ");

        $stmt->execute([
            ':order_id' => $order_id,
            ':product_id' => $item['product_id'],
            ':quantity' => $item['quantity'],
            ':price' => $item['price']
        ]);
    }

    echo json_encode([
        'success' => true,
        'order_id' => $order_id
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>