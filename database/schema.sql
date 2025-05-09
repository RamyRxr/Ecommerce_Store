-- Drop tables if they exist
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS saved_items;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS sold_items;
DROP TABLE IF EXISTS order_ratings;
DROP TABLE IF EXISTS cancelled_orders_log;


-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Will store hashed passwords
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    profile_image VARCHAR(255) DEFAULT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50),
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE, -- Added admin flag
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    category VARCHAR(50) NOT NULL,
    `condition` VARCHAR(50) NOT NULL, -- Fixed: backticks around reserved keyword
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 1, -- Added quantity field
    status VARCHAR(20) DEFAULT 'active', -- active, draft, sold
    shipping BOOLEAN DEFAULT TRUE,
    local_pickup BOOLEAN DEFAULT FALSE,
    seller_id INT,
    views INT DEFAULT 0,
    rating DECIMAL(3, 1) DEFAULT 0,
    rating_count INT DEFAULT 0,
    is_sale BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create product images table (for multiple images per product)
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create reviews table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create order_ratings table
CREATE TABLE order_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY `uniq_order_user_rating` (`order_id`, `user_id`) -- Ensures a user can rate an order only once
);

-- Create saved items table
CREATE TABLE saved_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE (user_id, product_id)  -- Prevent duplicate saved items
);

-- Create cart items table
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE (user_id, product_id)  -- Prevent duplicate cart items
);

-- Create orders table
CREATE TABLE orders (
    id VARCHAR(20) PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    shipping_method VARCHAR(50) NOT NULL,
    shipping_cost DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(50) NOT NULL,
    shipping_zip VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', 
    shipped_date TIMESTAMP NULL DEFAULT NULL,
    actual_delivery_date TIMESTAMP NULL DEFAULT NULL, 
    cancellation_reason TEXT NULL,                 
    cancellation_date TIMESTAMP NULL DEFAULT NULL,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL,
    product_id INT,
    product_title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Create payment methods table
CREATE TABLE payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_type VARCHAR(50) NOT NULL,
    last_four VARCHAR(4) NOT NULL,
    expiry_month VARCHAR(2) NOT NULL,
    expiry_year VARCHAR(2) NOT NULL,
    card_holder VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create user settings table
CREATE TABLE user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_updates BOOLEAN DEFAULT TRUE,
    promotions BOOLEAN DEFAULT TRUE,
    newsletter BOOLEAN DEFAULT FALSE,
    product_updates BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(10) DEFAULT 'usd',
    timezone VARCHAR(50) DEFAULT 'utc',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create sold_items table
CREATE TABLE sold_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_item_id INT NOT NULL, -- Reference to the specific item in an order
    product_id INT NOT NULL,
    order_id VARCHAR(20) NOT NULL,
    seller_id INT NOT NULL,
    buyer_id INT NOT NULL,
    sold_price DECIMAL(10, 2) NOT NULL,
    quantity_sold INT NOT NULL,
    sold_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Records when it was marked as part of a delivered order
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, -- Consider ON DELETE SET NULL if products can be deleted but sales history should remain
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add this new table definition
CREATE TABLE cancelled_orders_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL, -- Increased length to match orders.id
    user_id INT,
    cancellation_reason TEXT,
    cancellation_initiator ENUM('user', 'admin', 'system') DEFAULT 'user', -- To track who cancelled
    cancelled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    original_order_data JSON, 
    KEY idx_cancelled_order_id (order_id),
    KEY idx_cancelled_user_id (user_id)   
);



-- Add indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_saved_items_user ON saved_items(user_id);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX idx_user_settings_user ON user_settings(user_id);
CREATE INDEX idx_reviews_user_product ON reviews(user_id, product_id);
CREATE INDEX idx_order_ratings_order_user ON order_ratings(order_id, user_id);


-- Ramy as admin
INSERT INTO users (username, email, password, first_name, last_name, is_admin)
VALUES ('Ramy', 'test@example.com', 'Ramy2024', 'Test', 'User', TRUE);

-- Rey as regular user
INSERT INTO users (username, email, password, first_name, last_name, is_admin)
VALUES ('Rey', 'rey@example.com', 'Rey2024', 'Regular', 'User', FALSE);
