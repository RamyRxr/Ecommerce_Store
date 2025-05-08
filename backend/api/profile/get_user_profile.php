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

$response = [
    'success' => false,
    'userData' => [],
    'userStats' => [],
    'adminStats' => []
];

try {
    // Fetch basic user data using the actual column names from your schema
    $stmt = $conn->prepare("SELECT id, username, email, first_name, last_name, profile_image, address, city, state, zip_code, country, created_at FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $response['userData'] = [
            'id' => $user['id'],
            'name' => trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '')) ?: $user['username'],
            'username' => $user['username'],
            // Ensure the path is correct based on where you store images and how your web server is configured
            'image' => $user['profile_image'] ? '../backend/' . $user['profile_image'] : '../assets/images/general-image/RamyRxr.png', 
            // Construct a display address. The frontend might need adjustment if it expects a very specific format.
            'address' => trim(implode(', ', array_filter([$user['city'], $user['state']]))), // Simplified display address
            'fullAddress' => [ // Provide the full address components
                'street' => $user['address'], // Using the 'address' column for street
                'city' => $user['city'],
                'state' => $user['state'],
                'zip' => $user['zip_code'],
                'country' => $user['country']
            ],
            'memberSince' => $user['created_at'] ? date('F Y', strtotime($user['created_at'])) : 'N/A',
            'email' => $user['email'],
            'joinDate' => $user['created_at'] ? date('F j, Y', strtotime($user['created_at'])) : 'N/A',
            'isAdmin' => $isAdmin
        ];

        // User-specific stats
        $stmtOrders = $conn->prepare("SELECT COUNT(*) as count FROM orders WHERE user_id = ?");
        $stmtOrders->execute([$userId]);
        $response['userStats']['ordersCount'] = (int)$stmtOrders->fetchColumn();

        $stmtReviews = $conn->prepare("SELECT COUNT(*) as count FROM reviews WHERE user_id = ?");
        $stmtReviews->execute([$userId]);
        $response['userStats']['reviewsCount'] = (int)$stmtReviews->fetchColumn();

        if (!$isAdmin) {
            $stmtSaved = $conn->prepare("SELECT COUNT(*) as count FROM saved_items WHERE user_id = ?");
            $stmtSaved->execute([$userId]);
            $response['userStats']['savedItemsCount'] = (int)$stmtSaved->fetchColumn();
        }

        // Admin-specific stats (if applicable)
        if ($isAdmin) {
            $stmtTotalOrders = $conn->prepare("SELECT COUNT(*) as count FROM orders");
            $stmtTotalOrders->execute();
            $response['adminStats']['totalOrdersCount'] = (int)$stmtTotalOrders->fetchColumn();

            $stmtTotalReviews = $conn->prepare("SELECT COUNT(*) as count FROM reviews");
            $stmtTotalReviews->execute();
            $response['adminStats']['totalReviewsCount'] = (int)$stmtTotalReviews->fetchColumn();
            
            $stmtTotalListed = $conn->prepare("SELECT COUNT(*) as count FROM products"); // Assuming 'products' table represents listed items
            $stmtTotalListed->execute();
            $response['adminStats']['totalListedItemsCount'] = (int)$stmtTotalListed->fetchColumn();
        }
        $response['success'] = true;
    } else {
        $response['message'] = 'User not found.';
    }

} catch (PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
    error_log('PDOException - get_user_profile: ' . $e->getMessage());
} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
    error_log('Exception - get_user_profile: ' . $e->getMessage());
}

echo json_encode($response);
?>