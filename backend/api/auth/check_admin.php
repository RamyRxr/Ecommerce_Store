<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        echo json_encode(['is_admin' => false]);
        exit;
    }

    $userId = $_SESSION['user']['id'];
    $db = new Database();
    $conn = $db->getConnection();

    $stmt = $conn->prepare("SELECT is_admin FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && isset($user['is_admin'])) {
        echo json_encode(['is_admin' => (bool)$user['is_admin']]);
    } else {
        echo json_encode(['is_admin' => false]);
    }
    
} catch (Exception $e) {
    echo json_encode(['is_admin' => false, 'error' => $e->getMessage()]);
}
?>