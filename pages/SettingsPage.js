import SideBar2 from '../components/Sidebar/SideBar2.js';
import Settings from '../components/Settings/Settings.js';

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = new SideBar2('app', 'settings');
    const settings = new Settings('app');
});