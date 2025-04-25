<?php
header('Content-Type: application/json');
session_start();

require_once '../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user']['id'];
    
    // Get POST data
    $firstName = $_POST['firstName'] ?? '';
    $lastName = $_POST['lastName'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $address = $_POST['address'] ?? '';
    $city = $_POST['city'] ?? '';
    $state = $_POST['state'] ?? '';
    $zipCode = $_POST['zipCode'] ?? '';
    $country = $_POST['country'] ?? '';

    // Validate required fields
    if (empty($firstName) || empty($lastName) || empty($email)) {
        throw new Exception('Required fields are missing');
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    $db = new Database();
    $conn = $db->getConnection();

    // Check if email is already used by another user
    $stmt = $conn->prepare("
        SELECT id FROM users 
        WHERE email = ? AND id != ?
    ");
    $stmt->execute([$email, $userId]);
    if ($stmt->rowCount() > 0) {
        throw new Exception('Email already in use');
    }

    // Update user information
    $stmt = $conn->prepare("
        UPDATE users SET 
            first_name = ?,
            last_name = ?,
            email = ?,
            phone = ?,
            address = ?,
            city = ?,
            state = ?,
            zip_code = ?,
            country = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");

    $stmt->execute([
        $firstName,
        $lastName,
        $email,
        $phone,
        $address,
        $city,
        $state,
        $zipCode,
        $country,
        $userId
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Account updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}