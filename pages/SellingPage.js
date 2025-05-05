import SideBar2 from '../components/Sidebar/SideBar2.js';
import SellingContents from '../components/Sellings/SellingContents.js';

// Initialize page components
document.addEventListener('DOMContentLoaded', function() {
    // Init sidebar with selling as active
    const sidebar = new SideBar2('app', 'selling');
    
    // Create selling contents
    const sellingContents = new SellingContents('app');
});