<?php
// filepath: c:\xampp\htdocs\Project-Web\backend\api\profile\get_reviews.php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'message' => 'User not authenticated']);
    exit;
}

$userId = $_SESSION['user']['id'];
$isAdmin = isset($_SESSION['user']['is_admin']) ? (bool)$_SESSION['user']['is_admin'] : false;

$db = new Database();
$conn = $db->getConnection();

$reviews = [];
$message = '';
$success = false;

try {
    $imageSubQuery = "(SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order ASC, pi.id ASC LIMIT 1)";

    if ($isAdmin) {
        // Admin: Get all reviews, including reviewer's username and avatar
        $sql = "SELECT r.id, r.user_id, r.product_id, r.rating, r.review_text, r.created_at as date,
                        u.username as reviewer_username, 
                        u.profile_image as reviewerAvatarUrl, -- Added reviewer's avatar
                        p.title as productName, 
                        {$imageSubQuery} as product_image_url
                FROM reviews r
                JOIN users u ON r.user_id = u.id -- Join to get reviewer's details
                JOIN products p ON r.product_id = p.id
                ORDER BY r.created_at DESC";
        $stmt = $conn->prepare($sql);
    } else {
        // Regular user: Get only their reviews, including their username and avatar
        $sql = "SELECT r.id, r.user_id, r.product_id, r.rating, r.review_text, r.created_at as date,
                        u.username as reviewer_username, -- Added current user's username as reviewer
                        u.profile_image as reviewerAvatarUrl, -- Added current user's avatar as reviewer
                        p.title as productName, 
                        {$imageSubQuery} as product_image_url
                FROM reviews r
                JOIN users u ON r.user_id = u.id -- Join to get current user's details for their reviews
                JOIN products p ON r.product_id = p.id
                WHERE r.user_id = :userId
                ORDER BY r.created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    }
    
    $stmt->execute();
    $fetchedReviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach($fetchedReviews as $review) {
        $rawProductImageFromDb = $review['product_image_url'];
        $productImageToReturn = !empty($rawProductImageFromDb) ? $rawProductImageFromDb : '../assets/images/products-images/default.png';

        $reviews[] = [
            'id' => $review['id'],
            'productName' => $review['productName'],
            'productImage' => $productImageToReturn, 
            'rating' => (int)$review['rating'],
            'date' => date('F j, Y', strtotime($review['date'])),
            'reviewText' => $review['review_text'],
            'helpful' => 0, 
            'verified' => false, 
            'productId' => $review['product_id'],
            'userId' => $review['user_id'], // User ID of the reviewer
            'reviewerUsername' => $review['reviewer_username'] ?? null, // Username of the reviewer
            'reviewerAvatarUrl' => $review['reviewerAvatarUrl'] ?? null // Avatar URL of the reviewer
        ];
    }
    $success = true;

} catch (PDOException $e) {
    $message = 'Database error: ' . $e->getMessage();
    error_log('PDOException - get_reviews: ' . $e->getMessage());
    http_response_code(500);
} catch (Exception $e) {
    $message = 'Server error: ' . $e->getMessage();
    error_log('Exception - get_reviews: ' . $e->getMessage());
    http_response_code(500);
}

echo json_encode(['success' => $success, 'reviews' => $reviews, 'message' => $message]);
?>