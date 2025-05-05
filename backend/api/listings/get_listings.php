<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    // Check if user is logged in
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }
    
    // Check if the user is an admin
    if (!isset($_SESSION['user']['is_admin']) || !$_SESSION['user']['is_admin']) {
        throw new Exception('Unauthorized access. Admin privileges required.');
    }
    
    $db = new Database();
    $conn = $db->getConnection();
    
    // Get user ID
    $userId = $_SESSION['user']['id'];
    
    // Get all products created by this admin
    $stmt = $conn->prepare("SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC");
    $stmt->execute([$userId]);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Prepare result array
    $listings = [];
    
    foreach ($products as $product) {
        // Get product images
        $imgStmt = $conn->prepare("SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC");
        $imgStmt->execute([$product['id']]);
        $images = $imgStmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Format the product with images
        $product['images'] = $images;
        $listings[] = $product;
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'listings' => $listings
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>