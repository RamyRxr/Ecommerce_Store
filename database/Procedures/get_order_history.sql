DELIMITER //

CREATE PROCEDURE get_order_history(IN p_user_id INT)
BEGIN
    -- Récupérer la liste des commandes
    SELECT o.order_id, o.order_date, os.name AS status, o.total_amount,
           (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) AS item_count
    FROM orders o
    JOIN order_statuses os ON o.status_id = os.status_id
    WHERE o.user_id = p_user_id
    ORDER BY o.order_date DESC;
    
    -- Information sur les 5 derniers produits achetés (pour recommandations)
    SELECT DISTINCT p.product_id, p.name, p.price, p.image_url
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    JOIN products p ON oi.product_id = p.product_id
    WHERE o.user_id = p_user_id
    ORDER BY o.order_date DESC
    LIMIT 5;
END //

DELIMITER ;