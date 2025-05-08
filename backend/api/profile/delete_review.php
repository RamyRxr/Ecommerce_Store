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

if (!isset($data['review_id'])) {
    echo json_encode(['success' => false, 'message' => 'Review ID not provided.']);
    exit;
}

$reviewId = $data['review_id'];

$db = new Database();
$conn = $db->getConnection();
$response = ['success' => false];

try {
    // Check if the review belongs to the user or if the user is an admin
    $stmtCheck = $conn->prepare("SELECT user_id FROM reviews WHERE id = ?");
    $stmtCheck->execute([$reviewId]);
    $review = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if (!$review) {
        $response['message'] = 'Review not found.';
    } elseif ($review['user_id'] == $userId || $isAdmin) {
        $stmtDelete = $conn->prepare("DELETE FROM reviews WHERE id = ?");
        if ($stmtDelete->execute([$reviewId])) {
            $response['success'] = true;
            $response['message'] = 'Review deleted successfully.';
        } else {
            $response['message'] = 'Failed to delete review.';
        }
    } else {
        $response['message'] = 'You are not authorized to delete this review.';
    }

} catch (PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
    error_log('PDOException - delete_review: ' . $e->getMessage());
} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
    error_log('Exception - delete_review: ' . $e->getMessage());
}

echo json_encode($response);
?>