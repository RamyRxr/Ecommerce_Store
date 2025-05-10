import SideBar2 from '../components/Sidebar/SideBar2.js';
import CartItem2 from '../components/Cart/CartItem.js';
import CheckoutSummary from '../components/Cart/checkoutSummary.js';

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = new SideBar2('app', 'cart');
    
    const cartItems = new CartItem2('app');
    
    const checkoutSummary = new CheckoutSummary('app');
    
    console.log('Cart page v2 initialized');
});