<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $itemId = $data['item_id'] ?? null;
    $change = $data['quantity_change'] ?? 0;

    if (!$itemId) throw new Exception('Item ID is required');

    $db = new Database();
    $conn = $db->getConnection();

    // Update quantity
    $stmt = $conn->prepare("UPDATE cart_items SET quantity = quantity + ? WHERE id = ? AND user_id = ?");
    $stmt->execute([$change, $itemId, $_SESSION['user']['id']]);

    echo json_encode([
        'success' => true,
        'message' => 'Quantity updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}