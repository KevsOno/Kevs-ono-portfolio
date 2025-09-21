const popup = document.getElementById('popup');
const leadForm = document.getElementById('leadForm');
const message = document.getElementById('message');
const closeBtn = document.querySelector('.close-btn');

function showPopup() {
    if (popup && sessionStorage.getItem('popupShown') !== 'true') {
        popup.classList.add('visible');
        sessionStorage.setItem('popupShown', 'true');
    }
}

function hidePopup() {
    popup?.classList.remove('visible');
}

closeBtn?.addEventListener('click', hidePopup);

leadForm?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    message.textContent = '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        message.textContent = 'Please enter a valid email address.';
        message.className = 'error';
        return;
    }
    try {
        const response = await fetch('/.netlify/functions/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });
        
        if (response.ok) {
            // Add the GTM dataLayer push here
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'form_submit_complete'
            });
            // GTM layer end
            
            message.textContent = '🎉 Subscribed successfully!';
            message.className = 'success';
            leadForm.reset();
            
            // The popup will now hide after 3 seconds
            setTimeout(() => {
                hidePopup();
            }, 3000); 
        } else {
            const errorData = await response.json();
            message.textContent = '❌ Error: ' + (errorData.message || 'Something went wrong.');
            message.className = 'error';
        }
    } catch (error) {
        message.textContent = '⚠️ Network error: ' + error.message;
        message.className = 'error';
    }
});

if (sessionStorage.getItem('popupShown') === 'true' && popup) {
    popup.classList.remove('visible');
}

// Scroll event listener for popup and back-to-top
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollDepth = scrollTop / docHeight;
    if (scrollDepth > 0.5) {
        showPopup();
    }
    if (scrollTop > 300) {
        backToTop?.classList.add('visible');
    } else {
        backToTop?.classList.remove('visible');
    }
});

backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Scroll fade-up
const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        }
    });
});
document.querySelectorAll('.scroll-fade-up').forEach(el => fadeObserver.observe(el));

// Lazy Load Audit Charts
const auditCharts = document.getElementById('auditCharts');
if (auditCharts) {
    const createChart = (canvasId, labelId, targetValue, color) => {
        const canvas = document.getElementById(canvasId);
        const label = document.getElementById(labelId);
        if (!canvas || !label) return;
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [0, 100],
                    backgroundColor: [color, '#e5e7eb'],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '75%',
                animation: {
                    duration: 1500,
                    easing: 'easeOutCubic',
                    onProgress: function (animation) {
                        const value = Math.min(Math.round((animation.currentStep / animation.numSteps) * targetValue), targetValue);
                        label.textContent = `${value}%`;
                    },
                    onComplete: function () {
                        label.textContent = `${targetValue}%`;
                    }
                },
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                },
                accessibility: {
                    enabled: true,
                    description: `Doughnut chart showing ${labelId.replace('Value', '')} score of ${targetValue}%`
                }
            }
        });
        setTimeout(() => {
            chart.data.datasets[0].data = [targetValue, 100 - targetValue];
            chart.update();
        }, 100);
    };
    const chartObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                createChart('performanceChart', 'performanceValue', 82, '#22c55e');
                createChart('accessibilityChart', 'accessibilityValue', 93, '#3b82f6');
                createChart('bestChart', 'bestValue', 96, '#f97316');
                createChart('seoChart', 'seoValue', 100, '#9333ea');
                observer.disconnect();
            }
        });
    }, { threshold: 0.2 });
    chartObserver.observe(auditCharts);
}

// Automated post list
const posts = [
    { title: "Top 5 SEO Strategies for Lagos Small Businesses in 2025", slug: "lagos-seo-strategies", excerpt: "Trapped in a digital traffic jam? Our guide reveals the top 5 SEO strategies for small businesses in Lagos to escape poor online visibility and boost revenue in 2025.", categories: ["Digital Marketing", "SEO"], image: "/images/blog-post-header.jpg" },
    // Add more posts as needed
];

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const blogMenu = document.getElementById('blog-menu');
    const blogMenuMobile = document.getElementById('blog-menu-mobile');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('close-sidebar');

    // Toggle main nav on mobile menu button click
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
        });
    }

    // Toggle sidebar on Blog click
    const toggleSidebar = (e) => {
        e.preventDefault();
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
        if (mobileMenu.classList.contains('open')) {
            mobileMenu.classList.remove('open');
        }
    };

    if (blogMenu) {
        blogMenu.addEventListener('click', toggleSidebar);
    }
    if (blogMenuMobile) {
        blogMenuMobile.addEventListener('click', toggleSidebar);
    }

    // Close sidebar
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
    }

    // Generate post links in sidebar
    const postList = document.getElementById('post-list');
    if (postList) {
        posts.forEach(post => {
            const li = document.createElement('li');
            li.innerHTML = `
              <a href="/Blog/${post.slug}.html" class="blog-post-link">
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <small>Categories: ${post.categories.join(', ')}</small>
              </a>
            `;
            postList.appendChild(li);
        });
    }
});
