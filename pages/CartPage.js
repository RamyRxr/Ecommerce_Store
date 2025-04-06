import SideBar2 from '../components/SideBar2.js';
import CartItems from '../components/CartItems.js';
import OrderSummary from '../components/OrderSummary.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the sidebar with cart as active item
    const sidebar = new SideBar2('app', 'cart');
    
    // Initialize the cart items component
    const cartItems = new CartItems('app');
    
    // Initialize the order summary component
    const orderSummary = new OrderSummary('app');
    
    console.log('Cart page initialized');
});