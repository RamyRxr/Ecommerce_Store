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
    
    $action = $_POST['action'] ?? '';

    if ($action === 'add') {
        $stmt = $conn->prepare("
            INSERT INTO payment_methods (
                user_id, card_type, last_four, 
                expiry_month, expiry_year, card_holder
            ) VALUES (?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $userId,
            $_POST['card_type'],
            $_POST['last_four'],
            $_POST['expiry_month'],
            $_POST['expiry_year'],
            $_POST['card_holder']
        ]);

        $newId = $conn->lastInsertId();

        echo json_encode([
            'success' => true,
            'message' => 'Payment method added successfully',
            'data' => ['id' => $newId]
        ]);

    } elseif ($action === 'delete') {
        $stmt = $conn->prepare("
            DELETE FROM payment_methods 
            WHERE id = ? AND user_id = ?
        ");

        $stmt->execute([$_POST['payment_id'], $userId]);

        echo json_encode([
            'success' => true,
            'message' => 'Payment method deleted successfully'
        ]);

    } elseif ($action === 'update') {
        $stmt = $conn->prepare("
            UPDATE payment_methods 
            SET card_type = ?,
                expiry_month = ?,
                expiry_year = ?,
                card_holder = ?
            WHERE id = ? AND user_id = ?
        ");

        $stmt->execute([
            $_POST['card_type'],
            $_POST['expiry_month'],
            $_POST['expiry_year'],
            $_POST['card_holder'],
            $_POST['payment_id'],
            $userId
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Payment method updated successfully'
        ]);

    } else {
        throw new Exception('Invalid action');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}