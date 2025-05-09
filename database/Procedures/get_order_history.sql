DELIMITER //

CREATE PROCEDURE GetOrderHistory(
    IN p_user_id INT
)
BEGIN
    SELECT
        o.id AS order_id,
        o.created_at AS order_date,
        o.status AS order_status,
        o.total_price,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count,
        (SELECT SUM(oi.quantity) FROM order_items oi WHERE oi.order_id = o.id) as total_quantity,
        (SELECT pi.image_url 
            FROM product_images pi 
            JOIN order_items oi ON pi.product_id = oi.product_id 
            WHERE oi.order_id = o.id 
            ORDER BY pi.display_order ASC, pi.id ASC 
            LIMIT 1) as first_product_image,
        (SELECT GROUP_CONCAT(DISTINCT p.title SEPARATOR ', ') 
            FROM products p 
            JOIN order_items oi ON p.id = oi.product_id 
            WHERE oi.order_id = o.id
        ) as product_titles,
        (SELECT COUNT(*) > 0 FROM order_ratings orat WHERE orat.order_id = o.id AND orat.user_id = o.user_id) AS rated
    FROM orders o
    WHERE o.user_id = p_user_id
    ORDER BY o.created_at DESC;
END //

DELIMITER ;

--CALL GetOrderHistory(your_test_user_id_with_orders); ==> test the procedure
CALL GetOrderHistory(2);