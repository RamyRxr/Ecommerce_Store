<?php
header('Content-Type: application/json');
session_start();

require_once '../config/database.php';

try {
    // Check if user is logged in
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user']['id'];
    $db = new Database();
    $conn = $db->getConnection();

    // Get user's notification settings
    $stmt = $conn->prepare("
        SELECT 
            order_updates,
            promotions,
            newsletter,
            product_updates
        FROM user_settings 
        WHERE user_id = ?
    ");
    $stmt->execute([$userId]);
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);

    // If no settings exist, create default settings
    if (!$settings) {
        $insertStmt = $conn->prepare("
            INSERT INTO user_settings (
                user_id,
                order_updates,
                promotions,
                newsletter,
                product_updates
            ) VALUES (?, 1, 1, 0, 1)
        ");
        $insertStmt->execute([$userId]);

        $settings = [
            'order_updates' => true,
            'promotions' => true,
            'newsletter' => false,
            'product_updates' => true
        ];
    }

    echo json_encode([
        'success' => true,
        'settings' => $settings
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}