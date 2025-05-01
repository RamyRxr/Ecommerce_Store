DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS saved_items;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Will store hashed passwords
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50),
    phone VARCHAR(20),
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
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT,
    product_title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE product_listings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    image_url VARCHAR(255),
    condition_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
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


-- Insert sample user for testing
INSERT INTO users (username, email, password, first_name, last_name)
VALUES ('Ramy', 'test@example.com', 'Ramy2024', 'Test', 'User'); -- password is 'Ramy2024'



-- Insert 50 sample products with distributed seller_ids
INSERT INTO products (title, description, price, original_price, category, `condition`, brand, model, seller_id, rating, rating_count, is_sale, is_new) VALUES

('iPhone 13 Pro', '256GB, Graphite', 999.99, 1099.99, 'Smartphones', 'New', 'Apple', 'A2345', 2, 4.8, 125, false, true),
('Samsung Galaxy S21', '128GB, Phantom Black', 799.99, 899.99, 'Smartphones', 'New', 'Samsung', 'G991U', 2, 4.7, 98, true, true),
('Google Pixel 6', '128GB, Stormy Black', 599.99, 699.99, 'Smartphones', 'New', 'Google', 'GA02900', 2, 4.6, 75, false, true),
('OnePlus 9 Pro', '256GB, Morning Mist', 899.99, 969.99, 'Smartphones', 'New', 'OnePlus', 'LE2120', 2, 4.5, 62, true, true)


('MacBook Pro 14"', 'M1 Pro, 16GB RAM, 512GB SSD', 1999.99, 2199.99, 'Laptops', 'New', 'Apple', 'A2442', 3, 4.9, 156, false, true),
('Dell XPS 15', 'Intel i7, 32GB RAM, 1TB SSD', 1799.99, 1999.99, 'Laptops', 'New', 'Dell', 'XPS9510', 3, 4.7, 92, true, true),
('Lenovo ThinkPad X1', 'Intel i5, 16GB RAM, 512GB SSD', 1299.99, 1499.99, 'Laptops', 'New', 'Lenovo', 'X1C9', 3, 4.6, 78, false, true),
('HP Spectre x360', 'Intel i7, 16GB RAM, 1TB SSD', 1399.99, 1599.99, 'Laptops', 'New', 'HP', '14-ea0000', 3, 4.5, 65, true, true),
('ASUS ROG Zephyrus', 'AMD Ryzen 9, 32GB RAM, 1TB SSD', 1899.99, 2099.99, 'Laptops', 'New', 'ASUS', 'GA503', 3, 4.8, 112, false, true),

('Sony WH-1000XM4', 'Wireless Noise Cancelling', 349.99, 399.99, 'Headphones', 'New', 'Sony', 'WH1000XM4', 4, 4.8, 234, true, true),
('AirPods Pro', 'Active Noise Cancellation', 249.99, 279.99, 'Headphones', 'New', 'Apple', 'A2084', 4, 4.7, 189, false, true),
('Bose QC35 II', 'QuietComfort Wireless', 299.99, 349.99, 'Headphones', 'New', 'Bose', 'QC35II', 4, 4.6, 167, true, true),
('Jabra Elite 85t', 'True Wireless Earbuds', 229.99, 249.99, 'Headphones', 'New', 'Jabra', '85t', 4, 4.5, 98, false, true),
('Samsung Galaxy Buds Pro', 'Active Noise Cancelling', 199.99, 229.99, 'Headphones', 'New', 'Samsung', 'SM-R190', 4, 4.4, 145, true, true),

('iPad Pro 12.9"', 'M1 Chip, 256GB, Space Gray', 1099.99, 1199.99, 'Tablets', 'New', 'Apple', 'A2378', 5, 4.9, 178, false, true),
('Samsung Galaxy Tab S7+', '256GB, Mystic Black', 849.99, 949.99, 'Tablets', 'New', 'Samsung', 'SM-T970', 5, 4.7, 134, true, true),
('Microsoft Surface Pro 8', 'Intel i5, 8GB RAM, 256GB', 999.99, 1099.99, 'Tablets', 'New', 'Microsoft', '1X9-00001', 5, 4.6, 89, false, true),
('Lenovo Tab P11 Pro', '128GB, Slate Grey', 499.99, 599.99, 'Tablets', 'New', 'Lenovo', 'ZA7C', 5, 4.4, 67, true, true),
('iPad Air', '64GB, Sky Blue', 599.99, 649.99, 'Tablets', 'New', 'Apple', 'A2316', 5, 4.7, 156, false, true),

