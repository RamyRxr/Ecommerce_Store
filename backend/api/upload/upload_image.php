<?php
header('Content-Type: application/json');
session_start();

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }
    
    if (!isset($_SESSION['user']['is_admin']) || $_SESSION['user']['is_admin'] !== true) {
        throw new Exception('Unauthorized access. Admin privileges required.');
    }

    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('No image file uploaded or upload error');
    }
    
    $uploadDir = '../../../uploads/products/';
    
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $filename = uniqid() . '_' . basename($_FILES['image']['name']);
    $targetFile = $uploadDir . $filename;
    
    $imageFileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
    $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!in_array($imageFileType, $allowedTypes)) {
        throw new Exception('Only JPG, JPEG, PNG, GIF, and WEBP files are allowed');
    }
    
    if ($_FILES['image']['size'] > 5000000) {
        throw new Exception('File is too large (max 5MB)');
    }
    
    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
        echo json_encode([
            'success' => true,
            'image_url' => 'uploads/products/' . $filename,
            'message' => 'Image uploaded successfully'
        ]);
    } else {
        throw new Exception('Failed to upload image');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>