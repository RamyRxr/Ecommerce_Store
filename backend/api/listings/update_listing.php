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
    
    // Get listing ID
    $listingId = $_POST['listing_id'] ?? null;
    
    if (!$listingId) {
        throw new Exception('Listing ID is required');
    }
    
    // Get form data
    $title = $_POST['title'] ?? null;
    $description = $_POST['description'] ?? null;
    $price = $_POST['price'] ?? null;
    $category = $_POST['category'] ?? null;
    $condition = $_POST['condition'] ?? null;
    $brand = $_POST['brand'] ?? null;
    $model = $_POST['model'] ?? null;
    $quantity = $_POST['quantity'] ?? null; 
    $shipping = isset($_POST['shipping']) && $_POST['shipping'] === 'true' ? 1 : 0;
    $localPickup = isset($_POST['localPickup']) && $_POST['localPickup'] === 'true' ? 1 : 0;
    $status = $_POST['status'] ?? 'active';
    
    $db = new Database();
    $conn = $db->getConnection();
    
    $verifyStmt = $conn->prepare("SELECT id FROM products WHERE id = ? AND seller_id = ?");
    $verifyStmt->execute([$listingId, $_SESSION['user']['id']]);
    
    if (!$verifyStmt->fetch()) {
        throw new Exception('You do not have permission to edit this listing');
    }
    
    if (!$listingId || !$title || !$price || !$category || !$condition || !$brand || !$model || !isset($_POST['quantity']) || intval($_POST['quantity']) < 1) { // Add quantity validation
        throw new Exception('All required fields must be filled, and quantity must be at least 1');
    }

    $sql = "UPDATE products SET 
                title = ?, 
                description = ?, 
                price = ?, 
                category = ?, 
                `condition` = ?, 
                brand = ?, 
                model = ?, 
                quantity = ?, 
                shipping = ?, 
                local_pickup = ?, 
                status = ?, 
                updated_at = NOW() 
            WHERE id = ? AND seller_id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        $title, $description, $price, $category,
        $condition, $brand, $model, (int)$quantity,
        $shipping, $localPickup, $status,
        $listingId, $_SESSION['user']['id']
    ]);

    $uploadedImages = [];
    
    if (!empty($_FILES['image']) && is_array($_FILES['image']['name'])) {
        $uploadDir = '../../uploads/products/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $imageStmt = $conn->prepare("INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)");
        
        $countStmt = $conn->prepare("SELECT COUNT(*) FROM product_images WHERE product_id = ?");
        $countStmt->execute([$listingId]);
        $displayOrder = $countStmt->fetchColumn();
        
        for ($i = 0; $i < count($_FILES['image']['name']); $i++) {
            if ($_FILES['image']['error'][$i] == 0) {
                $fileName = time() . '_' . $_FILES['image']['name'][$i];
                $filePath = $uploadDir . $fileName;
                
                if (move_uploaded_file($_FILES['image']['tmp_name'][$i], $filePath)) {
                    $imageUrl = 'backend/uploads/products/' . $fileName;
                    $imageStmt->execute([$listingId, $imageUrl, $displayOrder + $i]);
                    $uploadedImages[] = $imageUrl;
                }
            }
        }
    }
    
    if (isset($_POST['existing_images']) && is_array($_POST['existing_images'])) {
        $existingImages = $_POST['existing_images'];
        
        $currentImagesStmt = $conn->prepare("SELECT id, image_url FROM product_images WHERE product_id = ?");
        $currentImagesStmt->execute([$listingId]);
        $currentImages = $currentImagesStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $deleteImageStmt = $conn->prepare("DELETE FROM product_images WHERE id = ?");
        
        foreach ($currentImages as $image) {
            if (!in_array($image['image_url'], $existingImages)) {
                $deleteImageStmt->execute([$image['id']]);
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Listing updated successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>