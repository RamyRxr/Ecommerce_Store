<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

$response = ['success' => false, 'reviews' => [], 'message' => 'An error occurred.'];
$currentUserId = $_SESSION['user']['id'] ?? null;

if (!isset($_GET['product_id'])) {
    $response['message'] = 'Product ID is required.';
    http_response_code(400);
    echo json_encode($response);
    exit;
}

$productId = filter_var($_GET['product_id'], FILTER_VALIDATE_INT);

if ($productId === false) {
    $response['message'] = 'Invalid Product ID.';
    http_response_code(400);
    echo json_encode($response);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    $currentUserLikedSubQuery = $currentUserId 
        ? "(EXISTS(SELECT 1 FROM review_likes rl WHERE rl.review_id = r.id AND rl.user_id = :currentUserId))" 
        : "0";

    $sql = "SELECT 
                r.id, 
                r.user_id, 
                r.product_id, 
                r.rating, 
                r.review_text, 
                r.created_at as date,
                r.likes_count, 
                {$currentUserLikedSubQuery} as currentUserLiked, 
                u.username as reviewerUsername, 
                u.profile_image as reviewerAvatarUrl,
                p.title as productName
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
            WHERE r.product_id = :productId
            ORDER BY r.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':productId', $productId, PDO::PARAM_INT);
    if ($currentUserId) {
        $stmt->bindParam(':currentUserId', $currentUserId, PDO::PARAM_INT);
    }
    
    $stmt->execute();
    $fetchedReviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $reviewsOutput = [];
    foreach($fetchedReviews as $review) {
        $reviewsOutput[] = [
            'id' => $review['id'],
            'productName' => $review['productName'],
            'rating' => (int)$review['rating'],
            'date' => date('F j, Y', strtotime($review['date'])),
            'reviewText' => $review['review_text'], 
            'productId' => $review['product_id'],
            'userId' => $review['user_id'],
            'reviewerUsername' => $review['reviewerUsername'] ?? null,
            'reviewerAvatarUrl' => $review['reviewerAvatarUrl'] ?? null,
            'likes_count' => (int)$review['likes_count'],
            'currentUserLiked' => (bool)$review['currentUserLiked'] 
        ];
    }

    $response['success'] = true;
    $response['reviews'] = $reviewsOutput;
    $response['message'] = count($reviewsOutput) > 0 ? 'Reviews fetched successfully.' : 'No reviews found for this product.';

} catch (PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
    error_log('PDOException - get_product_reviews: ' . $e->getMessage());
    http_response_code(500);
} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
    error_log('Exception - get_product_reviews: ' . $e->getMessage());
    http_response_code(500);
}

echo json_encode($response);
?>