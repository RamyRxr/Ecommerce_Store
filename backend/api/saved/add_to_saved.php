<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    // Check if user is logged in
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }
    
    // Get request data
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['product_id'])) {
        throw new Exception('Product ID is required');
    }
    
    if (!isset($input['action']) || !in_array($input['action'], ['add', 'remove'])) {
        throw new Exception('Valid action (add/remove) is required');
    }
    
    $userId = $_SESSION['user']['id'];
    $productId = $input['product_id'];
    $action = $input['action'];
    
    $db = new Database();
    $conn = $db->getConnection();
    
    if ($action === 'add') {
        // First check if item is already saved
        $checkStmt = $conn->prepare("SELECT id FROM saved_items WHERE user_id = ? AND product_id = ?");
        $checkStmt->execute([$userId, $productId]);
        
        if (!$checkStmt->fetch()) {
            // Not found, add it
            $stmt = $conn->prepare("INSERT INTO saved_items (user_id, product_id) VALUES (?, ?)");
            $stmt->execute([$userId, $productId]);
        }
        
        $message = 'Item added to saved items';
    } else {
        // Remove the item
        $stmt = $conn->prepare("DELETE FROM saved_items WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$userId, $productId]);
        $message = 'Item removed from saved items';
    }
    
    echo json_encode([
        'success' => true,
        'message' => $message
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>