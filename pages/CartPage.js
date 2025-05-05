import SideBar2 from '../components/Sidebar/SideBar2.js';
import CartItem2 from '../components/Cart/CartItem.js';
import CheckoutSummary from '../components/Cart/checkoutSummary.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the sidebar with cart as active item
    const sidebar = new SideBar2('app', 'cart');
    
    // Initialize the new cart items component
    const cartItems = new CartItem2('app');
    
    // Initialize the checkout summary component
    const checkoutSummary = new CheckoutSummary('app');
    
    console.log('Cart page v2 initialized');
});