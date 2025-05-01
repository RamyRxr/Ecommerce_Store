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
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check required parameters
    if (!isset($data['order_id']) || !isset($data['status'])) {
        throw new Exception('Order ID and status are required');
    }
    
    $orderId = $data['order_id'];
    $newStatus = $data['status'];
    $reason = $data['reason'] ?? null;
    
    // Valid status values
    $validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!in_array($newStatus, $validStatuses)) {
        throw new Exception('Invalid status value');
    }
    
    $db = new Database();
    $conn = $db->getConnection();
    
    // Verify user owns this order
    $checkStmt = $conn->prepare("SELECT id FROM orders WHERE id = ? AND user_id = ?");
    $checkStmt->execute([$orderId, $userId]);
    $order = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        throw new Exception('Order not found or unauthorized access');
    }
    
    // Update the order status
    $sql = "UPDATE orders SET status = :status WHERE id = :order_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':status', $newStatus);
    $stmt->bindParam(':order_id', $orderId);
    $stmt->execute();
    
    // If cancellation, record the reason
    if ($newStatus === 'cancelled' && $reason) {
        // In a real application, you'd have a separate table for cancellation info
        // Here we'll just log it for demonstration
        error_log("Order $orderId cancelled by user $userId. Reason: $reason");
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Order status updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>