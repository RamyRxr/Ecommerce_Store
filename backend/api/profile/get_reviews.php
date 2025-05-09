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
    // This subquery fetches the image_url from the 'product_images' table (aliased as pi)
    // by matching its 'product_id' with the 'id' of the product (aliased as p).
    // It orders by 'display_order' and then 'id' to get a consistent image if multiple exist.
    $imageSubQuery = "(SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order ASC, pi.id ASC LIMIT 1)";

    if ($isAdmin) {
        // Admin: Get all reviews
        $sql = "SELECT r.id, r.user_id, r.product_id, r.rating, r.review_text, r.created_at as date,
                        u.username as reviewer_username, 
                        p.title as productName, 
                        {$imageSubQuery} as product_image_url -- The result of the subquery is named 'product_image_url'
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                JOIN products p ON r.product_id = p.id -- Joins reviews with products
                ORDER BY r.created_at DESC";
        $stmt = $conn->prepare($sql);
    } else {
        // Regular user: Get only their reviews
        $sql = "SELECT r.id, r.user_id, r.product_id, r.rating, r.review_text, r.created_at as date,
                        p.title as productName, 
                        {$imageSubQuery} as product_image_url -- The result of the subquery is named 'product_image_url'
                FROM reviews r
                JOIN products p ON r.product_id = p.id -- Joins reviews with products
                WHERE r.user_id = :userId
                ORDER BY r.created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    }
    
    $stmt->execute();
    $fetchedReviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach($fetchedReviews as $review) {
        // $review['product_image_url'] contains the image_url fetched by the subquery from product_images,
        // or NULL if no image was found for that product in the product_images table.
        $rawProductImageFromDb = $review['product_image_url'];
        $productImageToReturn;

        if (!empty($rawProductImageFromDb)) {
            // Send the raw path/filename as stored in the database (e.g., "image.jpg" or "uploads/products/image.jpg").
            $productImageToReturn = $rawProductImageFromDb;
        } else {
            // If no image in DB (subquery returned NULL), use the frontend-relative placeholder path.
            $productImageToReturn = '../assets/images/products-images/default.png';
        }

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
            'userId' => $review['user_id'],
            'reviewerUsername' => $isAdmin && isset($review['reviewer_username']) ? $review['reviewer_username'] : null
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