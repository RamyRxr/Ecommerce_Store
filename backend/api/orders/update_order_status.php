<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    // Check if user is logged in
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user']['id'];
    
    // Get data from request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['order_id']) || !isset($data['status'])) {
        throw new Exception('Order ID and status are required');
    }
    
    $orderId = $data['order_id'];
    $status = $data['status'];
    $reason = isset($data['reason']) ? $data['reason'] : '';
    
    // Only allow users to cancel orders
    if ($status !== 'cancelled') {
        throw new Exception('Invalid status update request');
    }
    
    $db = new Database();
    $conn = $db->getConnection();
    
    // Verify the order belongs to this user and is in a status that can be cancelled
    $orderSql = "SELECT id, status FROM orders WHERE id = :order_id AND user_id = :user_id";
    $orderStmt = $conn->prepare($orderSql);
    $orderStmt->bindParam(':order_id', $orderId);
    $orderStmt->bindParam(':user_id', $userId);
    $orderStmt->execute();
    
    $order = $orderStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        throw new Exception('Order not found');
    }
    
    if ($order['status'] !== 'pending') {
        throw new Exception('Only pending orders can be cancelled');
    }
    
    // Update the order status
    $updateSql = "UPDATE orders SET 
                    status = :status, 
                    cancellation_reason = :reason,
                    cancellation_date = NOW(),
                    updated_at = NOW()
                    WHERE id = :order_id AND user_id = :user_id";
    
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bindParam(':status', $status);
    $updateStmt->bindParam(':reason', $reason);
    $updateStmt->bindParam(':order_id', $orderId);
    $updateStmt->bindParam(':user_id', $userId);
    $updateStmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Order status updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>