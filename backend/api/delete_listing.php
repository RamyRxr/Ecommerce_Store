<?php
header('Content-Type: application/json');
session_start();

require_once '../config/database.php';

try {
    if (!isset($_POST['listing_id'])) {
        throw new Exception('Listing ID is required');
    }

    $db = new Database();
    $conn = $db->getConnection();
    
    // Get user ID from session
    $userId = $_SESSION['user_id'] ?? 1;
    $listingId = $_POST['listing_id'];

    // Start transaction
    $conn->beginTransaction();

    // Delete images first
    $sql = "DELETE FROM product_images WHERE product_id = :listing_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':listing_id', $listingId);
    $stmt->execute();

    // Delete the listing
    $sql = "DELETE FROM products WHERE id = :listing_id AND seller_id = :seller_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':listing_id', $listingId);
    $stmt->bindParam(':seller_id', $userId);
    $stmt->execute();

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