<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Content-Type: application/json; charset=UTF-8");

// Include database and response utility
include_once '../../config/Database.php';
include_once '../../utils/ApiResponse.php';

// Check if it's a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ApiResponse::error("Invalid request method", 405);
}

// Get user_id from request
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

// Validate user_id
if ($user_id <= 0) {
    ApiResponse::error("Invalid user ID");
}

// Database connection
$database = new Database();
$db = $database->getConnection();

try {
    // Query to get saved items with product details
    $query = "
        SELECT s.id, s.user_id, s.product_id, s.created_at,
               p.title, p.description, p.price, p.original_price, p.category,
               p.brand, p.model, p.`condition`, p.is_sale, p.is_new,
               (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order LIMIT 1) as main_image
        FROM saved_items s
        JOIN products p ON s.product_id = p.id
        WHERE s.user_id = :user_id
        ORDER BY s.created_at DESC
    ";
    
    // Prepare statement
    $stmt = $db->prepare($query);
    
    // Bind parameters
    $stmt->bindParam(":user_id", $user_id);
    
    // Execute query
    $stmt->execute();
    
    // Get number of rows
    $num = $stmt->rowCount();
    
    // Check if any items found
    if ($num > 0) {
        // Saved items array
        $saved_items_arr = [];
        
        // Retrieve records
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $saved_items_arr[] = $row;
        }
        
        // Send success response
        ApiResponse::success("Saved items retrieved successfully", $saved_items_arr);
    } else {
        // No saved items found
        ApiResponse::success("No saved items found", []);
    }
} catch (PDOException $e) {
    ApiResponse::error("Database error: " . $e->getMessage(), 500);
}
?>