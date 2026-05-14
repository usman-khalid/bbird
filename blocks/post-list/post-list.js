const categoryColors = {
  engineering: 'var(--accent)',
  'field notes': 'var(--accent-3)',
  tutorials: 'var(--accent-4)',
  'case study': 'var(--accent-2)',
  'case studies': 'var(--accent-2)',
  announcements: 'var(--accent-6)',
};

export default async function decorate(block) {
  block.textContent = '';

  let posts;
  try {
    const resp = await fetch('/writing/query-index.json');
    const json = await resp.json();
    posts = (json.data || [])
      .filter((p) => p.path !== '/writing')
      .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
  } catch {
    block.innerHTML = '<p class="post-list-empty">Failed to load posts.</p>';
    return;
  }

  if (!posts.length) {
    block.innerHTML = '<p class="post-list-empty">No posts yet.</p>';
    return;
  }

  // Category counts
  const categories = {};
  posts.forEach((p) => {
    const cat = (p.category || 'Uncategorized').trim();
    categories[cat] = (categories[cat] || 0) + 1;
  });

  // Filter tabs
  const filters = document.createElement('div');
  filters.className = 'post-list-filters';

  const allBtn = document.createElement('button');
  allBtn.className = 'post-filter active';
  allBtn.textContent = `All \u00b7 ${posts.length}`;
  allBtn.dataset.category = '';
  filters.appendChild(allBtn);

  Object.entries(categories).forEach(([cat, count]) => {
    const btn = document.createElement('button');
    btn.className = 'post-filter';
    btn.textContent = `${cat} \u00b7 ${count}`;
    btn.dataset.category = cat;
    filters.appendChild(btn);
  });
  block.appendChild(filters);

  // Posts container
  const container = document.createElement('div');
  container.className = 'post-list-items';

  function renderPosts(filterCat) {
    container.textContent = '';
    const filtered = filterCat
      ? posts.filter((p) => (p.category || '').trim() === filterCat)
      : posts;

    filtered.forEach((post, i) => {
      const a = document.createElement('a');
      a.href = post.path;
      a.className = i === 0 && !filterCat ? 'post-featured' : 'post-row';

      const cat = (post.category || 'Uncategorized').trim();
      const colorVar = categoryColors[cat.toLowerCase()] || 'var(--fg-4)';
      const initials = (post.author || 'BB').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

      if (i === 0 && !filterCat) {
        a.innerHTML = `
          <div class="post-tag" style="color:${colorVar}">${cat} \u00b7 ${post.date || ''}</div>
          <h3>${post.title}</h3>
          <p class="post-excerpt">${post.description || ''}</p>
          <div class="post-author"><span class="post-avatar">${initials}</span><span>${post.author || ''}</span></div>
        `;
      } else {
        a.innerHTML = `
          <div class="post-row-meta">
            <span class="post-tag" style="color:${colorVar}">${cat}</span>
            <span class="post-date">${post.date || ''}</span>
          </div>
          <div class="post-row-content">
            <h3>${post.title}</h3>
            <p class="post-excerpt">${post.description || ''}</p>
          </div>
          <div class="post-author"><span class="post-avatar">${initials}</span><span>${post.author || ''}</span></div>
        `;
      }
      container.appendChild(a);
    });
  }

  renderPosts(null);
  block.appendChild(container);

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('.post-filter');
    if (!btn) return;
    filters.querySelectorAll('.post-filter').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderPosts(btn.dataset.category || null);
  });
}
