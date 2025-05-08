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
    
    $action = $_POST['action'] ?? '';

    if ($action === 'update_personal') {
        // Validate required fields
        if (empty($_POST['username']) || empty($_POST['first_name']) || 
            empty($_POST['last_name']) || empty($_POST['email'])) {
            throw new Exception('Required fields are missing');
        }

        // Check if email is already used by another user
        $stmt = $conn->prepare("
            SELECT id FROM users 
            WHERE email = ? AND id != ?
        ");
        $stmt->execute([$_POST['email'], $userId]);
        if ($stmt->rowCount() > 0) {
            throw new Exception('Email already in use');
        }

        // Update personal information
        $stmt = $conn->prepare("
            UPDATE users 
            SET username = ?,
                first_name = ?,
                last_name = ?,
                email = ?,
                phone = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $_POST['username'],
            $_POST['first_name'],
            $_POST['last_name'],
            $_POST['email'],
            $_POST['phone'] ?? '',
            $userId
        ]);

    } elseif ($action === 'update_shipping') {
        // Update shipping address
        $stmt = $conn->prepare("
            UPDATE users 
            SET address = ?,
                city = ?,
                state = ?,
                zip_code = ?,
                country = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $_POST['address'] ?? '',
            $_POST['city'] ?? '',
            $_POST['state'] ?? '',
            $_POST['zip_code'] ?? '',
            $_POST['country'] ?? '',
            $userId
        ]);
    } else {
        throw new Exception('Invalid action');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Update successful'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}