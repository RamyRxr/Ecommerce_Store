DELIMITER //

CREATE OR REPLACE PROCEDURE FinalizeOrder(
    IN p_user_id INT,
    IN p_total_price DECIMAL(10, 2),
    IN p_shipping_method VARCHAR(50),
    IN p_shipping_cost DECIMAL(10, 2),
    IN p_shipping_address TEXT,
    IN p_shipping_city VARCHAR(100),
    IN p_shipping_state VARCHAR(100),
    IN p_shipping_zip VARCHAR(20),   
    IN p_shipping_country VARCHAR(100),
    IN p_payment_method VARCHAR(50),
    IN p_items_json JSON,
    OUT p_generated_order_id VARCHAR(50) 
)
BEGIN
    DECLARE v_order_count INT;
    DECLARE v_order_number_suffix VARCHAR(2);
    DECLARE v_new_order_id VARCHAR(50);
    DECLARE i INT DEFAULT 0;
    DECLARE items_count INT;
    DECLARE v_product_id INT;
    DECLARE v_quantity INT;
    DECLARE v_title VARCHAR(255);
    DECLARE v_price DECIMAL(10,2);

    SELECT COUNT(*) INTO v_order_count FROM orders WHERE user_id = p_user_id;
    SET v_order_number_suffix = LPAD(v_order_count + 1, 2, '0');
    SET v_new_order_id = CONCAT('ORD-', DATE_FORMAT(NOW(), '%m%y'), '-', p_user_id, v_order_number_suffix);
    SET p_generated_order_id = v_new_order_id;

    INSERT INTO orders (
        id, user_id, total_price, shipping_method, shipping_cost,
        shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country,
        payment_method, status, created_at, updated_at
    ) VALUES (
        v_new_order_id, p_user_id, p_total_price, p_shipping_method, p_shipping_cost,
        p_shipping_address, p_shipping_city, p_shipping_state, p_shipping_zip, p_shipping_country,
        p_payment_method, 'pending', NOW(), NOW()
    );

    SET items_count = JSON_LENGTH(p_items_json);

    WHILE i < items_count DO
        SET v_product_id = JSON_UNQUOTE(JSON_EXTRACT(p_items_json, CONCAT('$[', i, '].product_id')));
        SET v_quantity = JSON_UNQUOTE(JSON_EXTRACT(p_items_json, CONCAT('$[', i, '].quantity')));

        SELECT title, price INTO v_title, v_price FROM products WHERE id = v_product_id LIMIT 1;

        INSERT INTO order_items (order_id, product_id, product_title, quantity, price, created_at)
        VALUES (v_new_order_id, v_product_id, v_title, v_quantity, v_price, NOW());
        SET i = i + 1;
    END WHILE;

END //
