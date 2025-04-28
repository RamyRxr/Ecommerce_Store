<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user']['id'];
    $listingId = $_POST['listing_id'] ?? null;

    if (!$listingId) {
        throw new Exception('Listing ID is required');
    }

    $db = new Database();
    $conn = $db->getConnection();

    // Verify user owns this listing
    $stmt = $conn->prepare("SELECT seller_id FROM products WHERE id = ?");
    $stmt->execute([$listingId]);
    $listing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$listing || $listing['seller_id'] != $userId) {
        throw new Exception('Unauthorized access');
    }

    // Begin transaction
    $conn->beginTransaction();

    // Update product details
    $sql = "UPDATE products SET 
            title = ?,
            description = ?,
            price = ?,
            category = ?,
            `condition` = ?,
            brand = ?,
            model = ?,
            shipping = ?,
            local_pickup = ?,
            status = ?,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        $_POST['title'],
        $_POST['description'],
        $_POST['price'],
        $_POST['category'],
        $_POST['condition'],
        $_POST['brand'],
        $_POST['model'],
        $_POST['shipping'] === 'true' ? 1 : 0,
        $_POST['localPickup'] === 'true' ? 1 : 0,
        $_POST['status'],
        $listingId
    ]);

    // Handle images
    if (isset($_FILES['image'])) {
        // Upload directory
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/Project-Web/backend/uploads/products/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Remove existing images if new ones are uploaded
        $stmt = $conn->prepare("DELETE FROM product_images WHERE product_id = ?");
        $stmt->execute([$listingId]);

        // Upload new images
        foreach ($_FILES['image']['tmp_name'] as $key => $tmp_name) {
            if ($_FILES['image']['error'][$key] === UPLOAD_ERR_OK) {
                $filename = uniqid() . '_' . basename($_FILES['image']['name'][$key]);
                $destination = $uploadDir . $filename;
                
                if (move_uploaded_file($tmp_name, $destination)) {
                    $imageUrl = 'backend/uploads/products/' . $filename;
                    
                    $stmt = $conn->prepare("INSERT INTO product_images (product_id, image_url) VALUES (?, ?)");
                    $stmt->execute([$listingId, $imageUrl]);
                }
            }
        }
    }

    // Keep existing images
    if (isset($_POST['existing_images'])) {
        foreach ($_POST['existing_images'] as $imageUrl) {
            $stmt = $conn->prepare("INSERT INTO product_images (product_id, image_url) VALUES (?, ?)");
            $stmt->execute([$listingId, $imageUrl]);
        }
    }

    // Commit transaction
    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Listing updated successfully'
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