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
    
    $db = new Database();
    $conn = $db->getConnection();
    
    $verifyStmt = $conn->prepare("SELECT id FROM products WHERE id = ? AND seller_id = ?");
    $verifyStmt->execute([$listingId, $_SESSION['user']['id']]);
    
    if (!$verifyStmt->fetch()) {
        throw new Exception('You do not have permission to delete this listing');
    }
    
    $conn->beginTransaction();
    
    $deleteImagesStmt = $conn->prepare("DELETE FROM product_images WHERE product_id = ?");
    $deleteImagesStmt->execute([$listingId]);
    
    $deleteProductStmt = $conn->prepare("DELETE FROM products WHERE id = ?");
    $deleteProductStmt->execute([$listingId]);
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Listing deleted successfully'
    ]);
    
} catch (Exception $e) {
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