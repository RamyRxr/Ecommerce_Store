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

    $db = new Database();
    $conn = $db->getConnection();

    // Update user settings
    $stmt = $conn->prepare("
        INSERT INTO user_settings (
            user_id,
            language,
            currency,
            timezone
        ) VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            language = VALUES(language),
            currency = VALUES(currency),
            timezone = VALUES(timezone)
    ");

    $stmt->execute([
        $userId,
        $data['language'] ?? 'en',
        $data['currency'] ?? 'USD',
        $data['timezone'] ?? 'UTC'
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Settings updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}