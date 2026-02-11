// Strict typed DOM helpers
const $ = <T extends HTMLElement | null>(selector: string): T | null => document.querySelector(selector) as T | null;

// Mobile nav toggle
const navToggle = $(HTMLButtonElement)('#nav-toggle');
const siteNav = $('#site-nav') as HTMLElement | null;
if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.style.display = expanded ? 'none' : 'block';
  });
}

// Smooth scrolling for internal links
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector<HTMLElement>(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
      if (window.innerWidth < 700 && navToggle && siteNav) {
        navToggle.setAttribute('aria-expanded', 'false');
        siteNav.style.display = 'none';
      }
    }
  });
});

// Simple form validation and fake submit
const form = $('#contact-form') as HTMLFormElement | null;
const status = $('#form-status') as HTMLElement | null;
if (form && status) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = '';
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim();
    if (!name || !email || !message) {
      status.textContent = 'Please fill out all fields.';
      status.classList.add('error');
      return;
    }
    // basic email check
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      status.textContent = 'Please enter a valid email address.';
      status.classList.add('error');
      return;
    }
    status.textContent = 'Sending…';
    status.classList.remove('error');
    // simulate network
    setTimeout(() => {
      status.textContent = 'Thanks — I will get back to you soon.';
      form.reset();
    }, 900);
  });
}

// Set current year in footer
const yearEl = $('#year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Utility to create a lightweight skeleton while loading
function makeSkeletonCard(): HTMLElement {
  const div = document.createElement('div');
  div.className = 'project-card skeleton';
  div.innerHTML = '<div style="height:120px;background:#f3f4f6;border-radius:6px;margin-bottom:8px"></div><div style="height:12px;background:#f3f4f6;border-radius:6px;width:60%;margin-bottom:6px"></div><div style="height:10px;background:#f3f4f6;border-radius:6px;width:40%"></div>';
  return div;
}

// Fetch and render GitHub repos
interface Repo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  updated_at: string;
}

async function loadRepos(username = 'Saichakradhar4705') {
  const reposContainer = $('#repos');
  if (!reposContainer) return;

  // clear and show skeletons
  reposContainer.innerHTML = '';
  for (let i = 0; i < 6; i++) reposContainer.appendChild(makeSkeletonCard());

  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=50&sort=updated`);
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
    const data = await res.json() as Repo[];
    if (!Array.isArray(data) || data.length === 0) {
      reposContainer.innerHTML = '<p>No public repositories found.</p>';
      return;
    }

    data.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    const slice = data.slice(0, 12);
    reposContainer.innerHTML = '';

    slice.forEach(repo => {
      const card = document.createElement('article');
      card.className = 'project-card';
      const language = repo.language ? `<span class="lang">${repo.language}</span> · ` : '';
      card.innerHTML = `
        <h3><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h3>
        <p class="muted">${repo.description ? repo.description : 'No description'}</p>
        <p class="meta">${language}${new Date(repo.updated_at).toLocaleDateString()}</p>
      `;
      reposContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    reposContainer.innerHTML = '<p>Unable to load projects from GitHub at this time.</p>';
  }
}

// Debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, wait = 150) {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait) as unknown as number;
  };
}

// Re-run layout adjustments on resize if needed
window.addEventListener('resize', debounce(() => {
  // future responsive adjustments could be placed here
}, 200));

// Initialize
loadRepos();

