<?php
// filepath: c:\xampp\htdocs\Project-Web\backend\api\profile\get_reviews.php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'message' => 'User not authenticated']);
    exit;
}

$currentUserId = $_SESSION['user']['id']; // Get current user ID for checking likes
$isAdmin = isset($_SESSION['user']['is_admin']) ? (bool)$_SESSION['user']['is_admin'] : false;

$db = new Database();
$conn = $db->getConnection();

$reviews = [];
$message = '';
$success = false;

try {
    $imageSubQuery = "(SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order ASC, pi.id ASC LIMIT 1)";
    
    // Subquery to check if the current user liked the review
    $currentUserLikedSubQuery = "(EXISTS(SELECT 1 FROM review_likes rl WHERE rl.review_id = r.id AND rl.user_id = :currentUserId))";

    if ($isAdmin) {
        $sql = "SELECT r.id, r.user_id, r.product_id, r.rating, r.review_text, r.created_at as date,
                        r.likes_count, -- ADDED likes_count
                        {$currentUserLikedSubQuery} as currentUserLiked, -- ADDED check if current user liked
                        u.username as reviewer_username, 
                        u.profile_image as reviewerAvatarUrl,
                        p.title as productName, 
                        {$imageSubQuery} as product_image_url
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                JOIN products p ON r.product_id = p.id
                ORDER BY r.created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':currentUserId', $currentUserId, PDO::PARAM_INT); // Bind for subquery
    } else {
        $sql = "SELECT r.id, r.user_id, r.product_id, r.rating, r.review_text, r.created_at as date,
                        r.likes_count, -- ADDED likes_count
                        {$currentUserLikedSubQuery} as currentUserLiked, -- ADDED check if current user liked
                        u.username as reviewer_username,
                        u.profile_image as reviewerAvatarUrl,
                        p.title as productName, 
                        {$imageSubQuery} as product_image_url
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                JOIN products p ON r.product_id = p.id
                WHERE r.user_id = :requestingUserId 
                ORDER BY r.created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':requestingUserId', $currentUserId, PDO::PARAM_INT); // User's own reviews
        $stmt->bindParam(':currentUserId', $currentUserId, PDO::PARAM_INT); // Bind for subquery
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
            // 'helpful' => 0, // You can decide if you still need this
            // 'verified' => false, 
            'productId' => $review['product_id'],
            'userId' => $review['user_id'],
            'reviewerUsername' => $review['reviewer_username'] ?? null,
            'reviewerAvatarUrl' => $review['reviewerAvatarUrl'] ?? null,
            'likes_count' => (int)$review['likes_count'], // ADDED
            'currentUserLiked' => (bool)$review['currentUserLiked'] // ADDED
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