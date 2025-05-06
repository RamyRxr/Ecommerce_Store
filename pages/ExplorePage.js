import SideBar2 from '../components/Sidebar/SideBar2.js';
import FilterSidebar from '../components/Explore/FilterSidebar.js';
import ExploreContents from '../components/Explore/ExploreContents.js';

document.addEventListener('DOMContentLoaded', () => {
    // First initialize the sidebar
    const sidebar = new SideBar2('app', 'explore');
    
    // Then initialize the filter sidebar component
    const filterSidebar = new FilterSidebar('app');
    
    // Initialize the main content with product grid
    const exploreContents = new ExploreContents('app');
    
    // Update saved badge count on page load
    document.dispatchEvent(new CustomEvent('updateSavedBadge'));
});