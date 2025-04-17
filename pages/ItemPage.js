import ItemDetail from '../components/ItemDetail.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get the product ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        // Handle missing product ID
        document.getElementById('app').innerHTML = `
            <div class="error-container">
                <h2>Product Not Found</h2>
                <p>We couldn't find the product you were looking for.</p>
                <a href="ExplorePage.html" class="btn-primary">Continue Shopping</a>
            </div>
        `;
        return;
    }
    
    // Initialize the item detail component with the product ID
    const itemDetail = new ItemDetail('app', productId);
    
    // Custom event listener for back navigation
    document.addEventListener('back-to-explore', () => {
        window.location.href = 'ExplorePage.html';
    });
    
    console.log(`Item page initialized with product ID: ${productId}`);
});