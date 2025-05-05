import Sidebar from '../components/Sidebar/sidebar.js';
import RightSidebar from '../components/Home/rightSidebar.js';
import MainContent from '../components/Home/mainContent.js';

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = new Sidebar('app');  
    const rightSidebar = new RightSidebar('app');
    const mainContent = new MainContent('app');
    
    console.log('Application initialized with component-based architecture');
});