import Sidebar from '../components/SideBar.js';
import RightSidebar from '../components/RightSideBar.js';
import MainContent from '../components/MainContent.js';

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = new Sidebar('app');  
    const rightSidebar = new RightSidebar('app');
    const mainContent = new MainContent('app');
    
    console.log('Application initialized with component-based architecture');
});