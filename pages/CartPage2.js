import SideBar2 from '../components/SideBar2.js';
import CartItem2 from '../components/CartItem2.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the sidebar with cart as active item
    const sidebar = new SideBar2('app', 'cart');
    
    // Initialize the new cart items component
    const cartItems = new CartItem2('app');
    
    console.log('Cart page v2 initialized');
});