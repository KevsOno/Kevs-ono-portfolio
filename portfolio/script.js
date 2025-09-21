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
