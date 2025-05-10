<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['product_id'])) {
        throw new Exception('Product ID is required');
    }
    
    if (!isset($input['quantity']) || $input['quantity'] < 1) {
        throw new Exception('Valid quantity is required');
    }
    
    $userId = $_SESSION['user']['id'];
    $productId = $input['product_id'];
    $quantity = $input['quantity'];
    
    $db = new Database();
    $conn = $db->getConnection();
    
    $checkStmt = $conn->prepare("SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?");
    $checkStmt->execute([$userId, $productId]);
    $existingItem = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existingItem) {
        $newQuantity = $existingItem['quantity'] + $quantity;
        $stmt = $conn->prepare("UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$newQuantity, $userId, $productId]);
        $message = 'Cart item quantity updated';
    } else {
        $stmt = $conn->prepare("INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $productId, $quantity]);
        $message = 'Item added to cart';
    }
    
    $countStmt = $conn->prepare("SELECT COUNT(*) FROM cart_items WHERE user_id = ?");
    $countStmt->execute([$userId]);
    $cartCount = $countStmt->fetchColumn();
    
    echo json_encode([
        'success' => true,
        'message' => $message,
        'cartCount' => $cartCount
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>