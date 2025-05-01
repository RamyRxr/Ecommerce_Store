<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user'])) {
        throw new Exception('User not logged in');
    }

    $user_id = $_SESSION['user']['id'];
    $data = json_decode(file_get_contents('php://input'), true);

    $db = new Database();
    $conn = $db->getConnection();
    
    // Start transaction
    $conn->beginTransaction();

    // 1. Create main order
    $orderStmt = $conn->prepare("
        INSERT INTO orders (
            user_id, total_price, shipping_method, shipping_cost,
            shipping_address, shipping_city, shipping_state,
            shipping_zip, shipping_country, payment_method
        ) VALUES (
            :user_id, :total_price, :shipping_method, :shipping_cost,
            :shipping_address, :shipping_city, :shipping_state,
            :shipping_zip, :shipping_country, :payment_method
        )
    ");

    $orderStmt->execute([
        ':user_id' => $user_id,
        ':total_price' => $data['total_price'],
        ':shipping_method' => $data['shipping_method'],
        ':shipping_cost' => $data['shipping_cost'],
        ':shipping_address' => $_SESSION['user']['address'],
        ':shipping_city' => $_SESSION['user']['city'],
        ':shipping_state' => $_SESSION['user']['state'],
        ':shipping_zip' => $_SESSION['user']['zip_code'],
        ':shipping_country' => $_SESSION['user']['country'],
        ':payment_method' => $data['payment_method']
    ]);

    $order_id = $conn->lastInsertId();

    // 2. Insert order items
    $itemStmt = $conn->prepare("
        INSERT INTO order_items (
            order_id, product_id, product_title, 
            price, quantity
        ) VALUES (
            :order_id, :product_id, :product_title,
            :price, :quantity
        )
    ");

    foreach ($data['items'] as $item) {
        $itemStmt->execute([
            ':order_id' => $order_id,
            ':product_id' => $item['id'],
            ':product_title' => $item['name'],
            ':price' => $item['price'],
            ':quantity' => $item['quantity']
        ]);
    }

    // 3. Clear user's cart
    $clearCartStmt = $conn->prepare("
        DELETE FROM cart_items WHERE user_id = :user_id
    ");
    $clearCartStmt->execute([':user_id' => $user_id]);

    // Commit transaction
    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Order created successfully',
        'order_id' => $order_id
    ]);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>