// A global script to ensure consistent UI based on admin status
function runAdminCheck() {
    try {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        const isAdmin = Boolean(user.is_admin);
        
        console.log('Running admin check - isAdmin:', isAdmin);
        
        // Apply visibility based on admin status
        if (isAdmin) {
            // Hide customer-only elements
            document.querySelectorAll('.customer-only-item').forEach(el => {
                el.style.display = 'none';
            });
            
            // Show admin-only elements
            document.querySelectorAll('.admin-only-item').forEach(el => {
                el.style.display = 'block';
            });
            
            // Direct element targeting for Settings page
            const savedItem = document.querySelector('li a i.bx-heart')?.closest('li');
            const cartItem = document.querySelector('li a i.bx-cart')?.closest('li');
            const sellingItem = document.querySelector('li a i.bx-store')?.closest('li');
            
            if (savedItem) savedItem.style.display = 'none';
            if (cartItem) cartItem.style.display = 'none';
            if (sellingItem) sellingItem.style.display = 'block';
            
            console.log('Global admin check: User is admin, adjusted UI accordingly');
        } else {
            // Hide admin-only elements
            document.querySelectorAll('.admin-only-item').forEach(el => {
                el.style.display = 'none';
            });
            
            // Show customer-only elements
            document.querySelectorAll('.customer-only-item').forEach(el => {
                el.style.display = 'block';
            });
            
            // Direct element targeting for Settings page
            const savedItem = document.querySelector('li a i.bx-heart')?.closest('li');
            const cartItem = document.querySelector('li a i.bx-cart')?.closest('li');
            const sellingItem = document.querySelector('li a i.bx-store')?.closest('li');
            
            if (savedItem) savedItem.style.display = 'block';
            if (cartItem) cartItem.style.display = 'block';
            if (sellingItem) sellingItem.style.display = 'none';
            
            console.log('Global admin check: User is regular user, adjusted UI accordingly');
        }
        
        return isAdmin;
    } catch (error) {
        console.error('Error in global admin check:', error);
        return false;
    }
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the sidebar to fully initialize
    setTimeout(runAdminCheck, 100);
    
    // Run again after a longer delay to catch any late-rendered elements
    setTimeout(runAdminCheck, 500);
});

// Also expose as global function
window.runAdminCheck = runAdminCheck;