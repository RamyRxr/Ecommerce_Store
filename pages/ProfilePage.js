import SideBar2 from '../components/SideBar2.js';
import Profile from '../components/Profile.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if dark mode should be applied
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    }

    // Initialize sidebar with profile as active item
    const sidebar = new SideBar2('app', 'profile');

    // Initialize profile component after a short delay to ensure sidebar is ready
    setTimeout(() => {
        const profile = new Profile('app');

        // Hide loading spinner
        setTimeout(() => {
            spinner.style.opacity = '0';
            setTimeout(() => {
                spinner.style.display = 'none';
            }, 300);
        }, 300);
    }, 100);

    // Listen for theme toggle events
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