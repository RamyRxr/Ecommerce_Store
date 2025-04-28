<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    // Get POST data
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        throw new Exception('Username and password are required');
    }

    $db = new Database();
    $conn = $db->getConnection();

    // Check if username exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('Invalid username or password');
    }

    // Verify password
    if (!password_verify($password, $user['password'])) {
        throw new Exception('Invalid username or password');
    }

    // Set session
    $_SESSION['user'] = [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name']
    ];

    // Return success response
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}