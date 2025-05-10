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
    
    $type = $_POST['type'] ?? '';

    $stmt = $conn->prepare("SELECT id FROM user_settings WHERE user_id = ?");
    $stmt->execute([$userId]);
    
    if (!$stmt->fetch()) {
        $stmt = $conn->prepare("INSERT INTO user_settings (user_id) VALUES (?)");
        $stmt->execute([$userId]);
    }

    if ($type === 'notifications') {
        $orderUpdates = isset($_POST['order_updates']) ? 1 : 0;
        $promotions = isset($_POST['promotions']) ? 1 : 0;
        $newsletter = isset($_POST['newsletter']) ? 1 : 0;
        $productUpdates = isset($_POST['product_updates']) ? 1 : 0;

        $stmt = $conn->prepare("
            UPDATE user_settings 
            SET order_updates = ?,
                promotions = ?,
                newsletter = ?,
                product_updates = ?
            WHERE user_id = ?
        ");

        $result = $stmt->execute([
            $orderUpdates,
            $promotions,
            $newsletter,
            $productUpdates,
            $userId
        ]);

    } elseif ($type === 'language') {
        $stmt = $conn->prepare("
            UPDATE user_settings 
            SET language = ?,
                currency = ?,
                timezone = ?
            WHERE user_id = ?
        ");

        $result = $stmt->execute([
            $_POST['language'],
            $_POST['currency'],
            $_POST['timezone'],
            $userId
        ]);
    } else {
        throw new Exception('Invalid settings type');
    }

    if (!$result) {
        throw new Exception('Failed to update settings');
    }

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