document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.getElementById("toggle-btn");
    const sidebar = document.querySelector(".sidebar");
    const searchIcon = document.querySelector(".search-box i");
    const searchInput = document.getElementById("search-input");
    const menuItems = document.querySelectorAll('.menu li');
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    // Toggle sidebar
    toggleBtn.addEventListener("click", function () {
        sidebar.classList.toggle("collapsed");
        // Short delay to ensure the collapsed class has been toggled
        setTimeout(updateTotalBadge, 10);
    });

    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        themeToggle.innerHTML = "<i class='bx bx-sun'></i>";
    }

    // Handle search icon click
    searchIcon.addEventListener("click", function () {
        if (sidebar.classList.contains("collapsed")) {
            sidebar.classList.remove("collapsed");
            setTimeout(() => {
                searchInput.focus();
            }, 300);
        }
    });

    // Add click event for menu items
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            // Remove active class from all items
            menuItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
        });
    });

    // Toggle theme
    themeToggle.addEventListener("click", function () {
        body.classList.toggle("dark-mode");
        if (body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
            themeToggle.innerHTML = "<i class='bx bx-sun'></i>";
        } else {
            localStorage.setItem("theme", "light");
            themeToggle.innerHTML = "<i class='bx bx-moon'></i>";
        }
    });

    // Calculate the total notifications
    function updateTotalBadge() {
        const badges = document.querySelectorAll('.icon-item .badge');
        const sidebar = document.querySelector('.sidebar');
        let total = 0;

        badges.forEach(badge => {
            total += parseInt(badge.textContent) || 0;
        });

        // Update the total badge
        const totalBadge = document.querySelector('#toggle-btn .total-badge');
        totalBadge.textContent = total;

        // Only show if there are notifications AND sidebar is collapsed
        if (total > 0 && sidebar.classList.contains('collapsed')) {
            totalBadge.style.display = 'flex';
        } else {
            totalBadge.style.display = 'none';
        }
    }

    // Initial update
    updateTotalBadge();

    // Update when notifications change (if you add this functionality later)
    // This is just a placeholder for future functionality
    document.querySelectorAll('.icon-item .badge').forEach(badge => {
        const observer = new MutationObserver(updateTotalBadge);
        observer.observe(badge, { childList: true, characterData: true, subtree: true });
    });

    // Get message and notification icons
    const messageIcon = document.querySelector('.icon-item .bx-message')?.parentNode;
    const notificationIcon = document.querySelector('.icon-item .bx-bell')?.parentNode;

    if (messageIcon && notificationIcon) {
        const messagesBox = document.querySelector('.messages-box');
        const notificationsBox = document.querySelector('.notifications-box');

        // Handle click on message icon
        messageIcon.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent clicks from bubbling up
            console.log('Message icon clicked'); // Debug

            // Close notification dropdown if open
            notificationsBox?.classList.remove('active');

            // Toggle message dropdown
            messagesBox?.classList.toggle('active');

            // Debug
            console.log('Messages active:', messagesBox?.classList.contains('active'));
        });

        // Handle click on notification icon
        notificationIcon.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent clicks from bubbling up
            console.log('Notification icon clicked'); // Debug

            // Close message dropdown if open
            messagesBox?.classList.remove('active');

            // Toggle notification dropdown
            notificationsBox?.classList.toggle('active');

            // Debug
            console.log('Notifications active:', notificationsBox?.classList.contains('active'));
        });

        // Close dropdowns when clicking elsewhere
        document.addEventListener('click', function () {
            messagesBox?.classList.remove('active');
            notificationsBox?.classList.remove('active');
        });

        // Prevent clicks inside dropdown from closing it
        [messagesBox, notificationsBox].forEach(box => {
            box?.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        });
    }

    // Carousel functionality
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const totalSlides = slides.length;
    let slideInterval;

    // Initialize carousel
    function startCarousel() {
        slideInterval = setInterval(nextSlide, 4000); // Change slide every 4 seconds
    }

    // Show specific slide
    function showSlide(index) {
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Add active class to current slide and dot
        slides[index].classList.add('active');
        dots[index].classList.add('active');

        currentSlide = index;
    }

    // Next slide function
    function nextSlide() {
        let nextIndex = currentSlide + 1;
        if (nextIndex >= totalSlides) {
            nextIndex = 0;
        }
        showSlide(nextIndex);
    }

    // Previous slide function
    function prevSlide() {
        let prevIndex = currentSlide - 1;
        if (prevIndex < 0) {
            prevIndex = totalSlides - 1;
        }
        showSlide(prevIndex);
    }

    // Add click event to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(slideInterval); // Reset interval when manually changing
            showSlide(index);
            startCarousel(); // Restart interval
        });
    });

    // Add click event to next button
    document.querySelector('.carousel-btn.next').addEventListener('click', () => {
        clearInterval(slideInterval);
        nextSlide();
        startCarousel();
    });

    // Add click event to prev button
    document.querySelector('.carousel-btn.prev').addEventListener('click', () => {
        clearInterval(slideInterval);
        prevSlide();
        startCarousel();
    });

    // Start the carousel
    startCarousel();
});

