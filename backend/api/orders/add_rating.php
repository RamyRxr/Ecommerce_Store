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
    if (!isset($data['order_id']) || !isset($data['rating'])) {
        throw new Exception('Order ID and rating are required');
    }
    
    $orderId = $data['order_id'];
    $rating = intval($data['rating']);
    $comments = $data['comments'] ?? '';
    
    // Validate rating
    if ($rating < 1 || $rating > 5) {
        throw new Exception('Rating must be between 1 and 5');
    }
    
    $db = new Database();
    $conn = $db->getConnection();
    
    // Verify user owns this order and it's delivered
    $checkStmt = $conn->prepare("SELECT id FROM orders WHERE id = ? AND user_id = ? AND status = 'delivered'");
    $checkStmt->execute([$orderId, $userId]);
    $order = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        throw new Exception('Order not found, unauthorized access, or order not delivered');
    }
    
    // In a real app, you would insert into a ratings table
    // For now, let's just simulate success
    
    echo json_encode([
        'success' => true,
        'message' => 'Rating submitted successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>