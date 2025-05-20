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

    if (
        !isset($data['total_price']) || !isset($data['shipping_method']) ||
        !isset($data['shipping_cost']) || !isset($data['payment_method']) ||
        !isset($data['shipping_address']) || !isset($data['shipping_city']) ||
        !isset($data['shipping_state']) || !isset($data['shipping_zip']) ||
        !isset($data['shipping_country']) || !isset($data['items']) || !is_array($data['items'])
    ) {
        throw new Exception('Incomplete order data provided.');
    }

    if (count($data['items']) === 0) {
        throw new Exception('Order must contain at least one item.');
    }

    $db = new Database();
    $conn = $db->getConnection();

    $stmt = $conn->prepare("CALL FinalizeOrder(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @order_id)");
    $stmt->execute([
        $user_id,
        $data['total_price'],
        $data['shipping_method'],
        $data['shipping_cost'],
        $data['shipping_address'],
        $data['shipping_city'],
        $data['shipping_state'],
        $data['shipping_zip'],
        $data['shipping_country'],
        $data['payment_method'],
        json_encode($data['items'])
    ]);

    $orderIdResult = $conn->query("SELECT @order_id AS order_id");
    $orderIdRow = $orderIdResult->fetch(PDO::FETCH_ASSOC);
    $orderId = $orderIdRow['order_id'];

    $clearCartStmt = $conn->prepare("DELETE FROM cart_items WHERE user_id = ?");
    $clearCartStmt->execute([$user_id]);

    echo json_encode([
        'success' => true,
        'order_id' => $orderId,
        'message' => 'Order created successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    error_log("Create Order Error: " . $e->getMessage() . " - Data: " . json_encode($data ?? null));
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>