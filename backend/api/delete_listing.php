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
    $listingId = $_POST['listing_id'] ?? null;

    if (!$listingId) {
        throw new Exception('Listing ID is required');
    }

    $db = new Database();
    $conn = $db->getConnection();

    // First check if the listing belongs to the user
    $checkSql = "SELECT id FROM products WHERE id = :listing_id AND seller_id = :seller_id";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':listing_id', $listingId);
    $checkStmt->bindParam(':seller_id', $userId);
    $checkStmt->execute();

    if ($checkStmt->rowCount() === 0) {
        throw new Exception('Unauthorized access to listing');
    }

    // Delete the listing
    $deleteSql = "DELETE FROM products WHERE id = :listing_id";
    $deleteStmt = $conn->prepare($deleteSql);
    $deleteStmt->bindParam(':listing_id', $listingId);
    $deleteStmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Listing deleted successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}