import FilterSidebarComponent from '../components/FilterSidebar.js';
import SideBar2 from '../components/SideBar2.js';

document.addEventListener('DOMContentLoaded', () => {
    // First initialize the specialized sidebar that's always collapsed
    const sidebar = new SideBar2('app');
    
    // Then initialize the filter sidebar component
    const filterSidebar = new FilterSidebarComponent('app');
    
    console.log('Explore page initialized with permanently collapsed sidebar');
});