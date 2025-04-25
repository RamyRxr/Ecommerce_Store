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
    $action = $_GET['action'] ?? ''; // add, update, delete

    $db = new Database();
    $conn = $db->getConnection();

    switch ($action) {
        case 'add':
            $stmt = $conn->prepare("
                INSERT INTO payment_methods (
                    user_id, card_type, last_4_digits, 
                    expiry_month, expiry_year, card_holder,
                    is_default
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $userId,
                $data['cardType'],
                $data['last4'],
                $data['expiryMonth'],
                $data['expiryYear'],
                $data['cardHolder'],
                $data['isDefault'] ?? false
            ]);
            
            $message = 'Payment method added successfully';
            break;

        case 'update':
            $stmt = $conn->prepare("
                UPDATE payment_methods 
                SET card_type = ?,
                    expiry_month = ?,
                    expiry_year = ?,
                    card_holder = ?,
                    is_default = ?
                WHERE id = ? AND user_id = ?
            ");

            $stmt->execute([
                $data['cardType'],
                $data['expiryMonth'],
                $data['expiryYear'],
                $data['cardHolder'],
                $data['isDefault'] ?? false,
                $data['id'],
                $userId
            ]);
            
            $message = 'Payment method updated successfully';
            break;

        case 'delete':
            $stmt = $conn->prepare("
                DELETE FROM payment_methods 
                WHERE id = ? AND user_id = ?
            ");

            $stmt->execute([$data['id'], $userId]);
            
            $message = 'Payment method deleted successfully';
            break;

        default:
            throw new Exception('Invalid action');
    }

    echo json_encode([
        'success' => true,
        'message' => $message
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}