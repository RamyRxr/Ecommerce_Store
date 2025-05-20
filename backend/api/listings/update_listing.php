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
    
    $listingId = $_POST['listing_id'] ?? null;
    
    if (!$listingId) {
        throw new Exception('Listing ID is required');
    }
    
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
        throw new Exception('You do not have permission to edit this listing or listing not found');
    }
    
    if (!$listingId || !$title || !$price || !$category || !$condition || !$brand || !$model || !isset($_POST['quantity']) || intval($_POST['quantity']) < 0) { 
        throw new Exception('All required fields must be filled, and quantity cannot be negative.');
    }

    // Fetch current price
    $currentStmt = $conn->prepare("SELECT price FROM products WHERE id = ?");
    $currentStmt->execute([$listingId]);
    $currentProduct = $currentStmt->fetch(PDO::FETCH_ASSOC);

    if ($currentProduct && floatval($currentProduct['price']) != floatval($price)) {
        // Price changed: move old price to original_price
        $sql = "UPDATE products SET 
                    title = ?, 
                    description = ?, 
                    original_price = price, 
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
    } else {
        // Price did not change, update as usual
        $sql = "UPDATE products SET 
                    title = ?, 
                    description = ?, 
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
            $title, $description, $category,
            $condition, $brand, $model, (int)$quantity,
            $shipping, $localPickup, $status,
            $listingId, $_SESSION['user']['id']
        ]);
    }

    if (!empty($_FILES['images']) && is_array($_FILES['images']['name'])) {
        $uploadDir = '../../uploads/products/';
        if (!file_exists($uploadDir)) {
             if (!mkdir($uploadDir, 0777, true) && !is_dir($uploadDir)) {
                throw new Exception(sprintf('Directory "%s" was not created for update', $uploadDir));
            }
        }
        
        $imageStmt = $conn->prepare("INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)");
        
        $countStmt = $conn->prepare("SELECT MAX(display_order) FROM product_images WHERE product_id = ?");
        $countStmt->execute([$listingId]);
        $currentMaxDisplayOrder = $countStmt->fetchColumn();
        $displayOrderStart = ($currentMaxDisplayOrder === null) ? 0 : $currentMaxDisplayOrder + 1;
        
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
                    $imageStmt->execute([$listingId, $imageUrl, $displayOrderStart + $i]);
                } else {
                    error_log("Update Listing: Failed to move uploaded file: " . $_FILES['images']['name'][$i] . " to " . $filePath);
                }
            } else {
                error_log("Update Listing: Upload error for file " . ($_FILES['images']['name'][$i] ?? 'unknown_file') . ": " . $_FILES['images']['error'][$i]);
            }
        }
    }
    
    if (isset($_POST['existing_images'])) {
        $existingImagesFromPost = is_array($_POST['existing_images']) ? $_POST['existing_images'] : [];
        
        $currentImagesStmt = $conn->prepare("SELECT id, image_url FROM product_images WHERE product_id = ?");
        $currentImagesStmt->execute([$listingId]);
        $currentDbImages = $currentImagesStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $deleteImageStmt = $conn->prepare("DELETE FROM product_images WHERE id = ?");
        
        foreach ($currentDbImages as $dbImage) {
            if (!in_array($dbImage['image_url'], $existingImagesFromPost)) {
                $deleteImageStmt->execute([$dbImage['id']]);
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Listing updated successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    error_log("Update Listing Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>