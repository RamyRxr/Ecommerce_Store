import SideBar2 from '../components/SideBar2.js';
import SavedItems from '../components/SavedItems.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get the tab parameter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab') || 'saved';

    // Initialize the specialized sidebar that's always collapsed
    // Pass the active tab parameter to highlight the correct menu item
    const sidebar = new SideBar2('app', activeTab);

    // Initialize the saved items component
    const savedItems = new SavedItems('app');

    // Update saved badge count on page load
    document.dispatchEvent(new CustomEvent('updateSavedBadge'));

    console.log('Saved items page initialized with active tab:', activeTab);
});