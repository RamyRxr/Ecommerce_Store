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

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['review_id']) || !isset($data['rating']) || !isset($data['review_text'])) {
    echo json_encode(['success' => false, 'message' => 'Missing review data.']);
    exit;
}

$reviewId = $data['review_id'];
$rating = (int)$data['rating'];
$reviewText = trim($data['review_text']);

if (empty($reviewText) || $rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'message' => 'Invalid review data.']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();
$response = ['success' => false];

try {
    // Check if the review belongs to the user or if the user is an admin
    $stmtCheck = $conn->prepare("SELECT user_id, product_id FROM reviews WHERE id = ?");
    $stmtCheck->execute([$reviewId]);
    $review = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if (!$review) {
        $response['message'] = 'Review not found.';
    } elseif ($review['user_id'] == $userId || $isAdmin) {
        $stmtUpdate = $conn->prepare("UPDATE reviews SET rating = ?, review_text = ?, updated_at = NOW() WHERE id = ?");
        if ($stmtUpdate->execute([$rating, $reviewText, $reviewId])) {
            $response['success'] = true;
            $response['message'] = 'Review updated successfully.';
            
            // Optionally, fetch product name to return for notification
            $stmtProd = $conn->prepare("SELECT name FROM products WHERE id = ?");
            $stmtProd->execute([$review['product_id']]);
            $product = $stmtProd->fetch(PDO::FETCH_ASSOC);
            $response['productName'] = $product ? $product['name'] : 'the product';

        } else {
            $response['message'] = 'Failed to update review.';
        }
    } else {
        $response['message'] = 'You are not authorized to update this review.';
    }

} catch (PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
    error_log('PDOException - update_review: ' . $e->getMessage());
} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
    error_log('Exception - update_review: ' . $e->getMessage());
}

echo json_encode($response);
?>