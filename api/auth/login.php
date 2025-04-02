<?php
// Add CORS headers and error handling
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Error reporting for debugging (remove in production)
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include configuration file
require_once '../config.php';

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Invalid request method');
}

// Get POST data
$username = isset($_POST['username']) ? sanitizeInput($_POST['username']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

// Validate required fields
if (empty($username) || empty($password)) {
    sendJsonResponse(false, 'Username and password are required');
}

try {
    $conn = getDbConnection();
    
    // Check if username is an email
    $is_email = filter_var($username, FILTER_VALIDATE_EMAIL);
    
    if ($is_email) {
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = :username LIMIT 1");
    } else {
        $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username LIMIT 1");
    }
    
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($password, $user['password'])) {
        // Set session variables
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['logged_in'] = true;
        
        // Return user data (excluding password)
        unset($user['password']);
        sendJsonResponse(true, 'Login successful', $user);
    } else {
        sendJsonResponse(false, 'Invalid username or password');
    }
} catch (PDOException $e) {
    // Log error for server-side debugging
    error_log('Login error: ' . $e->getMessage());
    sendJsonResponse(false, 'Server error. Please try again later.');
}
?>