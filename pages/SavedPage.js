import SideBar2 from '../components/SideBar2.js';
import SavedItems from '../components/SavedItems.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the specialized sidebar that's always collapsed
    // Pass 'saved' as the activeMenuItem to highlight the saved menu item
    const sidebar = new SideBar2('app', 'saved');
    
    // Initialize the saved items component
    const savedItems = new SavedItems('app');
    
    // Update saved badge count on page load
    document.dispatchEvent(new CustomEvent('updateSavedBadge'));
    
    console.log('Saved items page initialized');
});