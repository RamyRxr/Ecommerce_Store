import SideBar2 from '../components/SideBar2.js';
import Profile from '../components/Profile.js';

document.addEventListener('DOMContentLoaded', () => {
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    }

    const sidebar = new SideBar2('app', 'profile');

    const profile = new Profile('app');

    document.addEventListener('themeToggled', () => {
        const profileComponent = document.querySelector('.profile-component');
        if (profileComponent) {
            if (document.body.classList.contains('dark-mode')) {
                profileComponent.classList.add('dark-theme');
            } else {
                profileComponent.classList.remove('dark-theme');
            }
        }
    });
});