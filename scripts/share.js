// scripts/share.js
function showCopyToast(msg) {
  let toast = document.getElementById('copy-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'copy-toast';
    toast.className = 'copy-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}

function makeShareBar(title, url) {
  const safeTitle = (title || document.title).trim();
  const safeUrl = url ? String(url) : location.href;

  const bar = document.createElement('div');
  bar.className = 'share';

  // Native Web Share (mobile/browsers that support it)
  if (navigator.share) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Share';
    btn.addEventListener('click', () => {
      navigator.share({ title: safeTitle, url: safeUrl }).catch(() => {});
    });
    bar.appendChild(btn);
  }

  // Helpers
  const u = encodeURIComponent(safeUrl);
  const t = encodeURIComponent(safeTitle);
  const mk = (href, label) => {
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = label;
    return a;
  };

  // Popular networks
  bar.append(
    mk(`https://twitter.com/intent/tweet?text=${t}&url=${u}`, 'X'),
    mk(`https://www.facebook.com/sharer/sharer.php?u=${u}`, 'Facebook'),
    mk(`https://www.reddit.com/submit?url=${u}&title=${t}`, 'Reddit'),
    mk(`https://api.whatsapp.com/send?text=${t}%20${u}`, 'WhatsApp')
  );

  // Copy link
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.textContent = 'Copy link';
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(safeUrl);
      showCopyToast('Link copied!');
    } catch {
      prompt('Copy this link:', safeUrl);
    }
  });
  bar.appendChild(copy);

  return bar;
}

// Auto-inject a share bar for each post card in #posts
document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('posts');
  if (!list) return;

  // Go through each direct child (your cards)
  Array.from(list.children).forEach(card => {
    // Try to find title + link inside the card
    const link = card.querySelector('a[href]');
    const titleEl = card.querySelector('h2, h3, .post-title, .title') || link;
    const url = link
      ? new URL(link.getAttribute('href'), location.origin).href
      : location.href;
    const title = titleEl ? titleEl.textContent.trim() : document.title;

    // Avoid duplicating bars if re-rendering
    if (card.querySelector('.share')) return;

    card.appendChild(makeShareBar(title, url));
  });
});
