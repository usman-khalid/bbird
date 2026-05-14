const categoryColors = {
  engineering: 'var(--accent)',
  'field notes': 'var(--accent-3)',
  tutorials: 'var(--accent-4)',
  'case study': 'var(--accent-2)',
  'case studies': 'var(--accent-2)',
  announcements: 'var(--accent-6)',
};

export default async function decorate(block) {
  // 1. Read config
  const config = {};
  [...block.children].forEach((row) => {
    const key = row.children[0]?.textContent?.trim().toLowerCase();
    const val = row.children[1]?.textContent?.trim();
    if (key && val) config[key] = val;
  });
  const source = config.source || '/writing';
  const limit = parseInt(config.limit, 10) || 20;

  // 2. Fetch query-index
  let posts = [];
  try {
    const resp = await fetch(`${source}/query-index.json`);
    const json = await resp.json();
    posts = (json.data || [])
      .filter((p) => p.path.startsWith(`${source}/`))
      .sort((a, b) => b.lastModified - a.lastModified)
      .slice(0, limit);
  } catch (e) {
    block.textContent = '';
    const err = document.createElement('p');
    err.className = 'post-list-error';
    err.textContent = 'Failed to load posts.';
    block.appendChild(err);
    return;
  }

  // 3. Clear block
  block.textContent = '';

  if (!posts.length) {
    const empty = document.createElement('p');
    empty.className = 'post-list-empty';
    empty.textContent = 'No posts found.';
    block.appendChild(empty);
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
  allBtn.textContent = `All · ${posts.length}`;
  allBtn.dataset.category = '';
  filters.appendChild(allBtn);

  Object.entries(categories).forEach(([cat, count]) => {
    const btn = document.createElement('button');
    btn.className = 'post-filter';
    btn.textContent = `${cat} · ${count}`;
    btn.dataset.category = cat;
    filters.appendChild(btn);
  });

  block.appendChild(filters);

  // Posts container
  const container = document.createElement('div');
  container.className = 'post-list-items';

  function getInitials(author) {
    return (author || 'BB')
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

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
      const initials = getInitials(post.author);

      if (i === 0 && !filterCat) {
        // Featured card
        a.innerHTML = `
          <div class="post-tag" style="color:${colorVar}">${cat} · ${post.date || ''}</div>
          <h3>${post.title || ''}</h3>
          <p class="post-excerpt">${post.description || ''}</p>
          <div class="post-author">
            <span class="post-avatar">${initials}</span>
            <span>${post.author || ''}</span>
          </div>
        `;
      } else {
        // Row format
        a.innerHTML = `
          <div class="post-row-meta">
            <span class="post-tag" style="color:${colorVar}">${cat}</span>
            <span class="post-date">${post.date || ''}</span>
          </div>
          <div class="post-row-content">
            <h3>${post.title || ''}</h3>
            <p class="post-excerpt">${post.description || ''}</p>
          </div>
          <div class="post-author">
            <span class="post-avatar">${initials}</span>
            <span>${post.author || ''}</span>
          </div>
        `;
      }

      container.appendChild(a);
    });

    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'post-list-empty';
      empty.textContent = 'No posts in this category.';
      container.appendChild(empty);
    }
  }

  renderPosts(null);
  block.appendChild(container);

  // Filter click handling
  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('.post-filter');
    if (!btn) return;
    filters.querySelectorAll('.post-filter').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderPosts(btn.dataset.category || null);
  });
}
