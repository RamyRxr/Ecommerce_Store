<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../utils/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
    exit();
}

// Get raw POST data
$postData = file_get_contents('php://input');
$data = json_decode($postData, true);

if (!$data) {
    // Try regular POST data
    $data = $_POST;
}

$username = isset($data['username']) ? sanitize_input($data['username']) : '';
$password = isset($data['password']) ? $data['password'] : '';

if (empty($username) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'Username and password are required'
    ]);
    exit();
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    if (!$conn) {
        throw new Exception('Database connection failed');
    }

    $isEmail = filter_var($username, FILTER_VALIDATE_EMAIL);
    $field = $isEmail ? 'email' : 'username';
    
    $stmt = $conn->prepare("SELECT * FROM users WHERE {$field} = ?");
    $stmt->execute([$username]);
    
    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password'
        ]);
        exit();
    }
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (password_verify($password, $user['password'])) {
        unset($user['password']);
        $_SESSION['user'] = $user;
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'data' => $user
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password'
        ]);
    }
    
} catch(Exception $e) {
    error_log($e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Server error occurred'
    ]);
}