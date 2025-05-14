<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }
    
    if (!isset($_SESSION['user']['is_admin']) || !$_SESSION['user']['is_admin']) {
        throw new Exception('Unauthorized access. Admin privileges required.');
    }
    
    $title = $_POST['title'] ?? null;
    $description = $_POST['description'] ?? null;
    $price = $_POST['price'] ?? null;
    $category = $_POST['category'] ?? null;
    $condition = $_POST['condition'] ?? null;
    $brand = $_POST['brand'] ?? null;
    $model = $_POST['model'] ?? null;
    $quantity = $_POST['quantity'] ?? 1; 
    $shipping = isset($_POST['shipping']) && $_POST['shipping'] === 'true' ? 1 : 0;
    $localPickup = isset($_POST['localPickup']) && $_POST['localPickup'] === 'true' ? 1 : 0;
    $status = $_POST['status'] ?? 'active';
    
    if (!$title || !$price || !$category || !$condition || !$brand || !$model || !isset($_POST['quantity']) || intval($_POST['quantity']) < 0) {
        throw new Exception('All required fields must be filled, and quantity cannot be negative.');
    }
    
    $db = new Database();
    $conn = $db->getConnection();
    
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
    
    $uploadedImages = [];
    
    if (!empty($_FILES['images']) && is_array($_FILES['images']['name'])) {
        $uploadDir = '../../uploads/products/';
        if (!file_exists($uploadDir)) {
            if (!mkdir($uploadDir, 0777, true) && !is_dir($uploadDir)) {
                throw new Exception(sprintf('Directory "%s" was not created', $uploadDir));
            }
        }
        
        $imageStmt = $conn->prepare("INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)");
        
        for ($i = 0; $i < count($_FILES['images']['name']); $i++) {
            if ($_FILES['images']['error'][$i] == UPLOAD_ERR_OK) {
                $originalFileName = basename($_FILES['images']['name'][$i]);
                $safeFileName = preg_replace("/[^a-zA-Z0-9._-]/", "", $originalFileName);
                if (empty($safeFileName) || $safeFileName === '.' || $safeFileName === '..') {
                    $safeFileName = "image_" . $i . time(); 
                }
                $fileExtension = pathinfo($safeFileName, PATHINFO_EXTENSION);
                if (empty($fileExtension)) {
                    $safeFileName .= ".jpg";
                }
                
                $finalFileName = time() . '_' . uniqid() . '_' . $safeFileName;
                $filePath = $uploadDir . $finalFileName;
                
                if (move_uploaded_file($_FILES['images']['tmp_name'][$i], $filePath)) {
                    $imageUrl = 'backend/uploads/products/' . $finalFileName;
                    $imageStmt->execute([$productId, $imageUrl, $i]);
                    $uploadedImages[] = $imageUrl;
                } else {
                    error_log("Failed to move uploaded file: " . $_FILES['images']['name'][$i] . " to " . $filePath . ". Check permissions and path.");
                }
            } else {
                 error_log("Upload error for file " . ($_FILES['images']['name'][$i] ?? 'unknown_file') . ": " . $_FILES['images']['error'][$i]);
            }
        }
    } else {
        if (empty($_FILES['images'])) {
            error_log("No files found in \$_FILES['images'] during listing creation for product ID: " . $productId);
        } else {
            error_log("Unexpected structure for \$_FILES['images'] or \$_FILES['images']['name'] is not an array for product ID: " . $productId);
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
    error_log("Create Listing Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>