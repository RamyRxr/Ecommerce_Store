DELIMITER //

CREATE PROCEDURE GetOrderDetail(
    IN p_order_id VARCHAR(50) 
)
BEGIN
    SELECT
        o.id AS order_id,
        o.user_id,
        u.username AS customer_username,
        o.created_at AS order_date,
        o.status AS order_status,
        o.shipping_address,
        o.shipping_city,
        o.shipping_state,
        o.shipping_zip,
        o.shipping_country,
        o.shipping_method,
        o.shipping_cost,
        o.payment_method,
        o.total_price AS total_amount_payable,
        o.cancellation_reason,
        o.cancellation_date,
        o.shipped_date,
        o.actual_delivery_date,
        (SELECT COUNT(*) > 0 FROM order_ratings orat WHERE orat.order_id = o.id AND orat.user_id = o.user_id) AS rated
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.id = p_order_id;

    SELECT
        oi.id as order_item_id,
        oi.product_id,
        oi.product_title,
        p.description as product_description, 
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = oi.product_id ORDER BY pi.display_order ASC, pi.id ASC LIMIT 1) as product_image,
        oi.quantity,
        oi.price AS price_per_item,
        (oi.quantity * oi.price) AS item_total_price
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = p_order_id;
END //

DELIMITER ;

--Test the procedure on exist order
CALL GetOrderDetail('ORD-0525-201');