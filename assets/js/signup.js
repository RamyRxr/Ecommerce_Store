import SignupPage from '/pages/signupPage.js';

// Initialize signup page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize signup component
    const signupPage = new SignupPage('app');
    
    console.log('Signup page initialized');
});