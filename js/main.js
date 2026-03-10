document.addEventListener('DOMContentLoaded', () => {

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, {
        threshold: 0.1
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach(el => observer.observe(el));

    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.querySelector('.navbar');
    const navLinksClick = document.querySelectorAll('.nav-links li a');

    if (mobileMenu && navbar) {

        // abre/fecha menu
        mobileMenu.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });

        // fecha ao clicar em link
        navLinksClick.forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('active');
            });
        });
    }

});