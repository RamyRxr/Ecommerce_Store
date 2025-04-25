<?php
header('Content-Type: application/json');
session_start();

require_once '../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user']['id'];
    $data = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    $requiredFields = ['orderUpdates', 'promotions', 'newsletter', 'productUpdates'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    $db = new Database();
    $conn = $db->getConnection();

    // Update or insert settings
    $stmt = $conn->prepare("
        INSERT INTO user_settings (
            user_id, 
            order_updates, 
            promotions, 
            newsletter, 
            product_updates
        ) VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            order_updates = VALUES(order_updates),
            promotions = VALUES(promotions),
            newsletter = VALUES(newsletter),
            product_updates = VALUES(product_updates)
    ");

    $stmt->execute([
        $userId,
        $data['orderUpdates'] ? 1 : 0,
        $data['promotions'] ? 1 : 0,
        $data['newsletter'] ? 1 : 0,
        $data['productUpdates'] ? 1 : 0
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Notification settings updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}