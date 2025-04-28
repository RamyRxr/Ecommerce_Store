<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user']['id'];

    $db = new Database();
    $conn = $db->getConnection();

    // Get all listings for the current user
    $sql = "SELECT p.*, 
            GROUP_CONCAT(pi.image_url) as image_urls
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id 
            WHERE p.seller_id = :seller_id
            GROUP BY p.id 
            ORDER BY p.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':seller_id', $userId);
    $stmt->execute();

    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the listings
    $formattedListings = array_map(function($listing) {
        return [
            'id' => $listing['id'],
            'title' => $listing['title'],
            'description' => $listing['description'],
            'price' => $listing['price'],
            'category' => $listing['category'],
            'condition' => $listing['condition'],
            'brand' => $listing['brand'],
            'model' => $listing['model'],
            'shipping' => $listing['shipping'],
            'local_pickup' => $listing['local_pickup'],
            'created_at' => $listing['created_at'],
            'views' => $listing['views'],
            'status' => $listing['status'],
            'images' => $listing['image_urls'] ? explode(',', $listing['image_urls']) : []
        ];
    }, $listings);

    echo json_encode([
        'success' => true,
        'data' => [
            'listings' => $formattedListings
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}