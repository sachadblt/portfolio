/* =========================================
   1. GESTION DU CURSEUR & TRAÎNÉE CONTINUE
   ========================================= */
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursor-follower');

// Configuration
const COLORS = { light: '#7b5de0', dark: '#f9d554' };
const TRAIL_LENGTH = 20;
const TRAIL_WIDTH = 8;

let currentCursorColor = COLORS.dark;
let trailPoints = [];
let isMoving = false;
let trailPath = null;
let movementTimer = null;

// Nettoyage ancien curseur
if (cursorFollower) cursorFollower.remove();

// --- Initialisation Curseur ---
function initCursorSystem() {
    if (cursor) {
        cursor.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24" style="overflow: visible;">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/>
            </svg>
        `;
        cursor.style.color = currentCursorColor;
    }

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.classList.add('trail-svg');
    svg.style.position = 'fixed';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '9998';

    trailPath = document.createElementNS(svgNS, "path");
    trailPath.classList.add('trail-path');
    trailPath.setAttribute("stroke-width", TRAIL_WIDTH);
    trailPath.setAttribute("stroke", currentCursorColor);
    trailPath.setAttribute("fill", "none");
    trailPath.setAttribute("stroke-linecap", "round");
    trailPath.setAttribute("stroke-linejoin", "round");

    svg.appendChild(trailPath);
    document.body.appendChild(svg);

    requestAnimationFrame(renderTrail);
}

initCursorSystem();

// --- Gestion des Mouvements ---
document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    isMoving = true;

    if (cursor) {
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
    }

    trailPoints.unshift({ x, y });

    clearTimeout(movementTimer);
    movementTimer = setTimeout(() => {
        isMoving = false;
    }, 50);
});

// --- Boucle de rendu Curseur ---
function renderTrail() {
    if (trailPoints.length > TRAIL_LENGTH) {
        trailPoints.pop();
    }

    if (!isMoving && trailPoints.length > 0) {
        trailPoints.pop();
    }

    if (trailPoints.length > 1 && trailPath) {
        let d = `M ${trailPoints[0].x} ${trailPoints[0].y}`;
        for (let i = 1; i < trailPoints.length; i++) {
            d += ` L ${trailPoints[i].x} ${trailPoints[i].y}`;
        }
        trailPath.setAttribute("d", d);
        trailPath.setAttribute("stroke", currentCursorColor);
    } else if (trailPath) {
        trailPath.setAttribute("d", "");
    }

    requestAnimationFrame(renderTrail);
}

// --- Gestion Mobile & Resize ---
function handleResize() {
    if (isMobileDevice()) {
        if (cursor) cursor.style.display = 'none';
        if (trailPath && trailPath.parentNode) trailPath.parentNode.style.display = 'none';
        document.body.style.cursor = 'auto';
    } else {
        if (cursor) cursor.style.display = 'block';
        if (trailPath && trailPath.parentNode) trailPath.parentNode.style.display = 'block';
    }
}

function isMobileDevice() {
    return window.matchMedia("(max-width: 768px)").matches;
}

window.addEventListener('resize', handleResize);
handleResize();

// --- Effets Interactifs ---
document.querySelectorAll('a, button, .btn, input, textarea, .theme-toggle-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (cursor) cursor.style.transform = 'translate(-50%, -50%) scale(1.5) rotate(72deg)';
    });
    el.addEventListener('mouseleave', () => {
        if (cursor) cursor.style.transform = 'translate(-50%, -50%) scale(1) rotate(0deg)';
    });
});

/* =========================================
   2. GESTION DU THÈME
   ========================================= */
const themeToggle = document.querySelector('.theme-toggle-btn');
const body = document.body;
const themeKey = 'sacha-portfolio-theme';

function applyTheme(theme) {
    if (theme === 'light') {
        body.classList.add('light-theme');
        currentCursorColor = COLORS.light;
    } else {
        body.classList.remove('light-theme');
        currentCursorColor = COLORS.dark;
    }

    if (cursor) cursor.style.color = currentCursorColor;
    if (trailPath) trailPath.setAttribute("stroke", currentCursorColor);
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        let currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
        let newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem(themeKey, newTheme);
    });
}

const savedTheme = localStorage.getItem(themeKey);
if (savedTheme) applyTheme(savedTheme);
else applyTheme('dark');

/* =========================================
   3. ANIMATION DES CHIFFRES (C'est ce qui manquait !)
   ========================================= */
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target;
            // On récupère le chiffre cible (ex: 10)
            const target = parseInt(statNumber.getAttribute('data-target'));

            // Si pas de cible, on arrête
            if (!target) return;

            let count = 0;
            // Vitesse : on divise la cible par 30 étapes
            const increment = target / 30;

            const updateCount = () => {
                if (count < target) {
                    count += increment;
                    // On s'assure de ne pas dépasser la cible
                    if(count > target) count = target;
                    statNumber.textContent = Math.ceil(count);
                    requestAnimationFrame(updateCount);
                } else {
                    statNumber.textContent = target;
                }
            };

            updateCount();
            statObserver.unobserve(statNumber);
        }
    });
}, { threshold: 0.5 }); // L'animation se lance quand 50% de l'élément est visible

// On applique l'observateur à tous les nombres
document.querySelectorAll('.stat-number').forEach(stat => {
    statObserver.observe(stat);
});

/* =========================================
   4. NAVIGATION & MENU BURGER
   ========================================= */
const navbar = document.querySelector('nav');
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

if (burger) {
    burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        burger.classList.toggle('active');
        const spans = burger.querySelectorAll('span');
        if (burger.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        if (burger) {
            burger.classList.remove('active');
            const spans = burger.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
});

/* =========================================
   5. TEXTE TYPING
   ========================================= */
const typingText = document.querySelector('.typing-text');
const texts = ['Développeur Full-Stack', 'Passionné de Design', 'Créateur Web'];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    if (!typingText) return;
    const currentText = texts[textIndex];
    let typeSpeed = 100;

    if (isDeleting) {
        typingText.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
    } else {
        typingText.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        typeSpeed = 2000;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        typeSpeed = 500;
    }
    setTimeout(type, typeSpeed);
}
setTimeout(type, 1000);

/* =========================================
   6. ANIMATIONS AU SCROLL
   ========================================= */
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            const progressBar = entry.target.querySelector('.skill-progress');
            if (progressBar) progressBar.style.width = progressBar.getAttribute('data-width') || progressBar.style.width;
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card, .skill-item, .timeline-item, .feature-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    fadeObserver.observe(el);
});

/* =========================================
   7. SMOOTH SCROLL & PARALLAX
   ========================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    document.querySelectorAll('.shape').forEach((shape, index) => {
        const speed = (index + 1) * 0.1;
        shape.style.transform = `translateY(${scrollY * speed}px)`;
    });
});