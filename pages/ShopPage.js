import SideBar from '../components/sidebar.js';
import ProductLoader from '../components/ProductLoader.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize sidebar
    const sidebar = new SideBar('app');
    
    // Initialize product loader
    const productLoader = new ProductLoader('products-grid');
    
    // Load products
    productLoader.loadProducts();
    
    console.log('Shop page initialized');
});