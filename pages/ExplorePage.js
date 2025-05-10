import SideBar2 from '../components/Sidebar/SideBar2.js';
import FilterSidebar from '../components/Explore/FilterSidebar.js';
import ExploreContents from '../components/Explore/ExploreContents.js';

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = new SideBar2('app', 'explore');

    const filterSidebar = new FilterSidebar('app');
    
    const exploreContents = new ExploreContents('app');
    
    document.dispatchEvent(new CustomEvent('updateSavedBadge'));
});