// Mobile menu functionality
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');

if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', function () {
        mobileMenuBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });

    // Close mobile menu when clicking on links
    document.querySelectorAll('.mobile-nav a').forEach(function (link) {
        link.addEventListener('click', function () {
            mobileMenuBtn.classList.remove('active');
            mobileNav.classList.remove('active');
        });
    });
}

// Smooth scrolling for navigation links safely
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href !== '#' && href.length > 1) {
            e.preventDefault();
            try {
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            } catch (err) {
                console.warn('Invalid scroll target:', href);
            }
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function () {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(function (el) {
    observer.observe(el);
});

// Update active menu item based on scroll
function updateActiveMenuItem() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const menuItem = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
        const mobileMenuItem = document.querySelector(`.mobile-nav a[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            // Remove active class from all menu items
            document.querySelectorAll('.nav-links a').forEach(item => item.classList.remove('active'));
            document.querySelectorAll('.mobile-nav a').forEach(item => item.classList.remove('active'));

            // Add active class to current menu item
            if (menuItem) menuItem.classList.add('active');
            if (mobileMenuItem) mobileMenuItem.classList.add('active');
        }
    });
}

// Listen for scroll events
window.addEventListener('scroll', updateActiveMenuItem);

// Set initial active state
updateActiveMenuItem();

// Timeline functionality
function initTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineProgress = document.querySelector('.timeline-progress');
    const timelineFilters = document.querySelectorAll('.timeline-filter');

    // Timeline scroll progress
    function updateTimelineProgress() {
        const timelineContainer = document.querySelector('.timeline-container');
        if (!timelineContainer || !timelineProgress) return;
        const containerRect = timelineContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (containerRect.top < windowHeight && containerRect.bottom > 0) {
            const progress = Math.max(0, Math.min(1,
                (windowHeight - containerRect.top) / (containerRect.height + windowHeight)
            ));
            timelineProgress.style.height = `${progress * 100}%`;
        }
    }

    // Timeline item visibility
    function updateTimelineItems() {
        timelineItems.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight * 0.8;

            if (isVisible && !item.classList.contains('visible')) {
                setTimeout(() => {
                    item.classList.add('visible');
                }, index * 150);
            }
        });
    }

    // Timeline filtering
    timelineFilters.forEach(filter => {
        filter.addEventListener('click', function () {
            const filterValue = this.getAttribute('data-filter');

            // Update active filter
            timelineFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');

            // Filter timeline items
            timelineItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(30px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Timeline node interactions
    document.querySelectorAll('.timeline-node').forEach(node => {
        node.addEventListener('click', function () {
            // Remove active class from all nodes
            document.querySelectorAll('.timeline-node').forEach(n => n.classList.remove('active'));
            // Add active class to clicked node
            this.classList.add('active');

            // Smooth scroll to the timeline item
            const timelineItem = this.closest('.timeline-item');
            if (timelineItem) {
                timelineItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    });

    // Listen for scroll events
    window.addEventListener('scroll', () => {
        updateTimelineProgress();
        updateTimelineItems();
    });

    // Initial calls
    updateTimelineProgress();
    updateTimelineItems();
}

// Initialize timeline when DOM is ready
document.addEventListener('DOMContentLoaded', initTimeline);

// Contact form – send to backend /contact route (Nodemailer)
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusDiv = document.getElementById('formStatus');

    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const data = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            projectType: form.projectType.value.trim(),
            message: form.message.value.trim()
        };

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        statusDiv.style.display = 'none';

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch('/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                statusDiv.textContent = '✅ Message sent! I\'ll get back to you soon.';
                statusDiv.style.color = '#4ade80';
                statusDiv.style.display = 'block';
                form.reset();
            } else {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Server error ' + response.status);
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                statusDiv.textContent = '❌ Request timed out. Check that the server is running.';
            } else {
                statusDiv.textContent = '❌ Something went wrong: ' + err.message;
            }
            statusDiv.style.color = '#f87171';
            statusDiv.style.display = 'block';
            console.error('Contact form error:', err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });
});
