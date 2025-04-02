<?php
// Add CORS headers and error handling
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Include configuration file
require_once '../config.php';

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Invalid request method');
}

// Get POST data
$username = isset($_POST['username']) ? sanitizeInput($_POST['username']) : '';
$email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$confirm_password = isset($_POST['confirm_password']) ? $_POST['confirm_password'] : '';
$first_name = isset($_POST['first_name']) ? sanitizeInput($_POST['first_name']) : '';
$last_name = isset($_POST['last_name']) ? sanitizeInput($_POST['last_name']) : '';

// Validate required fields
if (empty($username) || empty($email) || empty($password) || empty($confirm_password) || empty($first_name) || empty($last_name)) {
    sendJsonResponse(false, 'All fields are required');
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJsonResponse(false, 'Invalid email format');
}

// Check if passwords match
if ($password !== $confirm_password) {
    sendJsonResponse(false, 'Passwords do not match');
}

try {
    $conn = getDbConnection();
    
    // Check if username or email already exists
    $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE username = :username OR email = :email");
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->fetchColumn() > 0) {
        sendJsonResponse(false, 'Username or email already exists');
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, first_name, last_name, role, created_at) 
                          VALUES (:username, :email, :password, :first_name, :last_name, 'client', NOW())");
    
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':first_name', $first_name);
    $stmt->bindParam(':last_name', $last_name);
    
    $stmt->execute();
    
    // Create cart for the new user
    $user_id = $conn->lastInsertId();
    $stmt = $conn->prepare("INSERT INTO carts (user_id, created_at) VALUES (:user_id, NOW())");
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    sendJsonResponse(true, 'Registration successful. You can now log in.');
} catch (PDOException $e) {
    sendJsonResponse(false, 'Server error: ' . $e->getMessage());
}
?>