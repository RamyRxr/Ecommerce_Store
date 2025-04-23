<?php
header('Content-Type: application/json');
session_start();

require_once '../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Get user ID from session
    $userId = $_SESSION['user_id'] ?? 1;

    // Fetch active listings with their images
    $sql = "SELECT p.*, GROUP_CONCAT(pi.image_url) as image_urls 
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id 
            WHERE p.seller_id = :seller_id 
            GROUP BY p.id 
            ORDER BY p.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':seller_id', $userId);
    $stmt->execute();

    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the data
    foreach ($listings as &$listing) {
        $listing['images'] = $listing['image_urls'] ? explode(',', $listing['image_urls']) : [];
        unset($listing['image_urls']);
    }

    echo json_encode([
        'success' => true,
        'listings' => $listings
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}