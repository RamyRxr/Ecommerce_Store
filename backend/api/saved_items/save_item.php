<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// Include database and response utility
include_once '../../config/Database.php';
include_once '../../utils/ApiResponse.php';

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::error("Invalid request method", 405);
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required data
if (!isset($data->user_id) || !isset($data->product_id)) {
    ApiResponse::error("Missing required parameters");
}

$user_id = intval($data->user_id);
$product_id = intval($data->product_id);

// Validate IDs
if ($user_id <= 0 || $product_id <= 0) {
    ApiResponse::error("Invalid user or product ID");
}

// Database connection
$database = new Database();
$db = $database->getConnection();

try {
    // First check if product exists
    $product_check = "SELECT id FROM products WHERE id = :product_id";
    $stmt = $db->prepare($product_check);
    $stmt->bindParam(":product_id", $product_id);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        ApiResponse::error("Product not found");
    }
    
    // Now check if user exists
    $user_check = "SELECT id FROM users WHERE id = :user_id";
    $stmt = $db->prepare($user_check);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        ApiResponse::error("User not found");
    }
    
    // Check if item already saved
    $check_query = "SELECT id FROM saved_items WHERE user_id = :user_id AND product_id = :product_id";
    $stmt = $db->prepare($check_query);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->bindParam(":product_id", $product_id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        ApiResponse::success("Item was already saved");
        exit;
    }
    
    // Save the item
    $query = "INSERT INTO saved_items (user_id, product_id) VALUES (:user_id, :product_id)";
    $stmt = $db->prepare($query);
    
    // Bind parameters
    $stmt->bindParam(":user_id", $user_id);
    $stmt->bindParam(":product_id", $product_id);
    
    // Execute query
    if ($stmt->execute()) {
        ApiResponse::success("Item saved successfully", ["id" => $db->lastInsertId()]);
    } else {
        ApiResponse::error("Failed to save item");
    }
} catch (PDOException $e) {
    ApiResponse::error("Database error: " . $e->getMessage(), 500);
}
?>