<?php
// Handle authentication requests (login, signup, etc.)
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../models/User.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize user object
$user = new User($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure data is not empty
if (!empty($data->action)) {
    
    switch($data->action) {
        case 'login':
            if (!empty($data->email) && !empty($data->password)) {
                $user->email = $data->email;
                
                // Check if user exists and password is correct
                if ($user->login($data->password)) {
                    echo json_encode(array(
                        "success" => true,
                        "message" => "Login successful",
                        "user" => array(
                            "id" => $user->id,
                            "name" => $user->name,
                            "email" => $user->email
                        )
                    ));
                } else {
                    echo json_encode(array(
                        "success" => false,
                        "message" => "Invalid email or password"
                    ));
                }
            } else {
                echo json_encode(array(
                    "success" => false,
                    "message" => "Email and password are required"
                ));
            }
            break;
            
        case 'signup':
            // Handle signup logic
            break;
            
        default:
            echo json_encode(array(
                "success" => false,
                "message" => "Invalid action"
            ));
    }
} else {
    echo json_encode(array(
        "success" => false,
        "message" => "Action is required"
    ));
}
?>