export default class FilterSidebar {
    constructor(containerId = 'app') {
        this.container = document.getElementById(containerId);
        this.categories = ['Headphones', 'Smartphones', 'Laptops', 'Tablets', 'Cameras', 'Accessories'];
        this.brands = ['Apple', 'Samsung', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo', 'JBL', 'Canon'];
        this.minPrice = 0;
        this.maxPrice = 10000; // Increased to 10,000 for high-end electronics
        this.currentMinPrice = 0;
        this.currentMaxPrice = 10000; // Default max also increased
        this.isUnlimited = false;
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const filterHTML = `
            <div class="filter-container">
                <div class="filter-top">
                    <h3>Filters</h3>
                </div>

                <div class="filter-section">
                    <div class="Categoris-header">
                        <h2>Categories</h2>
                    </div>
                    
                    ${this.categories.map(category => `
                        <div>
                            <input type="checkbox" id="category-${category.toLowerCase()}" name="category" value="${category.toLowerCase()}"> 
                            <label for="category-${category.toLowerCase()}">${category}</label>
                        </div>
                    `).join('')}
                </div>
                
                <div class="filter-section">

                    <div class="Categoris-header">
                        <h2>Price Range</h2>
                    </div>

                    <div class="price-slider-container">
                        <div class="price-range-track">
                            <div class="price-range-progress"></div>
                            <input type="range" id="min-price-range" min="${this.minPrice}" max="${this.maxPrice}" value="${this.currentMinPrice}" class="range-slider min-slider">
                            <input type="range" id="max-price-range" min="${this.minPrice}" max="${this.maxPrice}" value="${this.currentMaxPrice}" class="range-slider max-slider" ${this.isUnlimited ? 'disabled' : ''}>
                        </div>
                        <div class="price-range-values">
                            <span id="price-range-display">$${this.currentMinPrice} - ${this.isUnlimited ? 'Unlimited' : '$' + this.currentMaxPrice}</span>
                        </div>
                        <div class="price-range-inputs">
                            <div>
                                <span>$</span>
                                <input type="number" id="min-price" class="price-input" value="${this.currentMinPrice}" min="${this.minPrice}" max="${this.maxPrice}">
                            </div>
                            <div>
                                <span>$</span>
                                <input type="number" id="max-price" class="price-input" value="${this.currentMaxPrice}" min="${this.minPrice}" max="${this.maxPrice}"
                                    ${this.isUnlimited ? 'disabled' : ''}>
                            </div>
                        </div>
                        <div class="unlimited-checkbox">
                            <input type="checkbox" id="unlimited-price" ${this.isUnlimited ? 'checked' : ''}>
                            <label for="unlimited-price">Unlimited maximum price</label>
                        </div>
                    </div>
                </div>
                
                <div class="filter-section">

                    <div class="Categoris-header">
                        <h2>Brand</h2>
                    </div>

                    ${this.brands.map(brand => `
                        <div>
                            <input type="checkbox" id="brand-${brand.toLowerCase()}" name="brand" value="${brand.toLowerCase()}"> 
                            <label for="brand-${brand.toLowerCase()}">${brand}</label>
                        </div>
                    `).join('')}
                </div>
                
                <div class="filter-section">

                    <div class="Categoris-header">
                        <h2>Rating</h2>
                    </div>
                    
                    <div class="rating-options">
                        <div>
                            <input type="radio" id="rating-any" name="rating" value="0" checked> 
                            <label for="rating-any">Any rating</label>
                        </div>
                        <div>
                            <input type="radio" id="rating-4" name="rating" value="4"> 
                            <label for="rating-4">4+ <i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bx-star'></i></label>
                        </div>
                        <div>
                            <input type="radio" id="rating-3" name="rating" value="3"> 
                            <label for="rating-3">3+ <i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bx-star'></i><i class='bx bx-star'></i></label>
                        </div>
                        <div>
                            <input type="radio" id="rating-2" name="rating" value="2"> 
                            <label for="rating-2">2+ <i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bx-star'></i><i class='bx bx-star'></i><i class='bx bx-star'></i></label>
                        </div>
                        <div>
                            <input type="radio" id="rating-1" name="rating" value="1"> 
                            <label for="rating-1">1+ <i class='bx bxs-star'></i><i class='bx bx-star'></i><i class='bx bx-star'></i><i class='bx bx-star'></i><i class='bx bx-star'></i></label>
                        </div>
                    </div>
                </div>
                
                <button id="apply-filters" class="apply-button">Apply Filters</button>
                <button id="reset-filters" class="reset-button">Reset</button>
            </div>
        `;

        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-sidebar';
        filterContainer.innerHTML = filterHTML;

        // Check if filter sidebar already exists
        const existingFilter = document.querySelector('.filter-sidebar');
        if (existingFilter) {
            existingFilter.replaceWith(filterContainer);
        } else {
            this.container.appendChild(filterContainer);
        }
    }

    setupEventListeners() {
        // Price range slider functionality
        const minPriceRange = document.getElementById('min-price-range');
        const maxPriceRange = document.getElementById('max-price-range');
        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        const priceDisplay = document.getElementById('price-range-display');
        const rangeProgress = document.querySelector('.price-range-progress');
        const unlimitedCheckbox = document.getElementById('unlimited-price');

        // Initialize the range progress bar
        this.updateRangeProgress(minPriceRange, maxPriceRange, rangeProgress);

        if (minPriceRange && maxPriceRange && minPrice && maxPrice && priceDisplay && rangeProgress) {
            // Sync range sliders with input fields and update display
            minPriceRange.addEventListener('input', () => {
                const minVal = parseInt(minPriceRange.value);
                let maxVal = this.isUnlimited ? this.maxPrice : parseInt(maxPriceRange.value);

                if (minVal > maxVal && !this.isUnlimited) {
                    minPriceRange.value = maxVal;
                    minPrice.value = maxVal;
                } else {
                    minPrice.value = minVal;
                }

                priceDisplay.textContent = `$${minPrice.value} - ${this.isUnlimited ? 'Unlimited' : '$' + maxPrice.value}`;
                this.updateRangeProgress(minPriceRange, maxPriceRange, rangeProgress);
            });

            if (!this.isUnlimited) {
                maxPriceRange.addEventListener('input', () => {
                    const minVal = parseInt(minPriceRange.value);
                    const maxVal = parseInt(maxPriceRange.value);

                    if (maxVal < minVal) {
                        maxPriceRange.value = minVal;
                        maxPrice.value = minVal;
                    } else {
                        maxPrice.value = maxVal;
                    }

                    priceDisplay.textContent = `$${minPrice.value} - $${maxPrice.value}`;
                    this.updateRangeProgress(minPriceRange, maxPriceRange, rangeProgress);
                });
            }

            // Sync input fields with range sliders
            minPrice.addEventListener('change', () => {
                const minVal = parseInt(minPrice.value);
                let maxVal = this.isUnlimited ? this.maxPrice : parseInt(maxPrice.value);

                if (minVal < this.minPrice) {
                    minPrice.value = this.minPrice;
                    minPriceRange.value = this.minPrice;
                } else if (minVal > maxVal && !this.isUnlimited) {
                    minPrice.value = maxVal;
                    minPriceRange.value = maxVal;
                } else {
                    minPriceRange.value = minVal;
                }

                priceDisplay.textContent = `$${minPrice.value} - ${this.isUnlimited ? 'Unlimited' : '$' + maxPrice.value}`;
                this.updateRangeProgress(minPriceRange, maxPriceRange, rangeProgress);
            });

            if (!this.isUnlimited) {
                maxPrice.addEventListener('change', () => {
                    const minVal = parseInt(minPrice.value);
                    const maxVal = parseInt(maxPrice.value);

                    if (maxVal > this.maxPrice) {
                        maxPrice.value = this.maxPrice;
                        maxPriceRange.value = this.maxPrice;
                    } else if (maxVal < minVal) {
                        maxPrice.value = minVal;
                        maxPriceRange.value = minVal;
                    } else {
                        maxPriceRange.value = maxVal;
                    }

                    priceDisplay.textContent = `$${minPrice.value} - $${maxPrice.value}`;
                    this.updateRangeProgress(minPriceRange, maxPriceRange, rangeProgress);
                });
            }
        }

        // Handle unlimited price option
        if (unlimitedCheckbox && maxPrice && maxPriceRange) {
            unlimitedCheckbox.addEventListener('change', () => {
                this.isUnlimited = unlimitedCheckbox.checked;

                if (this.isUnlimited) {
                    // Enable unlimited mode
                    maxPrice.disabled = true;
                    maxPriceRange.disabled = true;
                    maxPrice.value = this.maxPrice; // Keep the numerical value for the filter
                    maxPriceRange.value = this.maxPrice;

                    if (priceDisplay) {
                        priceDisplay.textContent = `$${minPrice.value} - Unlimited`;
                    }
                } else {
                    // Disable unlimited mode
                    maxPrice.disabled = false;
                    maxPriceRange.disabled = false;

                    if (priceDisplay) {
                        priceDisplay.textContent = `$${minPrice.value} - $${maxPrice.value}`;
                    }
                }

                // Update the progress bar
                this.updateRangeProgress(minPriceRange, maxPriceRange, rangeProgress);
            });
        }

        // Reset filters
        const resetButton = document.getElementById('reset-filters');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetAllFilters();

                // Trigger custom event for product grid to update
                document.dispatchEvent(new CustomEvent('filtersReset'));
            });
        }

        // Apply filters
        const applyButton = document.getElementById('apply-filters');
        if (applyButton) {
            applyButton.addEventListener('click', async () => {
                // Collect filter data
                const selectedCategories = Array.from(
                    document.querySelectorAll('input[name="category"]:checked')
                ).map(el => el.value);

                const selectedBrands = Array.from(
                    document.querySelectorAll('input[name="brand"]:checked')
                ).map(el => el.value);

                const selectedRating = document.querySelector('input[name="rating"]:checked')?.value;

                const priceRange = {
                    min: parseInt(minPrice.value) || this.minPrice,
                    max: this.isUnlimited ? 'unlimited' : (parseInt(maxPrice.value) || this.maxPrice)
                };

                // Create filter object
                const filters = {
                    categories: selectedCategories,
                    brands: selectedBrands,
                    rating: selectedRating,
                    price: priceRange
                };

                try {
                    // Send filters to backend
                    const response = await fetch('/Project-Web/backend/api/explore/filter_products.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(filters)
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        // Dispatch custom event with filtered products
                        const filterEvent = new CustomEvent('filtersApplied', {
                            detail: { 
                                filters,
                                products: data.data.listings
                            }
                        });
                        document.dispatchEvent(filterEvent);
                    } else {
                        throw new Error(data.message);
                    }
                } catch (error) {
                    console.error('Error applying filters:', error);
                    alert('Failed to apply filters. Please try again.');
                }
            });
        }

        // Listen for reset all filters event from product grid
        document.addEventListener('resetAllFilters', () => {
            this.resetAllFilters();
        });
    }

    resetAllFilters() {
        // Reset checkboxes
        document.querySelectorAll('input[name="category"]:checked, input[name="brand"]:checked').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset radio buttons - set "Any rating" as checked
        document.getElementById('rating-any').checked = true;

        // Reset unlimited checkbox and ranges
        const unlimitedCheckbox = document.getElementById('unlimited-price');
        const minPriceRange = document.getElementById('min-price-range');
        const maxPriceRange = document.getElementById('max-price-range');
        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        const priceDisplay = document.getElementById('price-range-display');
        const rangeProgress = document.querySelector('.price-range-progress');

        if (unlimitedCheckbox) {
            unlimitedCheckbox.checked = false;
            this.isUnlimited = false;
        }

        // Reset price range
        if (minPriceRange && maxPriceRange && minPrice && maxPrice && priceDisplay && rangeProgress) {
            minPriceRange.value = this.minPrice;
            maxPriceRange.value = this.maxPrice;
            minPrice.value = this.minPrice;
            maxPrice.value = this.maxPrice;
            maxPrice.disabled = false;
            maxPriceRange.disabled = false;
            priceDisplay.textContent = `$${this.minPrice} - $${this.maxPrice}`;
            this.updateRangeProgress(minPriceRange, maxPriceRange, rangeProgress);
        }
    }

    updateRangeProgress(minSlider, maxSlider, progressBar) {
        if (!progressBar || !minSlider || !maxSlider) return;

        const min = parseInt(minSlider.min);
        const max = parseInt(minSlider.max);
        const minVal = parseInt(minSlider.value);
        let maxVal = this.isUnlimited ? max : parseInt(maxSlider.value);

        const minPercent = ((minVal - min) / (max - min)) * 100;
        const maxPercent = ((maxVal - min) / (max - min)) * 100;

        progressBar.style.left = `${minPercent}%`;
        progressBar.style.width = `${maxPercent - minPercent}%`;
    }
}