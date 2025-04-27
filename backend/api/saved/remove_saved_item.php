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
    
    if (!isset($data['item_id'])) {
        throw new Exception('Item ID is required');
    }

    $itemId = $data['item_id'];

    $db = new Database();
    $conn = $db->getConnection();

    $stmt = $conn->prepare("DELETE FROM saved_items WHERE product_id = ? AND user_id = ?");
    $stmt->execute([$itemId, $userId]);

    echo json_encode([
        'success' => true,
        'message' => 'Item removed successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}