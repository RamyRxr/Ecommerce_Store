import SideBar2 from '../components/SideBar2.js';
import PurchaseHistory from '../components/PurchaseHistory.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the sidebar with purchase_history as active item
    const sidebar = new SideBar2('app', 'purchase_history');
    
    // Initialize the Purchase History component
    const purchaseHistory = new PurchaseHistory('app');
    document.dispatchEvent(new CustomEvent('orderPlaced'));
});