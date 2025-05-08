function runAdminCheck() {
    try {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        const isAdmin = Boolean(user.is_admin);
        
        console.log('Running admin check - isAdmin:', isAdmin);
        
        if (isAdmin) {

            document.querySelectorAll('.customer-only-item').forEach(el => {
                el.style.display = 'none';
            });
            
            document.querySelectorAll('.admin-only-item').forEach(el => {
                el.style.display = 'block';
            });
            
            const savedItem = document.querySelector('li a i.bx-heart')?.closest('li');
            const cartItem = document.querySelector('li a i.bx-cart')?.closest('li');
            const sellingItem = document.querySelector('li a i.bx-store')?.closest('li');
            
            if (savedItem) savedItem.style.display = 'none';
            if (cartItem) cartItem.style.display = 'none';
            if (sellingItem) sellingItem.style.display = 'block';
            
            console.log('Global admin check: User is admin, adjusted UI accordingly');

        } else {

            document.querySelectorAll('.admin-only-item').forEach(el => {
                el.style.display = 'none';
            });
            
            document.querySelectorAll('.customer-only-item').forEach(el => {
                el.style.display = 'block';
            });
            
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

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(runAdminCheck, 100);
    
    setTimeout(runAdminCheck, 500);
});

window.runAdminCheck = runAdminCheck;