// Category button functionality
document.addEventListener('DOMContentLoaded', function () {
    // Get all category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');

    // Add click event to each button
    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to clicked button
            this.classList.add('active');

            // You can add filtering functionality here later
            // For example: filterProducts(this.textContent.trim());

            // Visual feedback animation
            this.animate([
                { transform: 'scale(0.95)' },
                { transform: 'scale(1)' }
            ], {
                duration: 200,
                easing: 'ease-out'
            });
        });
    });
});

// Enhanced Dynamic Pagination functionality
document.addEventListener('DOMContentLoaded', function () {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    const totalPages = 10; // Total number of pages
    let currentPage = 1; // Start on page 1

    // Function to generate pagination HTML
    function generatePagination(current, total) {
        // Always start with prev button
        let html = `<button class="page-nav prev" ${current === 1 ? 'disabled' : ''}><i class='bx bx-chevron-left'></i></button>`;

        // Always show first page
        html += `<button class="page-btn ${current === 1 ? 'active' : ''}">1</button>`;

        let startPage = Math.max(2, current - 1);
        let endPage = Math.min(total - 1, current + 1);

        // Handle ellipsis after page 1
        if (startPage > 2) {
            html += `<span class="page-dots">...</span>`;
        } else if (startPage === 2) {
            // No need for ellipsis if we're showing page 2
            html += `<button class="page-btn ${current === 2 ? 'active' : ''}">2</button>`;
            startPage = 3;
        }

        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="page-btn ${current === i ? 'active' : ''}">${i}</button>`;
        }

        // Handle ellipsis before last page
        if (endPage < total - 1) {
            html += `<span class="page-dots">...</span>`;
        } else if (endPage === total - 1) {
            // We're already showing the second-to-last page
            // No ellipsis needed here
        }

        // Always show last page
        if (total > 1) {
            html += `<button class="page-btn ${current === total ? 'active' : ''}">${total}</button>`;
        }

        // Always end with next button
        html += `<button class="page-nav next" ${current === total ? 'disabled' : ''}><i class='bx bx-chevron-right'></i></button>`;

        return html;
    }

    // Function to update the active state
    function updatePagination(pageNum) {
        currentPage = pageNum;
        paginationContainer.innerHTML = generatePagination(pageNum, totalPages);

        // Add click events to the page buttons
        paginationContainer.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const pageNum = parseInt(btn.textContent);
                updatePagination(pageNum);
            });
        });

        // Add click events to the prev/next buttons
        paginationContainer.querySelector('.page-nav.prev').addEventListener('click', () => {
            if (currentPage > 1) {
                updatePagination(currentPage - 1);
            }
        });

        paginationContainer.querySelector('.page-nav.next').addEventListener('click', () => {
            if (currentPage < totalPages) {
                updatePagination(currentPage + 1);
            }
        });

        // Visual feedback animation
        const activeBtn = paginationContainer.querySelector('.page-btn.active');
        if (activeBtn) {
            activeBtn.animate([
                { transform: 'scale(0.95)' },
                { transform: 'scale(1)' }
            ], {
                duration: 200,
                easing: 'ease-out'
            });
        }

        // You would typically load new content here
        console.log(`Loading page ${pageNum}`);

        // Example: Update URL without page reload
        history.pushState({ page: pageNum }, `Page ${pageNum}`, `?page=${pageNum}`);
    }

    // Initial state
    updatePagination(currentPage);
});