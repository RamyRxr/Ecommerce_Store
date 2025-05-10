<?php
header('Content-Type: application/json');
session_start();

require_once '../../config/database.php';

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('User not logged in');
    }

    $userId = $_SESSION['user']['id'];
    $db = new Database();
    $conn = $db->getConnection();
    
    $action = $_POST['action'] ?? '';
    $response = ['success' => false];

    if ($action === 'update_personal') {
        if (empty($_POST['username']) || empty($_POST['first_name']) || 
            empty($_POST['last_name']) || empty($_POST['email'])) {
            throw new Exception('Required fields are missing');
        }

        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$_POST['email'], $userId]);
        if ($stmt->rowCount() > 0) {
            throw new Exception('Email already in use by another account.');
        }
        
        $stmtUser = $conn->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $stmtUser->execute([$_POST['username'], $userId]);
        if ($stmtUser->rowCount() > 0) {
            throw new Exception('Username already taken.');
        }

        $profileImagePath = null;
        $oldProfileImagePath = null;

        $stmtOldImage = $conn->prepare("SELECT profile_image FROM users WHERE id = ?");
        $stmtOldImage->execute([$userId]);
        $userRow = $stmtOldImage->fetch(PDO::FETCH_ASSOC);
        if ($userRow && $userRow['profile_image']) {
            $oldProfileImagePath = '../../' . $userRow['profile_image']; 
        }


        if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] == UPLOAD_ERR_OK) {
            $uploadDir = '../../uploads/avatars/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $fileExtension = strtolower(pathinfo($_FILES['profile_image']['name'], PATHINFO_EXTENSION));
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
            if (!in_array($fileExtension, $allowedExtensions)) {
                throw new Exception('Invalid image file type. Allowed types: JPG, JPEG, PNG, GIF.');
            }

            if ($_FILES['profile_image']['size'] > 2 * 1024 * 1024) { 
                throw new Exception('Image file size exceeds 2MB limit.');
            }
            
            $fileName = uniqid('avatar_', true) . '.' . $fileExtension;
            $targetFilePath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $targetFilePath)) {
                $profileImagePath = 'uploads/avatars/' . $fileName; 

                if ($oldProfileImagePath && file_exists($oldProfileImagePath) && $oldProfileImagePath !== '../../' . $profileImagePath) {
                    unlink($oldProfileImagePath);
                }
            } else {
                throw new Exception('Failed to upload profile image.');
            }
        }

        $sql = "UPDATE users SET 
                    username = :username, 
                    first_name = :first_name, 
                    last_name = :last_name, 
                    email = :email, 
                    phone = :phone";
        
        $params = [
            ':username' => $_POST['username'],
            ':first_name' => $_POST['first_name'],
            ':last_name' => $_POST['last_name'],
            ':email' => $_POST['email'],
            ':phone' => $_POST['phone'] ?? null,
            ':id' => $userId
        ];

        if ($profileImagePath !== null) {
            $sql .= ", profile_image = :profile_image";
            $params[':profile_image'] = $profileImagePath;
        }
        
        $sql .= " WHERE id = :id";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount()) {
            $response['success'] = true;
            $response['message'] = 'Personal information updated successfully.';
            $response['updated_user'] = [
                'username' => $_POST['username'],
                'profile_image' => $profileImagePath ?? ($userRow ? $userRow['profile_image'] : null)
            ];
        } else {
            if ($profileImagePath === null && $stmt->errorInfo()[0] == "00000") {
                    $response['success'] = true;
                    $response['message'] = 'Personal information is already up to date.';
                    $response['updated_user'] = [ 
                        'username' => $_POST['username'],
                        'profile_image' => $userRow ? $userRow['profile_image'] : null
                ];
            } else {
                throw new Exception('Failed to update personal information or no changes were made.');
            }
        }

    } elseif ($action === 'update_shipping') {
        if (empty($_POST['address']) || empty($_POST['city']) || 
            empty($_POST['state']) || empty($_POST['zip_code']) || empty($_POST['country'])) {
            throw new Exception('Required shipping fields are missing');
        }

        $stmt = $conn->prepare("UPDATE users SET 
                                    address = :address, 
                                    city = :city, 
                                    state = :state, 
                                    zip_code = :zip_code, 
                                    country = :country 
                                WHERE id = :id");
        $stmt->execute([
            ':address' => $_POST['address'],
            ':city' => $_POST['city'],
            ':state' => $_POST['state'],
            ':zip_code' => $_POST['zip_code'],
            ':country' => $_POST['country'],
            ':id' => $userId
        ]);

        if ($stmt->rowCount()) {
            $response['success'] = true;
            $response['message'] = 'Shipping address updated successfully.';
        } else {
            throw new Exception('Failed to update shipping address or no changes were made.');
        }
    } else {
        throw new Exception('Invalid action specified.');
    }

} catch (PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
    error_log("PDOException in update_account.php: " . $e->getMessage());
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    error_log("Exception in update_account.php: " . $e->getMessage());
}

echo json_encode($response);
?>