('Sony A7 III', 'Mirrorless Camera Body', 1999.99, 2199.99, 'Cameras', 'New', 'Sony', 'ILCE-7M3', 2, 4.8, 198, true, true),
('Canon EOS R6', 'Mirrorless Camera Body', 2499.99, 2699.99, 'Cameras', 'New', 'Canon', 'R6', 2, 4.7, 145, false, true),
('Nikon Z6 II', 'Mirrorless Camera Body', 1999.99, 2199.99, 'Cameras', 'New', 'Nikon', 'Z6II', 2, 4.6, 112, true, true),
('Fujifilm X-T4', 'Mirrorless Camera Body', 1699.99, 1899.99, 'Cameras', 'New', 'Fujifilm', 'X-T4', 2, 4.7, 134, false, true),
('Sony RX100 VII', 'Compact Camera', 1299.99, 1399.99, 'Cameras', 'New', 'Sony', 'RX100M7', 2, 4.5, 89, true, true),

('Apple Watch Series 7', '45mm GPS + Cellular', 499.99, 549.99, 'Accessories', 'New', 'Apple', 'A2473', 3, 4.8, 234, false, true),
('Samsung Galaxy Watch 4', '44mm Bluetooth', 249.99, 299.99, 'Accessories', 'New', 'Samsung', 'SM-R870', 3, 4.6, 167, true, true),
('Apple Magic Keyboard', 'For iPad Pro 12.9"', 349.99, 399.99, 'Accessories', 'New', 'Apple', 'MJQK3LL/A', 3, 4.7, 145, false, true),
('Apple Pencil 2nd Gen', 'For iPad Pro/Air', 129.99, 149.99, 'Accessories', 'New', 'Apple', 'MU8F2AM/A', 3, 4.8, 198, true, true),
('Samsung S Pen Pro', 'For Galaxy Tablets', 99.99, 119.99, 'Accessories', 'New', 'Samsung', 'EJ-P5450', 3, 4.5, 78, false, true),

('iPhone 13', '128GB, Midnight', 799.99, 899.99, 'Smartphones', 'New', 'Apple', 'A2482', 4, 4.7, 167, true, true),
('Samsung Galaxy S21+', '256GB, Phantom Silver', 999.99, 1099.99, 'Smartphones', 'New', 'Samsung', 'G996U', 4, 4.6, 134, false, true),
('Google Pixel 6 Pro', '256GB, Cloudy White', 899.99, 999.99, 'Smartphones', 'New', 'Google', 'GA03149', 4, 4.7, 89, true, true),

('MacBook Air M1', '8GB RAM, 256GB SSD', 999.99, 1099.99, 'Laptops', 'New', 'Apple', 'A2337', 5, 4.8, 223, false, true),
('Dell XPS 13', 'Intel i5, 16GB RAM, 512GB SSD', 1299.99, 1499.99, 'Laptops', 'New', 'Dell', 'XPS9305', 5, 4.6, 156, true, true),
('Lenovo Yoga 9i', 'Intel i7, 16GB RAM, 1TB SSD', 1499.99, 1699.99, 'Laptops', 'New', 'Lenovo', '82BG000UUS', 5, 4.5, 98, false, true),

('Sony WF-1000XM4', 'True Wireless Earbuds', 279.99, 299.99, 'Headphones', 'New', 'Sony', 'WF1000XM4', 2, 4.7, 178, true, true),
('Bose 700', 'Noise Cancelling Headphones', 379.99, 399.99, 'Headphones', 'New', 'Bose', '794297-0100', 2, 4.6, 145, false, true),
('AirPods Max', 'Over-Ear Headphones', 549.99, 599.99, 'Headphones', 'New', 'Apple', 'A2096', 2, 4.5, 112, true, true),

('iPad Mini', '64GB, Starlight', 499.99, 549.99, 'Tablets', 'New', 'Apple', 'A2567', 3, 4.7, 134, false, true),
('Samsung Galaxy Tab S8', '128GB, Graphite', 699.99, 799.99, 'Tablets', 'New', 'Samsung', 'SM-X700', 3, 4.6, 98, true, true),
('Lenovo Tab P12 Pro', '256GB, Storm Grey', 699.99, 799.99, 'Tablets', 'New', 'Lenovo', 'ZA8W', 3, 4.5, 67, false, true),

('Canon EOS R5', 'Mirrorless Camera Body', 3899.99, 4099.99, 'Cameras', 'New', 'Canon', 'R5', 4, 4.9, 167, true, true),
('Sony A7S III', 'Mirrorless Camera Body', 3499.99, 3699.99, 'Cameras', 'New', 'Sony', 'ILCE-7SM3', 4, 4.8, 134, false, true),
('Nikon Z7 II', 'Mirrorless Camera Body', 2999.99, 3199.99, 'Cameras', 'New', 'Nikon', 'Z7II', 4, 4.7, 98, true, true),

('Samsung Galaxy Buds2', 'True Wireless Earbuds', 149.99, 169.99, 'Accessories', 'New', 'Samsung', 'SM-R177', 5, 4.5, 178, false, true),
('Apple AirTag', '4 Pack', 99.99, 119.99, 'Accessories', 'New', 'Apple', 'MX542AM/A', 5, 4.6, 223, true, true),
('Magic Mouse', 'Wireless Mouse', 79.99, 99.99, 'Accessories', 'New', 'Apple', 'MK2E3AM/A', 5, 4.4, 156, false, true);