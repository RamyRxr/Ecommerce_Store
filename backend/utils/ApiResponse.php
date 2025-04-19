<?php
class ApiResponse {
    // Send JSON response
    public static function send($status, $message = "", $data = []) {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => $status,
            'message' => $message,
            'data' => $data
        ]);
        exit;
    }
    
    // Send error response
    public static function error($message = "An error occurred", $code = 400) {
        http_response_code($code);
        self::send(false, $message);
    }
    
    // Send success response
    public static function success($message = "Success", $data = []) {
        http_response_code(200);
        self::send(true, $message, $data);
    }
}
?>