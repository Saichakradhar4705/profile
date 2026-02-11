// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const siteNav = document.getElementById('site-nav');
navToggle && navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  siteNav.style.display = expanded ? 'none' : 'block';
});

// Smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
      // close mobile nav after click
      if (window.innerWidth < 700 && navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
        siteNav.style.display = 'none';
      }
    }
  });
});

// Simple form validation and fake submit
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = '';
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if (!name || !email || !message) {
      status.textContent = 'Please fill out all fields.';
      return;
    }
    // basic email check
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      status.textContent = 'Please enter a valid email address.';
      return;
    }
    status.textContent = 'Sending…';
    // simulate network
    setTimeout(() => {
      status.textContent = 'Thanks — I will get back to you soon.';
      form.reset();
    }, 900);
  });
}

// Set current year in footer
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Fetch and render GitHub repositories for user 'Saichakradhar4705'
(function loadRepos() {
  const username = 'Saichakradhar4705';
  const reposContainer = document.getElementById('repos');
  if (!reposContainer) return;

  reposContainer.innerHTML = '<p>Loading projects from GitHub…</p>';

  fetch(`https://api.github.com/users/${username}/repos?per_page=50&sort=updated`)
    .then(res => {
      if (!res.ok) throw new Error('GitHub API error');
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        reposContainer.innerHTML = '<p>No public repositories found.</p>';
        return;
      }
      // sort by updated date (most recent first)
      data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

      const cards = data.slice(0, 12).map(repo => {
        const language = repo.language || '';
        return `
          <article class="project-card">
            <h3><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h3>
            <p class="muted">${repo.description ? repo.description : 'No description'}</p>
            <p class="meta">${language ? `<span class="lang">${language}</span> · ` : ''}${new Date(repo.updated_at).toLocaleDateString()}</p>
          </article>
        `;
      }).join('');

      reposContainer.innerHTML = cards;
    })
    .catch(err => {
      console.error(err);
      reposContainer.innerHTML = '<p>Unable to load projects from GitHub at this time.</p>';
    });
})();
