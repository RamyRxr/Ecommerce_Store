<?php
header('Content-Type: application/json');
session_start();

require_once '../config/database.php';

try {
    // Create upload directory if it doesn't exist
    $uploadDir = '../uploads/products/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Get form data
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = floatval($_POST['price'] ?? 0);
    $category = $_POST['category'] ?? '';
    $brand = $_POST['brand'] ?? '';
    $condition = $_POST['condition'] ?? '';
    $model = $_POST['model'] ?? '';
    $shipping = isset($_POST['shipping']) ? filter_var($_POST['shipping'], FILTER_VALIDATE_BOOLEAN) : true;
    $localPickup = isset($_POST['localPickup']) ? filter_var($_POST['localPickup'], FILTER_VALIDATE_BOOLEAN) : false;
    
    // Validate required fields
    if (empty($title) || empty($description) || $price <= 0 || empty($category) || empty($brand) || empty($condition)) {
        throw new Exception("Missing required fields");
    }

    // Handle image uploads
    $imageUrls = [];
    if (isset($_FILES['image'])) {
        $files = $_FILES['image'];
        
        // Reorganize files array if multiple files
        $fileCount = is_array($files['name']) ? count($files['name']) : 1;
        
        for ($i = 0; $i < $fileCount; $i++) {
            $fileName = $files['name'][$i] ?? $files['name'];
            $fileType = $files['type'][$i] ?? $files['type'];
            $fileTmp = $files['tmp_name'][$i] ?? $files['tmp_name'];
            $fileError = $files['error'][$i] ?? $files['error'];
            
            if ($fileError === UPLOAD_ERR_OK) {
                $extension = pathinfo($fileName, PATHINFO_EXTENSION);
                $newFileName = uniqid() . '.' . $extension;
                $destination = $uploadDir . $newFileName;
                
                if (move_uploaded_file($fileTmp, $destination)) {
                    $imageUrls[] = 'backend/uploads/products/' . $newFileName;
                }
            }
        }
    }

    // Connect to database
    $db = new Database();
    $conn = $db->getConnection();

    // Begin transaction
    $conn->beginTransaction();

    // Insert product
    $sql = "INSERT INTO products (
        title, description, price, category, `condition`,
        brand, model, shipping, local_pickup, status,
        seller_id, created_at
    ) VALUES (
        :title, :description, :price, :category, :condition,
        :brand, :model, :shipping, :local_pickup, :status,
        :seller_id, NOW()
    )";

    $stmt = $conn->prepare($sql);
    
    $status = 'active';
    $sellerId = $_SESSION['user_id'] ?? 1; // Replace with actual user ID from session

    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':price', $price);
    $stmt->bindParam(':category', $category);
    $stmt->bindParam(':condition', $condition);
    $stmt->bindParam(':brand', $brand);
    $stmt->bindParam(':model', $model);
    $stmt->bindParam(':shipping', $shipping, PDO::PARAM_BOOL);
    $stmt->bindParam(':local_pickup', $localPickup, PDO::PARAM_BOOL);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':seller_id', $sellerId);

    $stmt->execute();
    $productId = $conn->lastInsertId();

    // Insert images
    if (!empty($imageUrls)) {
        $imageSql = "INSERT INTO product_images (product_id, image_url, display_order) 
                     VALUES (:product_id, :image_url, :display_order)";
        $imageStmt = $conn->prepare($imageSql);

        foreach ($imageUrls as $index => $url) {
            $imageStmt->bindParam(':product_id', $productId);
            $imageStmt->bindParam(':image_url', $url);
            $imageStmt->bindParam(':display_order', $index);
            $imageStmt->execute();
        }
    }

    // Commit transaction
    $conn->commit();

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Listing created successfully',
        'productId' => $productId,
        'imageUrls' => $imageUrls
    ]);

} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($conn)) {
        $conn->rollBack();
    }
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}