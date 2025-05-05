import SideBar2 from '../components/Sidebar/SideBar2.js';
import FilterSidebar from '../components/Explore/FilterSidebar.js';
import ExploreContents from '../components/Explore/ExploreContents.js';

document.addEventListener('DOMContentLoaded', () => {
    // First initialize the specialized sidebar that's always collapsed
    const sidebar = new SideBar2('app');
    
    // Then initialize the filter sidebar component
    const filterSidebar = new FilterSidebar('app');
    
    // Initialize the main content with product grid
    const exploreContents = new ExploreContents('app');
    
    // Update saved badge count on page load
    document.dispatchEvent(new CustomEvent('updateSavedBadge'));
    
    console.log('Explore page initialized with product grid and filters');
});