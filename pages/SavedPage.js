import SideBar2 from '../components/Sidebar/SideBar2.js';
import SavedItems from '../components/Save/SavedItems.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab') || 'saved';

    const sidebar = new SideBar2('app', activeTab);

    const savedItems = new SavedItems('app');

    document.dispatchEvent(new CustomEvent('updateSavedBadge'));

    console.log('Saved items page initialized with active tab:', activeTab);
});