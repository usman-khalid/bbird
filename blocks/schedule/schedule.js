export default async function decorate(block) {
  // 1. Read config from block rows (key-value pairs)
  const config = {};
  [...block.children].forEach((row) => {
    const key = row.children[0]?.textContent?.trim().toLowerCase();
    const val = row.children[1]?.textContent?.trim();
    if (key && val) config[key] = val;
  });
  const source = config.source || '/schedule';

  // 2. Fetch data
  const resp = await fetch(`${source}.json`);
  const json = await resp.json();
  const events = json.data || [];

  // 3. Clear block and render
  block.textContent = '';

  const grid = document.createElement('div');
  grid.className = 'schedule-grid';

  events.forEach((event) => {
    const card = document.createElement('div');
    card.className = `schedule-card${event.status === 'next' ? ' featured' : ''}`;

    const statusLabel = event.status === 'next' ? 'NEXT' : event.status === 'upcoming' ? 'COMING UP' : 'PAST';

    card.innerHTML = `
      <div class="schedule-card-header">
        <span class="schedule-status">${statusLabel}</span>
        <span class="schedule-date">${event.date}</span>
      </div>
      <h3>${event.city}</h3>
      <p>${event.description}</p>
      ${event.registerUrl ? `<div class="schedule-actions"><a href="${event.registerUrl}" class="schedule-btn${event.status === 'next' ? ' primary' : ''}">${event.registerLabel || 'Learn more'}</a></div>` : ''}
    `;

    grid.appendChild(card);
  });

  block.appendChild(grid);
}
