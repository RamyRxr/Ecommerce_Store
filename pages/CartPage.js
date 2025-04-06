import SideBar2 from '../components/SideBar2.js';
import CartItems from '../components/CartItems.js';
import OrderSummary from '../components/OrderSummary.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the sidebar with cart as active item
    new SideBar2('app', 'cart');
    
    // Initialize the cart items component
    new CartItems('app');
    
    // Initialize the order summary component
    new OrderSummary('app');
    
    // Add fade-in animation to the main content
    setTimeout(() => {
        const cartContent = document.querySelector('.cart-content');
        const orderSummaryContent = document.querySelector('.order-summary-content');
        
        if (cartContent) cartContent.classList.add('fade-in');
        if (orderSummaryContent) orderSummaryContent.classList.add('fade-in');
    }, 100);
});