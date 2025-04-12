import SideBar2 from '../components/SideBar2.js';
import UserProfile from '../components/UserProfile.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the sidebar with profile as active item
    const sidebar = new SideBar2('app', 'profile');
    
    // Initialize the Profile component
    const profile = new UserProfile('app');
});