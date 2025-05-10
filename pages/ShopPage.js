import SideBar from '../components/Sidebar/SideBar2.js';

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = new SideBar('app');    
    productLoader.loadProducts();
    
    console.log('Shop page initialized');
});