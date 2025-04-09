import SideBar2 from '../components/SideBar2.js';
import SellingContents from '../components/SellingContents.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the sidebar with selling as active item
    const sidebar = new SideBar2('app', 'selling');

    // Initialize the selling contents component
    const sellingContents = new SellingContents('app');

    console.log('Selling page initialized');
});
