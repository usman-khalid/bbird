const avatarColors = {
  teal:   { bg: 'var(--accent-3)', fg: '#04342C' },
  coral:  { bg: 'var(--accent)',   fg: '#4A1B0C' },
  purple: { bg: 'var(--accent-5)', fg: '#26215C' },
  blue:   { bg: 'var(--accent-4)', fg: '#042C53' },
  pink:   { bg: 'var(--accent-2)', fg: '#4B1528' },
  green:  { bg: 'var(--accent-6)', fg: '#173404' },
  gray:   { bg: '#888780',         fg: '#2C2C2A' },
};

export default function decorate(block) {
  const isCompact = block.classList.contains('compact');
  const rows = [...block.children];
  const members = rows.map((row) => {
    const cols = [...row.children];
    return {
      initials: cols[0]?.textContent?.trim() || '',
      name:     cols[1]?.textContent?.trim() || '',
      role:     cols[2]?.textContent?.trim() || '',
      bio:      cols[3]?.textContent?.trim() || '',
      color:    cols[4]?.textContent?.trim()?.toLowerCase() || 'gray',
    };
  });

  block.textContent = '';

  if (isCompact) {
    const maxShow = 6;
    const container = document.createElement('div');
    container.className = 'team-avatars';

    members.slice(0, maxShow).forEach((m) => {
      const colors = avatarColors[m.color] || avatarColors.gray;
      const av = document.createElement('div');
      av.className = 'team-avatar compact';
      av.textContent = m.initials;
      av.style.backgroundColor = colors.bg;
      av.style.color = colors.fg;
      container.appendChild(av);
    });

    if (members.length > maxShow) {
      const more = document.createElement('span');
      more.className = 'team-overflow';
      more.textContent = `+${members.length - maxShow}`;
      container.appendChild(more);
    }

    block.appendChild(container);
  } else {
    const grid = document.createElement('div');
    grid.className = 'team-members';

    members.forEach((m) => {
      const colors = avatarColors[m.color] || avatarColors.gray;
      const card = document.createElement('div');
      card.className = 'team-member';
      card.innerHTML = `
        <div class="team-avatar" style="background:${colors.bg}; color:${colors.fg};">${m.initials}</div>
        <div class="team-info">
          <h3>${m.name}</h3>
          <p class="team-role">${m.role}</p>
          <p class="team-bio">${m.bio}</p>
        </div>
      `;
      grid.appendChild(card);
    });

    block.appendChild(grid);
  }
}
