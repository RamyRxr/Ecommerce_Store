<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user']['id'];
    $db = new Database();
    $conn = $db->getConnection();

    // Get user settings
    $stmt = $conn->prepare("
        SELECT * FROM user_settings 
        WHERE user_id = ?
    ");
    
    $stmt->execute([$userId]);
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);

    // If no settings exist, create default settings
    if (!$settings) {
        $stmt = $conn->prepare("
            INSERT INTO user_settings (user_id)
            VALUES (?)
        ");
        $stmt->execute([$userId]);

        $settings = [
            'order_updates' => true,
            'promotions' => true,
            'newsletter' => false,
            'product_updates' => true,
            'language' => 'en',
            'currency' => 'usd',
            'timezone' => 'utc'
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => $settings
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}