<?php
// Test API connection
header('Content-Type: text/html');
require_once 'api/config.php';  // Fixed path

echo "<h1>API Connection Test</h1>";

try {
    $conn = getDbConnection();
    echo "<p style='color:green'>✓ Database connected successfully!</p>";
    
    // Test query
    $stmt = $conn->query("SELECT COUNT(*) FROM users");
    $userCount = $stmt->fetchColumn();
    
    echo "<p>User count: $userCount</p>";
    
    // Table structure
    echo "<h2>Database Tables:</h2>";
    $stmt = $conn->query("SHOW TABLES");
    echo "<ul>";
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        echo "<li>$row[0]</li>";
    }
    echo "</ul>";
    
    // Sample user data
    echo "<h2>Sample User Data:</h2>";
    $stmt = $conn->query("SELECT user_id, username, email, first_name, last_name, role FROM users LIMIT 3");
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>Username</th><th>Email</th><th>Name</th><th>Role</th></tr>";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "<tr>";
        echo "<td>{$row['user_id']}</td>";
        echo "<td>{$row['username']}</td>";
        echo "<td>{$row['email']}</td>";
        echo "<td>{$row['first_name']} {$row['last_name']}</td>";
        echo "<td>{$row['role']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (PDOException $e) {
    echo "<p style='color:red'>✗ Database connection failed: " . $e->getMessage() . "</p>";
}
?>