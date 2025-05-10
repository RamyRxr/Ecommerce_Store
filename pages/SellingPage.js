import SideBar2 from '../components/Sidebar/SideBar2.js';
import SellingContents from '../components/Sellings/SellingContents.js';

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = new SideBar2('app', 'selling');
    
    const sellingContents = new SellingContents('app');
});