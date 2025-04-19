<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, POST");
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

// Check if the request is DELETE or POST
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::error("Invalid request method", 405);
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Initialize variables
$user_id = 0;
$product_id = 0;
$saved_item_id = 0;

// Check which parameters are provided
if (isset($data->saved_item_id)) {
    $saved_item_id = intval($data->saved_item_id);
} elseif (isset($data->user_id) && isset($data->product_id)) {
    $user_id = intval($data->user_id);
    $product_id = intval($data->product_id);
} else {
    ApiResponse::error("Missing required parameters");
}

// Database connection
$database = new Database();
$db = $database->getConnection();

try {
    // Delete by ID or by user/product combination
    if ($saved_item_id > 0) {
        $query = "DELETE FROM saved_items WHERE id = :saved_item_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":saved_item_id", $saved_item_id);
    } else {
        $query = "DELETE FROM saved_items WHERE user_id = :user_id AND product_id = :product_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":product_id", $product_id);
    }
    
    // Execute query
    $stmt->execute();
    
    // Check if a row was affected
    if ($stmt->rowCount() > 0) {
        ApiResponse::success("Item removed from saved items");
    } else {
        ApiResponse::error("Item not found in saved items");
    }
} catch (PDOException $e) {
    ApiResponse::error("Database error: " . $e->getMessage(), 500);
}
?>