DELIMITER //

CREATE TRIGGER LogCancelledOrder
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        INSERT INTO cancelled_orders_log (
            order_id, 
            user_id, 
            cancellation_reason, 
            cancellation_initiator, 
            cancelled_at,
            original_order_data
        )
        VALUES (
            NEW.id, 
            NEW.user_id, 
            NEW.cancellation_reason, 
            'user', 
            COALESCE(NEW.cancellation_date, NOW()), 
            JSON_OBJECT(
                'old_status', OLD.status,
                'total_price', OLD.total_price,
                'order_date', OLD.created_at,
                'items_count', (SELECT COUNT(*) FROM order_items WHERE order_id = NEW.id)
            )
        );
    END IF;
END //

DELIMITER ;



-- Test line --> id = 'order_id_to_cancel'
UPDATE orders 
SET status = 'cancelled', cancellation_reason = 'Customer request', cancellation_date = NOW() 
WHERE id = 'ORD-0525-303';
