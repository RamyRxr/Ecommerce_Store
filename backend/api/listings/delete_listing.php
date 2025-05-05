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
    
    // Get listing ID from POST
    $listingId = $_POST['listing_id'] ?? null;
    
    if (!$listingId) {
        throw new Exception('Listing ID is required');
    }
    
    // Connect to database
    $db = new Database();
    $conn = $db->getConnection();
    
    // Verify the product exists and belongs to this admin
    $verifyStmt = $conn->prepare("SELECT id FROM products WHERE id = ? AND seller_id = ?");
    $verifyStmt->execute([$listingId, $_SESSION['user']['id']]);
    
    if (!$verifyStmt->fetch()) {
        throw new Exception('You do not have permission to delete this listing');
    }
    
    // Begin transaction
    $conn->beginTransaction();
    
    // Delete product images from database
    $deleteImagesStmt = $conn->prepare("DELETE FROM product_images WHERE product_id = ?");
    $deleteImagesStmt->execute([$listingId]);
    
    // Delete the product
    $deleteProductStmt = $conn->prepare("DELETE FROM products WHERE id = ?");
    $deleteProductStmt->execute([$listingId]);
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Listing deleted successfully'
    ]);
    
} catch (Exception $e) {
    // Roll back transaction on error
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>