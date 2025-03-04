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
});