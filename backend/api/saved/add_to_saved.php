<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user']['id'];
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['product_id'])) {
        throw new Exception('Product ID is required');
    }

    $productId = $data['product_id'];
    $action = $data['action'] ?? 'add';

    $db = new Database();
    $conn = $db->getConnection();

    if ($action === 'add') {
        // Check if already saved
        $stmt = $conn->prepare("SELECT id FROM saved_items WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$userId, $productId]);
        
        if (!$stmt->fetch()) {
            // Add to saved items
            $stmt = $conn->prepare("INSERT INTO saved_items (user_id, product_id) VALUES (?, ?)");
            $stmt->execute([$userId, $productId]);
        }
    } else {
        // Remove from saved items
        $stmt = $conn->prepare("DELETE FROM saved_items WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$userId, $productId]);
    }

    echo json_encode([
        'success' => true,
        'message' => $action === 'add' ? 'Item saved successfully' : 'Item removed successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}