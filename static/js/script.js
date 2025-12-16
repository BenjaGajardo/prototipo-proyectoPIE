document.addEventListener("DOMContentLoaded", () => {

    /* WOW.js */
    if (typeof WOW === "function") {
        new WOW().init();
    }

    /* Sticky header */
    const header = document.getElementById("header-sticky");
    if (header) {
        window.addEventListener("scroll", () => {
            header.classList.toggle("sticky", window.scrollY > 100);
        });
    }

    /* Menú hamburguesa */
    const hamburger = document.querySelector(".sidebar__toggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const closeMenu = document.getElementById("closeMenu");
    const overlay = document.getElementById("menuOverlay");

    if (hamburger && mobileMenu && overlay) {
        hamburger.addEventListener("click", () => {
            mobileMenu.classList.add("active");
            overlay.classList.add("active");
        });
    }

    function closeAll() {
        mobileMenu.classList.remove("active");
        overlay.classList.remove("active");
    }

    if (closeMenu) closeMenu.addEventListener("click", closeAll);
    if (overlay) overlay.addEventListener("click", closeAll);

});



/*Pestaña: Clasificacion*/

