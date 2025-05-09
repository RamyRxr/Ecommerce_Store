DELIMITER //

CREATE PROCEDURE FinalizeOrder(
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
    OUT p_generated_order_id VARCHAR(50) 
)
BEGIN
    DECLARE v_order_count INT;
    DECLARE v_order_number_suffix VARCHAR(2);
    DECLARE v_new_order_id VARCHAR(50);

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

    INSERT INTO order_items (order_id, product_id, product_title, quantity, price, created_at)
    SELECT
        v_new_order_id,
        ci.product_id,
        p.title, 
        ci.quantity,
        p.price, 
        NOW()
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = p_user_id;

END //

DELIMITER ;

SET @generated_id = '';
CALL FinalizeOrder(
    2, -- Replace with a valid user ID for testing 
    150.75, -- p_total_price
    'standard', -- p_shipping_method
    5.00, -- p_shipping_cost
    '123 Test St', -- p_shipping_address
    'Testville', -- p_shipping_city
    'TS', -- p_shipping_state
    '12345', -- p_shipping_zip
    'Testland', -- p_shipping_country
    'credit_card', -- p_payment_method
    @generated_id
);
SELECT @generated_id;