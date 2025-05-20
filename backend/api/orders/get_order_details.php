<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }
    $requesting_user_id = $_SESSION['user']['id'];
    $is_admin = isset($_SESSION['user']['is_admin']) && $_SESSION['user']['is_admin'];

    if (!isset($_GET['id'])) {
        throw new Exception('Order ID is required');
    }
    $order_id = $_GET['id'];

    $db = new Database();
    $conn = $db->getConnection();

    $stmt = $conn->prepare("CALL GetOrderDetail(?)");
    $stmt->execute([$order_id]);

    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt->nextRowset();
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$is_admin && (!$order || $order['user_id'] != $requesting_user_id)) {
        throw new Exception('Order not found or you are not authorized to view it.');
    }

    $order['items'] = $items;

    echo json_encode(['success' => true, 'order' => $order]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>