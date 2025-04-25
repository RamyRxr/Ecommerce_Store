<?php
header('Content-Type: application/json');
session_start();

require_once '../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user']['id'];
    $db = new Database();
    $conn = $db->getConnection();

    // Get user information
    $stmt = $conn->prepare("
        SELECT 
            id,
            username,
            email,
            first_name,
            last_name,
            phone,
            address,
            city,
            state,
            zip_code,
            country,
            created_at
        FROM users 
        WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get user settings
    $stmt = $conn->prepare("
        SELECT 
            language,
            currency,
            timezone,
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
        $stmt = $conn->prepare("
            INSERT INTO user_settings (
                user_id,
                language,
                currency,
                timezone,
                order_updates,
                promotions,
                newsletter,
                product_updates
            ) VALUES (?, 'en', 'USD', 'UTC', 1, 1, 0, 1)
        ");
        $stmt->execute([$userId]);

        $settings = [
            'language' => 'en',
            'currency' => 'USD',
            'timezone' => 'UTC',
            'order_updates' => true,
            'promotions' => true,
            'newsletter' => false,
            'product_updates' => true
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'user' => $userData,
            'settings' => $settings
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}