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
    
    // Get form data
    $title = $_POST['title'] ?? null;
    $description = $_POST['description'] ?? null;
    $price = $_POST['price'] ?? null;
    $category = $_POST['category'] ?? null;
    $condition = $_POST['condition'] ?? null;
    $brand = $_POST['brand'] ?? null;
    $model = $_POST['model'] ?? null;
    $quantity = $_POST['quantity'] ?? 1; // Ensure quantity is an integer
    $shipping = isset($_POST['shipping']) && $_POST['shipping'] === 'true' ? 1 : 0;
    $localPickup = isset($_POST['localPickup']) && $_POST['localPickup'] === 'true' ? 1 : 0;
    $status = $_POST['status'] ?? 'active';
    
    // Validate required fields
    if (!$title || !$price || !$category || !$condition || !$brand || !$model || !isset($_POST['quantity']) || intval($_POST['quantity']) < 1) {
        throw new Exception('All required fields must be filled, and quantity must be at least 1');
    }
    
    // Connect to database
    $db = new Database();
    $conn = $db->getConnection();
    
    // Using backticks for 'condition' since it's a reserved word in MySQL
    $stmt = $conn->prepare("INSERT INTO products (
                title, description, price, category, 
                `condition`, brand, model, quantity, shipping, 
                local_pickup, seller_id, status, created_at
            ) VALUES (
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, NOW()
            )");
            
    $stmt->execute([
        $title, $description, $price, $category,
        $condition, $brand, $model, (int)$quantity, $shipping,
        $localPickup, $_SESSION['user']['id'], $status
    ]);
    
    $productId = $conn->lastInsertId();
    
    // Handle image uploads
    $uploadedImages = [];
    
    if (!empty($_FILES['image']) && is_array($_FILES['image']['name'])) {
        // Create directory if it doesn't exist
        $uploadDir = '../../uploads/products/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        // Prepare image insert statement
        $imageStmt = $conn->prepare("INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)");
        
        for ($i = 0; $i < count($_FILES['image']['name']); $i++) {
            if ($_FILES['image']['error'][$i] == 0) {
                $fileName = time() . '_' . $_FILES['image']['name'][$i];
                $filePath = $uploadDir . $fileName;
                
                // Move uploaded file
                if (move_uploaded_file($_FILES['image']['tmp_name'][$i], $filePath)) {
                    $imageUrl = 'backend/uploads/products/' . $fileName;
                    $imageStmt->execute([$productId, $imageUrl, $i]);
                    $uploadedImages[] = $imageUrl;
                }
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'product_id' => $productId,
        'images' => $uploadedImages,
        'message' => 'Product created successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>