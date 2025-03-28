import Sidebar from '/components/sidebar.js';
import RightSidebar from '/components/rightSidebar.js';
import MainContent from '/components/MainContent.js';

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    const sidebar = new Sidebar('app');
    const rightSidebar = new RightSidebar('app');
    const mainContent = new MainContent('app');
    
    console.log('Application initialized with component-based architecture');
});