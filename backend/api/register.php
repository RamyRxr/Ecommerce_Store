<?php
// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Include database connection and utilities
require_once '../../config/database.php';
require_once '../../utils/functions.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(false, 'Invalid request method');
}

// Get and sanitize POST data
$username = isset($_POST['username']) ? sanitize_input($_POST['username']) : '';
$email = isset($_POST['email']) ? sanitize_input($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$confirm_password = isset($_POST['confirm_password']) ? $_POST['confirm_password'] : '';
$first_name = isset($_POST['first_name']) ? sanitize_input($_POST['first_name']) : '';
$last_name = isset($_POST['last_name']) ? sanitize_input($_POST['last_name']) : '';
$phone = isset($_POST['phone']) ? sanitize_input($_POST['phone']) : '';

// Validate input
if (empty($username) || empty($email) || empty($password) || empty($confirm_password)) {
    json_response(false, 'Please fill all required fields');
}

if (!is_valid_email($email)) {
    json_response(false, 'Please enter a valid email address');
}

if (strlen($password) < 8) {
    json_response(false, 'Password must be at least 8 characters long');
}

if ($password !== $confirm_password) {
    json_response(false, 'Passwords do not match');
}

try {
    // Check if username already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    
    if ($stmt->rowCount() > 0) {
        json_response(false, 'Username already exists');
    }
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->rowCount() > 0) {
        json_response(false, 'Email already exists');
    }
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$username, $email, $hashed_password, $first_name, $last_name, $phone]);
    
    json_response(true, 'Registration successful! Please log in.');
    
} catch(PDOException $e) {
    json_response(false, 'Database error: ' . $e->getMessage());
}
?>