import ItemDetail from '../components/ItemDetail.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
        // Redirect to explore page if no product ID is provided
        window.location.href = 'ExplorePage.html';
        return;
    }
    
    // Initialize the item detail component with the product ID
    const itemDetail = new ItemDetail('app', productId);
    
    // Update badges on page load
    document.dispatchEvent(new CustomEvent('updateSavedBadge'));
    document.dispatchEvent(new CustomEvent('updateCartBadge'));
    
    console.log('Item detail page initialized for product ID:', productId);
});