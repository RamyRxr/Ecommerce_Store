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
        // Validate required fields
        if (empty($_POST['card_type']) || empty($_POST['card_number']) || 
            empty($_POST['expiry_month']) || empty($_POST['expiry_year']) || 
            empty($_POST['card_holder'])) {
            throw new Exception('All fields are required');
        }

        // Get last 4 digits of card number
        $cardNumber = preg_replace('/\D/', '', $_POST['card_number']);
        $last_four = substr($cardNumber, -4);

        // Insert new payment method
        $stmt = $conn->prepare("
            INSERT INTO payment_methods (
                user_id, card_type, last_four, 
                expiry_month, expiry_year, card_holder
            ) VALUES (?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $userId,
            $_POST['card_type'],
            $last_four,
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

    } elseif ($action === 'update') {
        if (!isset($_POST['payment_id'])) {
            throw new Exception('Payment method ID is required');
        }

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

    } elseif ($action === 'delete') {
        if (!isset($_POST['payment_id'])) {
            throw new Exception('Payment method ID is required');
        }

        $stmt = $conn->prepare("
            DELETE FROM payment_methods 
            WHERE id = ? AND user_id = ?
        ");

        $stmt->execute([$_POST['payment_id'], $userId]);

        echo json_encode([
            'success' => true,
            'message' => 'Payment method deleted successfully'
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