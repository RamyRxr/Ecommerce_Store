<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php'; // Adjust path as needed

if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'message' => 'User not authenticated. Please log in.']);
    exit;
}

$currentUserId = $_SESSION['user']['id'];

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['review_id'])) {
    echo json_encode(['success' => false, 'message' => 'Review ID not provided.']);
    exit;
}

$reviewId = filter_var($input['review_id'], FILTER_VALIDATE_INT);

if ($reviewId === false) {
    echo json_encode(['success' => false, 'message' => 'Invalid Review ID.']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

try {
    $conn->beginTransaction();

    // Check if the user has already liked this review
    $sqlCheck = "SELECT id FROM review_likes WHERE review_id = :review_id AND user_id = :user_id";
    $stmtCheck = $conn->prepare($sqlCheck);
    $stmtCheck->bindParam(':review_id', $reviewId, PDO::PARAM_INT);
    $stmtCheck->bindParam(':user_id', $currentUserId, PDO::PARAM_INT);
    $stmtCheck->execute();
    $existingLike = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    $currentUserLiked = false;

    if ($existingLike) {
        // User has liked it, so unlike it
        $sqlDeleteLike = "DELETE FROM review_likes WHERE id = :like_id";
        $stmtDeleteLike = $conn->prepare($sqlDeleteLike);
        $stmtDeleteLike->bindParam(':like_id', $existingLike['id'], PDO::PARAM_INT);
        $stmtDeleteLike->execute();

        $sqlUpdateReview = "UPDATE reviews SET likes_count = GREATEST(0, likes_count - 1) WHERE id = :review_id";
        $currentUserLiked = false;
    } else {
        // User has not liked it, so like it
        $sqlInsertLike = "INSERT INTO review_likes (review_id, user_id) VALUES (:review_id, :user_id)";
        $stmtInsertLike = $conn->prepare($sqlInsertLike);
        $stmtInsertLike->bindParam(':review_id', $reviewId, PDO::PARAM_INT);
        $stmtInsertLike->bindParam(':user_id', $currentUserId, PDO::PARAM_INT);
        $stmtInsertLike->execute();

        $sqlUpdateReview = "UPDATE reviews SET likes_count = likes_count + 1 WHERE id = :review_id";
        $currentUserLiked = true;
    }

    $stmtUpdateReview = $conn->prepare($sqlUpdateReview);
    $stmtUpdateReview->bindParam(':review_id', $reviewId, PDO::PARAM_INT);
    $stmtUpdateReview->execute();

    // Get the new likes count
    $sqlGetLikes = "SELECT likes_count FROM reviews WHERE id = :review_id";
    $stmtGetLikes = $conn->prepare($sqlGetLikes);
    $stmtGetLikes->bindParam(':review_id', $reviewId, PDO::PARAM_INT);
    $stmtGetLikes->execute();
    $updatedReview = $stmtGetLikes->fetch(PDO::FETCH_ASSOC);

    $conn->commit();

    echo json_encode([
        'success' => true, 
        'message' => $currentUserLiked ? 'Review liked!' : 'Review unliked!',
        'likes_count' => $updatedReview ? (int)$updatedReview['likes_count'] : 0,
        'currentUserLiked' => $currentUserLiked
    ]);

} catch (PDOException $e) {
    $conn->rollBack();
    error_log("Like Review PDOException: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error processing like.']);
} catch (Exception $e) {
    $conn->rollBack();
    error_log("Like Review Exception: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred.']);
}
?>