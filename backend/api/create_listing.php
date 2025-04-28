<?php
header('Content-Type: application/json');
session_start();

require_once '../config/database.php';

try {
    // Check if user is logged in
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user']['id'];

    // Create upload directory if it doesn't exist
    $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/Project-Web/backend/uploads/products/';
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
    if (empty($title) || empty($description) || $price <= 0 || empty($category) || empty($brand)) {
        throw new Exception("Missing required fields");
    }

    // Handle image uploads
    $imageUrls = [];
    if (isset($_FILES['image'])) {
        $files = $_FILES['image'];
        foreach ($files['tmp_name'] as $key => $tmp_name) {
            if ($files['error'][$key] === UPLOAD_ERR_OK) {
                $filename = uniqid() . '_' . basename($files['name'][$key]);
                $destination = $uploadDir . $filename;
                
                if (move_uploaded_file($tmp_name, $destination)) {
                    // Store the URL path relative to the Project-Web root
                    $imageUrls[] = 'backend/uploads/products/' . $filename;
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
    $stmt->bindParam(':seller_id', $userId);

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

    echo json_encode([
        'success' => true,
        'message' => 'Listing created successfully',
        'productId' => $productId
    ]);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}