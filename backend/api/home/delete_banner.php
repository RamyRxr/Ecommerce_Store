<?php
session_start();
require_once '../../config/database.php';
header('Content-Type: application/json');
if (!isset($_SESSION['user']) || !$_SESSION['user']['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}
$id = $_GET['id'] ?? $_POST['id'] ?? null;
if (!$id) {
    echo json_encode(['success' => false, 'message' => 'No banner id']);
    exit;
}
$db = new Database();
$conn = $db->getConnection();
$stmt = $conn->prepare("SELECT image_url FROM banners WHERE id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if ($row) {
    $file = '../../../' . $row['image_url'];
    if (file_exists($file)) unlink($file);
    $del = $conn->prepare("DELETE FROM banners WHERE id = ?");
    $del->execute([$id]);
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Banner not found']);
}