import Sidebar from './components/sidebar.js';
import RightSidebar from './components/rightSidebar.js';


document.addEventListener('DOMContentLoaded', () => {

    const sidebar = new Sidebar('app');
    const rightSidebar = new RightSidebar('app');
    
    console.log('App initialized with component-based architecture');
});