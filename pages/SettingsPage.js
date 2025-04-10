import SideBar2 from '../components/SideBar2.js';
import Settings from '../components/Settings.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the sidebar with settings as active item
    const sidebar = new SideBar2('app', 'settings');
    
    // Initialize the Settings component
    const settings = new Settings('app');
});