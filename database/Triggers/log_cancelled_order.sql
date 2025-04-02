DELIMITER //

CREATE TRIGGER log_cancelled_order
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    DECLARE order_json JSON;
    
    -- Si la commande passe au statut "Annulée"
    IF NEW.status_id = (SELECT status_id FROM order_statuses WHERE name = 'Annulée')
       AND OLD.status_id != NEW.status_id THEN
       
        -- Créer un JSON avec les détails de la commande
        SET order_json = (
            SELECT JSON_OBJECT(
                'order_id', o.order_id,
                'user_id', o.user_id,
                'order_date', o.order_date,
                'total_amount', o.total_amount,
                'shipping_address', o.shipping_address,
                'payment_method', o.payment_method,
                'items', (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'product_id', oi.product_id,
                            'quantity', oi.quantity,
                            'price', oi.price
                        )
                    )
                    FROM order_items oi
                    WHERE oi.order_id = o.order_id
                )
            )
            FROM orders o
            WHERE o.order_id = NEW.order_id
        );
        
        -- Enregistrer dans la table des commandes annulées
        INSERT INTO cancelled_orders (order_id, reason, cancelled_by, order_details)
        VALUES (NEW.order_id, 'Annulation de commande', NEW.user_id, order_json);
    END IF;
END //

DELIMITER ;