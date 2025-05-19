import SideBar2 from '../components/Sidebar/SideBar2.js';
import HomeComponent from '../components/Home/HomeComponent.js';
import RightSidebar from '../components/Home/RightSidebar.js';

document.addEventListener('DOMContentLoaded', () => {
    new SideBar2('app', 'home');
    new HomeComponent('app');
    new RightSidebar('app');
});