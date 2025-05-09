<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

$response = ['success' => false, 'message' => 'An error occurred.'];
$conn = null;

if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    http_response_code(401);
    $response['message'] = 'User not authenticated';
    echo json_encode($response);
    exit;
}

$userId = $_SESSION['user']['id'];
$isAdmin = isset($_SESSION['user']['is_admin']) ? (bool)$_SESSION['user']['is_admin'] : false;

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['review_id']) || !isset($data['rating']) || !isset($data['review_text'])) {
    http_response_code(400);
    $response['message'] = 'Missing review data.';
    echo json_encode($response);
    exit;
}

$reviewId = $data['review_id'];
$rating = (int)$data['rating'];
$reviewText = trim($data['review_text']);

if (empty($reviewText) || $rating < 1 || $rating > 5) {
    http_response_code(400);
    $response['message'] = 'Invalid review data. Rating must be 1-5 and text non-empty.';
    echo json_encode($response);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    $conn->beginTransaction();

    $stmtCheck = $conn->prepare("SELECT user_id, product_id FROM reviews WHERE id = ?");
    $stmtCheck->execute([$reviewId]);
    $review = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if (!$review) {
        http_response_code(404);
        $response['message'] = 'Review not found.';
    } elseif ($review['user_id'] == $userId || $isAdmin) {
        $productId = $review['product_id'];

        $stmtUpdate = $conn->prepare("UPDATE reviews SET rating = ?, review_text = ?, updated_at = NOW() WHERE id = ?");
        if ($stmtUpdate->execute([$rating, $reviewText, $reviewId])) {
            
            $updateProductRatingSql = "
                UPDATE products p
                SET 
                    rating = (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id),
                    rating_count = (SELECT COUNT(r.id) FROM reviews r WHERE r.product_id = p.id)
                WHERE p.id = :product_id
            ";
            $updateProductRatingStmt = $conn->prepare($updateProductRatingSql);
            $updateProductRatingStmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
            $updateProductRatingStmt->execute();

            $conn->commit();
            $response['success'] = true;
            $response['message'] = 'Review updated successfully and product rating recalculated.';
            
            $stmtProd = $conn->prepare("SELECT name FROM products WHERE id = ?");
            $stmtProd->execute([$productId]);
            $product = $stmtProd->fetch(PDO::FETCH_ASSOC);
            $response['productName'] = $product ? $product['name'] : 'the product';
        } else {
            $conn->rollBack();
            http_response_code(500);
            $response['message'] = 'Failed to update review.';
        }
    } else {
        $conn->rollBack();
        http_response_code(403);
        $response['message'] = 'You are not authorized to update this review.';
    }

} catch (PDOException $e) {
    if ($conn && $conn->inTransaction()) $conn->rollBack();
    http_response_code(500);
    $response['message'] = 'Database error: ' . $e->getMessage();
    error_log('PDOException - update_review: ' . $e->getMessage());
} catch (Exception $e) {
    if ($conn && $conn->inTransaction()) $conn->rollBack();
    http_response_code(500);
    $response['message'] = 'Server error: ' . $e->getMessage();
    error_log('Exception - update_review: ' . $e->getMessage());
}

echo json_encode($response);
?>