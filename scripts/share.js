/* =========================================================================
   Esency Blog — Share System
   Handles: share bar creation, copy toast, list-page overlays, single-post rail
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

  // Native share (mobile)
  if (navigator.share) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.title = "Share";
    btn.textContent = "↑";
    btn.addEventListener("click", () => {
      navigator.share({ title: safeTitle, url: safeUrl }).catch(() => {});
    });
    bar.appendChild(btn);
  }

  const u = encodeURIComponent(safeUrl);
  const t = encodeURIComponent(safeTitle);

  // helper for links
  const link = (href, label, title) => {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = label;
    a.title = title;
    return a;
  };

  // Platform links
  bar.append(
    link(`https://twitter.com/intent/tweet?text=${t}&url=${u}`, "X", "Share on X"),
    link(`https://www.facebook.com/sharer/sharer.php?u=${u}`, "f", "Share on Facebook"),
    link(`https://www.reddit.com/submit?url=${u}&title=${t}`, "r", "Share on Reddit")
  );

  // Copy link button
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
   BLOG LIST PAGE  → Overlay share icons on each post card
   ======================================================================= */
function injectListShares() {
  const list = document.getElementById("posts");
  if (!list) return;

  const cards = Array.from(list.querySelectorAll(".card, .post-card"))
    .filter((el) => el.querySelector("a[href]"));

  cards.forEach((card) => {
    if (card.dataset.shareInjected === "1") return;
    card.dataset.shareInjected = "1";
    card.classList.add("post-card");

    const link = card.querySelector("a[href]");
    const titleEl =
      card.querySelector("h2, h3, .post-title, .title") || link;
    const url = new URL(link.getAttribute("href"), location.origin).href;
    const title = titleEl ? titleEl.textContent.trim() : document.title;

    const bar = makeShareBar(title, url);
    bar.classList.add("share--outside-right"); // vertical beside card
    card.appendChild(bar);
  });
}

/* Observe mutations to handle late-rendered posts */
const listObserver = new MutationObserver(injectListShares);
document.addEventListener("DOMContentLoaded", () => {
  const posts = document.getElementById("posts");
  if (posts) listObserver.observe(posts, { childList: true, subtree: true });
  injectListShares();
});

/* =========================================================================
   SINGLE POST PAGE → Floating side rail
   ======================================================================= */
function injectArticleRail() {
  if (document.getElementById("posts")) return; // skip list page

  const article = document.querySelector("article.post#post");
  if (!article || document.querySelector(".share-rail")) return;

  const title =
    (document.getElementById("post-title")?.textContent || document.title).trim();
  const url = location.href;

  const rail = makeShareBar(title, url);
  rail.classList.add("share-rail", "share--circle");
  document.body.appendChild(rail);
}

document.addEventListener("DOMContentLoaded", injectArticleRail);