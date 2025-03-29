import LoginPage from '../components/logIn.js';

// Initialize login page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize login component
    const loginPage = new LoginPage('app');
    
    console.log('Login page initialized');
});