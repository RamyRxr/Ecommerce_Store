<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'message' => 'User not authenticated']);
    exit;
}

$userId = $_SESSION['user']['id'];
$isAdmin = (bool)$_SESSION['user']['is_admin'];

$db = new Database();
$conn = $db->getConnection();

$reviews = [];
$message = '';
$success = false;

try {
    if ($isAdmin) {
        $sql = "SELECT r.id, r.user_id, r.product_id, r.rating, r.review_text, r.created_at as date, r.helpful_count as helpful, r.is_verified as verified,
                        u.username as reviewer_username, 
                        p.title as productName, 
                        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order ASC, pi.id ASC LIMIT 1) as product_image_url
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                JOIN products p ON r.product_id = p.id
                ORDER BY r.created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
    } else {
        // Regular user: Get only their reviews, join with products for product details
        // Fetch image_url from product_images table using a subquery
        $sql = "SELECT r.id, r.user_id, r.product_id, r.rating, r.review_text, r.created_at as date, r.helpful_count as helpful, r.is_verified as verified,
                        p.title as productName, 
                        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order ASC, pi.id ASC LIMIT 1) as product_image_url
                FROM reviews r
                JOIN products p ON r.product_id = p.id
                WHERE r.user_id = ?
                ORDER BY r.created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$userId]);
    }
    
    $fetchedReviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach($fetchedReviews as $review) {
        $productImage = null;
        if (!empty($review['product_image_url'])) {
            $productImage = '../backend/' . $review['product_image_url'];
        } else {
            $productImage = '../assets/images/products-images/default.png';
        }

        $reviews[] = [
            'id' => $review['id'],
            'productName' => $review['productName'],
            'productImage' => $productImage,
            'rating' => (int)$review['rating'],
            'date' => date('F j, Y', strtotime($review['date'])),
            'reviewText' => $review['review_text'],
            'helpful' => (int)($review['helpful'] ?? 0),
            'verified' => (bool)($review['verified'] ?? false),
            'productId' => $review['product_id'],
            'userId' => $review['user_id'],
            'reviewerUsername' => $isAdmin ? ($review['reviewer_username'] ?? 'Unknown') : null
        ];
    }
    $success = true;

} catch (PDOException $e) {
    $message = 'Database error: ' . $e->getMessage();
    error_log('PDOException - get_reviews: ' . $e->getMessage());
} catch (Exception $e) {
    $message = 'Server error: ' . $e->getMessage();
    error_log('Exception - get_reviews: ' . $e->getMessage());
}

echo json_encode(['success' => $success, 'reviews' => $reviews, 'message' => $message]);
?>