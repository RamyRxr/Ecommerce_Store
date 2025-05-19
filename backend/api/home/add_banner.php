<?php
session_start();
require_once '../../config/database.php';
header('Content-Type: application/json');
if (!isset($_SESSION['user']) || !$_SESSION['user']['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}
if (!isset($_FILES['banner'])) {
    echo json_encode(['success' => false, 'message' => 'No file uploaded']);
    exit;
}
$uploadDir = '../../../uploads/banner/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
$file = $_FILES['banner'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (!in_array($ext, $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Invalid file type']);
    exit;
}
$filename = uniqid('banner_', true) . '.' . $ext;
$target = $uploadDir . $filename;
if (move_uploaded_file($file['tmp_name'], $target)) {
    // Only save the filename, not the original path
    $url = "uploads/banner/$filename";
    $db = new Database();
    $conn = $db->getConnection();
    $stmt = $conn->prepare("INSERT INTO banners (image_url) VALUES (?)");
    $stmt->execute([$url]);
    echo json_encode(['success' => true, 'url' => $url]);
} else {
    echo json_encode(['success' => false, 'message' => 'Upload failed']);
}