export default async function decorate(block) {
  block.textContent = '';

  const resp = await fetch('/schedule.json');
  if (!resp.ok) {
    block.textContent = 'Unable to load schedule.';
    return;
  }

  const { data: events } = await resp.json();
  const grid = document.createElement('div');
  grid.className = 'schedule-grid';

  events.forEach((event) => {
    const card = document.createElement('div');
    const isNext = event.status === 'next';
    const isUpcoming = event.status === 'upcoming';
    card.className = `schedule-card${isNext ? ' featured' : ''}`;

    const statusLabel = isNext ? 'NEXT' : isUpcoming ? 'COMING UP' : 'PAST';

    card.innerHTML = `
      <div class="schedule-card-header">
        <span class="schedule-status">${statusLabel}</span>
        <span class="schedule-date">${event.date}</span>
      </div>
      <h3>${event.city}</h3>
      <p>${event.description}</p>
      ${event.registerUrl ? `<div class="schedule-actions"><a href="${event.registerUrl}" class="schedule-btn${isNext ? ' primary' : ''}">${event.registerLabel || 'Learn more'}</a></div>` : ''}
    `;
    grid.appendChild(card);
  });

  block.appendChild(grid);
}
