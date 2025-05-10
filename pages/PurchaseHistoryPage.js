import SideBar2 from '../components/Sidebar/SideBar2.js';
import PurchaseHistory from '../components/History/PurchaseHistory.js';

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = new SideBar2('app', 'purchase_history');
    
    const purchaseHistory = new PurchaseHistory('app');
    document.dispatchEvent(new CustomEvent('orderPlaced'));
});