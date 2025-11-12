/* =========================================================================
   Esency Blog — Unified Share System
   Handles: share bar creation, copy toast, list-page overlays, post-page rail
   ======================================================================= */

/* ===== Toast ===== */
function showCopyToast(msg) {
  let toast = document.getElementById("copy-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "copy-toast";
    toast.className = "copy-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1500);
}

/* ===== Share Bar Factory ===== */
function makeShareBar(title, url) {
  const safeTitle = (title || document.title).trim();
  const safeUrl = url || location.href;
  const bar = document.createElement("div");
  bar.className = "share share--circle";

  const u = encodeURIComponent(safeUrl);
  const t = encodeURIComponent(safeTitle);

  // ↑ Button — Always visible
  const shareBtn = document.createElement("button");
  shareBtn.type = "button";
  shareBtn.title = "Share";
  shareBtn.textContent = "↑";
  shareBtn.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: safeTitle, url: safeUrl });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(safeUrl);
        showCopyToast("Link copied!");
      } catch {
        prompt("Copy this link:", safeUrl);
      }
    }
  });
  bar.appendChild(shareBtn);

  // Social Links
  const mk = (href, label, title) => {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = label;
    a.title = title;
    return a;
  };
  bar.append(
    mk(`https://twitter.com/intent/tweet?text=${t}&url=${u}`, "X", "Share on X"),
    mk(`https://www.facebook.com/sharer/sharer.php?u=${u}`, "f", "Share on Facebook"),
    mk(`https://www.reddit.com/submit?url=${u}&title=${t}`, "r", "Share on Reddit")
  );

  // Copy Link Button
  const copy = document.createElement("button");
  copy.type = "button";
  copy.textContent = "⧉";
  copy.title = "Copy link";
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(safeUrl);
      showCopyToast("Link copied!");
    } catch {
      prompt("Copy this link:", safeUrl);
    }
  });
  bar.appendChild(copy);

  return bar;
}

/* =========================================================================
   BLOG LIST PAGE → Overlay shares beside cards
   ======================================================================= */
function injectListShares() {
  const list = document.getElementById("posts");
  if (!list) return;

  const cards = Array.from(list.querySelectorAll(".card, .post-card"))
    .filter((el) => el.querySelector("a[href]"));

  cards.forEach((card) => {
    if (card.dataset.shareInjected === "1") return;
    card.dataset.shareInjected = "1";
    const link = card.querySelector("a[href]");
    const titleEl = card.querySelector("h2, h3, .post-title, .title") || link;
    const url = new URL(link.getAttribute("href"), location.origin).href;
    const title = titleEl ? titleEl.textContent.trim() : document.title;

    const bar = makeShareBar(title, url);
    bar.classList.add("share--outside-right");
    card.appendChild(bar);
  });
}

/* =========================================================================
   POST PAGE → Floating share rail beside cover image
   ======================================================================= */
function waitForPostReady(callback) {
  const post = document.querySelector("article.post#post");
  if (!post) return;
  const check = () => {
    const title = document.getElementById("post-title");
    const cover = document.getElementById("post-cover");
    if (title && title.textContent !== "Loading…" && cover && cover.src) {
      callback();
    } else {
      setTimeout(check, 300);
    }
  };
  check();
}

function injectPostShareRail() {
  const article = document.querySelector("article.post#post");
  if (!article || article.querySelector(".share-rail")) return;

  const title = document.getElementById("post-title")?.textContent || document.title;
  const url = location.href;
  const rail = makeShareBar(title, url);
  rail.classList.add("share-rail", "share--circle");
  article.appendChild(rail);
}

/* =========================================================================
   INIT
   ======================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const posts = document.getElementById("posts");
  if (posts) injectListShares();
  waitForPostReady(injectPostShareRail);
});
