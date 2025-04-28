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

    // Begin transaction
    $conn->beginTransaction();

    // Check if listing belongs to user
    $checkSql = "SELECT id FROM products WHERE id = :listing_id AND seller_id = :seller_id";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':listing_id', $listingId);
    $checkStmt->bindParam(':seller_id', $userId);
    $checkStmt->execute();

    if ($checkStmt->rowCount() === 0) {
        throw new Exception('Unauthorized access to listing');
    }

    // Delete images from product_images table
    $deleteImagesSql = "DELETE FROM product_images WHERE product_id = :listing_id";
    $deleteImagesStmt = $conn->prepare($deleteImagesSql);
    $deleteImagesStmt->bindParam(':listing_id', $listingId);
    $deleteImagesStmt->execute();

    // Delete the product
    $deleteProductSql = "DELETE FROM products WHERE id = :listing_id";
    $deleteProductStmt = $conn->prepare($deleteProductSql);
    $deleteProductStmt->bindParam(':listing_id', $listingId);
    $deleteProductStmt->execute();

    // Commit transaction
    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Listing deleted successfully'
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