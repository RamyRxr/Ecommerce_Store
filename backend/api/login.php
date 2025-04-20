<?php
// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow cross-origin requests (important for local development)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Include database connection and utilities
require_once '../config/database.php';
require_once '../utils/functions.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Invalid request method');
}

// Get and sanitize POST data
$username = isset($_POST['username']) ? sanitize_input($_POST['username']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : ''; // Don't sanitize password before verification

// Validate input
if (empty($username) || empty($password)) {
    json_response(false, 'Username and password are required');
}

try {
    // Check if input is email or username
    $isEmail = is_valid_email($username);
    $field = $isEmail ? 'email' : 'username';
    
    // Prepare SQL statement
    $stmt = $conn->prepare("SELECT id, username, email, password, first_name, last_name FROM users WHERE $field = ?");
    $stmt->execute([$username]);
    
    // Check if user exists
    if ($stmt->rowCount() === 0) {
        json_response(false, 'Invalid username or password');
    }
    
    // Fetch user data
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verify password
    if (password_verify($password, $user['password'])) {
        // Remove password from user data before sending
        unset($user['password']);
        
        // Return success response with user data
        json_response(true, 'Login successful', $user);
    } else {
        json_response(false, 'Invalid username or password');
    }
    
} catch(PDOException $e) {
    json_response(false, 'Database error: ' . $e->getMessage());
}
?>