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
    
    if (!isset($data['order_id']) || !isset($data['rating'])) {
        throw new Exception('Order ID and rating are required');
    }
    
    $orderId = $data['order_id'];
    $rating = intval($data['rating']);
    $comments = isset($data['comments']) ? $data['comments'] : '';
    
    // Validate rating
    if ($rating < 1 || $rating > 5) {
        throw new Exception('Rating must be between 1 and 5');
    }
    
    $db = new Database();
    $conn = $db->getConnection();
    
    // Verify the order belongs to this user
    $orderSql = "SELECT id FROM orders WHERE id = :order_id AND user_id = :user_id AND status = 'delivered'";
    $orderStmt = $conn->prepare($orderSql);
    $orderStmt->bindParam(':order_id', $orderId);
    $orderStmt->bindParam(':user_id', $userId);
    $orderStmt->execute();
    
    if ($orderStmt->rowCount() === 0) {
        throw new Exception('Order not found or not eligible for rating');
    }
    
    // Check if order has already been rated
    $checkSql = "SELECT id FROM order_ratings WHERE order_id = :order_id";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':order_id', $orderId);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        throw new Exception('This order has already been rated');
    }
    
    // Add the rating
    $sql = "INSERT INTO order_ratings (order_id, user_id, rating, comments, created_at) 
            VALUES (:order_id, :user_id, :rating, :comments, NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':order_id', $orderId);
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':rating', $rating);
    $stmt->bindParam(':comments', $comments);
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Rating submitted successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>