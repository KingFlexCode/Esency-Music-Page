 // -------- Shared posts data (copy from your main page to keep 1 source of truth) --------
    const posts = [
      {
        id: "the-power-of-writing-and-producing-your-own-music",
        title: "The Power of Writing and Producing Your Own Music",
        date: "2025-09-01",
        tags: ["song writing", "artist producer", "producing", "music producer", "music artist"],
        excerpt: "Being an artist today isn’t just about writing lyrics or singing melodies—it’s about taking full ownership of your sound.",
        cover: "../assets/images/blog-images/music-studio.avif",
        // Either inline HTML content, OR a path to fetch (e.g., "./slide.html")
        content: `
          <h2>Being an Artist and Producer</h2>
          <p>Being an artist today isn’t just about writing lyrics or singing melodies—it’s about taking full ownership of your sound. When you not only write your own songs but also produce for yourself and others, you unlock a level of creative freedom and professional opportunity that can transform your career.</p>
          <h2>Creative Freedom and Artistic Identity</h2>
          <p>Producing your own records means you aren’t waiting on someone else to shape your sound. You set the tone, the energy, and the mood exactly how you envision it. This kind of creative control allows your music to stay authentic and true to your vision, while also giving you the flexibility to experiment with new ideas, sounds, and styles without outside limitations.</p>
          <h2>Building Sustainable Income</h2>
          <p>Beyond creativity, producing is also a business move. When you can produce not only for yourself but also for other artists, you’re essentially creating another stream of income. That money can be reinvested into your own projects—studio sessions, videos, marketing, and collaborations. Instead of waiting for a label or sponsor, you fund your own growth, which keeps you independent and moving forward.</p>
          <h2>Networking Through Collaboration</h2>
          <p>Working on other artists’ projects doesn’t just pay—it builds connections. Every session is a chance to learn from someone else’s style, perspective, and workflow. These collaborations help you expand your sound, sharpen your skills, and grow your network in the music industry. Each track you produce becomes part of your portfolio, opening doors to bigger opportunities and new audiences.</p>
          <img src="../assets/images/blog-images/studio-production.avif"/>
          <h2>The Edge in Today’s Music Industry</h2>
          <p>Artists who can both write and produce are in a unique position. You’re more versatile, more independent, and more attractive to potential collaborators and industry players. In an era where self-reliance and individuality are celebrated, being both a songwriter and producer sets you apart. It’s a creative and financial advantage that allows you to move with confidence and control in your career.</p>
          <p>Bottom line: Writing and producing isn’t just a skill set—it’s a strategy. It’s how you create your own lane, sustain your growth, and keep your art authentic while still building the connections and resources you need to thrive.</P>
        `
      },
      {
        id: "slide-by-esency",
        title: 'New Release! "SLIDE" by Esency dropping soon',
        date: "2025-09-01",
        tags: ["new release", "slide by esency", "new song", "slide up on me"],
        excerpt: "With R&B season coming soon, a new single with catchy melodys, addictive drum bounce, and catchy hook is soon to drop.",
        cover: "../assets/images/Esency-Photos/Smoky Street Nights_100.JPG",
        // Either inline HTML content, OR a path to fetch (e.g., "./slide.html")
        content: `
          <h1>SLIDE</h1>
          <p>With R&amp;B season coming soon, <strong>“Slide”</strong> is primed with catchy melodies, an addictive drum bounce, and a hook that sticks.</p>
          <h2>The Sound</h2>
          <p>Smooth R&amp;B textures layered over urban percussion—intimate for late nights, punchy for the club.</p>
          <h2>The Vibe</h2>
          <p>“Slide” is movement: sliding into love, sliding through the city, sliding past distractions. Effortless energy.</p>
          <h2>Release Info</h2>
          <p>Dropping soon on all platforms. Follow <a href="https://www.instagram.com/esencyofficial/" target="_blank" rel="noopener">@esencyofficial</a> for the date and pre-save.</p>
        `
      },
      {
        id: "nada-personal-album-breakdown",
        title: "Nada Personal Album Track by Track Breakdown",
        date: "2025-08-28",
        tags: ["feature", "album", "nada personal", "latin album"],
        excerpt: "Inside the song writing, melodies, drums, bass lines, and late-night sessions that shaped 'Nada Personal'.",
        cover: "../assets/images/Album Art/nada-personal-album-art.jpg",
        content: `
          <p>We unpack the textures, influences, and late-night sessions that shaped <em>Nada Personal</em>.</p>
          <h2>1) Opening Energy</h2>
          <p>Drums, tempo, and hook—plus the Bronx flavor that sets the tone.</p>
          <h2>2) Melodic Center</h2>
          <p>Vocal chain choices, reverb tails, and ad-lib stacks.</p>
          <h2>3) Outro & Transitions</h2>
          <p>Arrangement decisions that keep movement alive without overstuffing the mix.</p>
        `
      }
    ];

    // -------- Utilities to match your main page --------
    const fmtDate = (iso) =>
      new Date(iso + "T12:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

    const readingTime = (html) => {
      const tmp = document.createElement("div");
      tmp.innerHTML = html || "";
      const words = (tmp.innerText || "").trim().split(/\s+/).filter(Boolean).length;
      return `${Math.max(1, Math.round(words / 200))} min read`;
    };

    // Local-only view store (same key as your list page)
    const viewStore = {
      key: "esency_blog_views",
      cache: null,
      _load(){ if(this.cache) return this.cache; try{ this.cache = JSON.parse(localStorage.getItem(this.key)||"{}"); } catch(e){ this.cache = {}; } return this.cache; },
      _save(){ localStorage.setItem(this.key, JSON.stringify(this.cache||{})); },
      get(id){ return (this._load()[id] ?? 0); },
      set(id,n){ this._load()[id]=n; this._save(); return n; },
      increment(id){ return this.set(id, this.get(id)+1); }
    };
// -------- Router: get id from ?id=... OR from filename, then render --------
(function boot(){
  const params = new URLSearchParams(location.search);
  let id = params.get("id");

  // If no ?id, derive from filename: /pages/posts/<slug>.html  ->  <slug>
  if (!id) {
    const m = location.pathname.match(/\/posts\/([^\/]+)\.html$/);
    if (m) id = m[1];
  }

  // Find the post
  const post = posts.find(p => p.id === id);
  if (!post) {
    // No silent fallback to posts[0]; show a helpful 404-style message
    document.getElementById("post").innerHTML = `
      <div class="content" style="padding:16px">
        <h1>Post not found</h1>
        <p>We couldn’t find a post with id <code>${id ?? '(none)'}</code>.</p>
        <h3>Recent posts</h3>
        <ul>
          ${posts.slice(0,5).map(p => `<li><a href="./${p.id}.html">${p.title}</a></li>`).join('')}
        </ul>
      </div>`;
    document.getElementById("year").textContent = new Date().getFullYear();
    return;
  }

  const idx = posts.findIndex(p => p.id === post.id);

  // Fill meta
  document.title = `${post.title} • Esency Blog`;
  document.getElementById("post-title").textContent = post.title;

  const fmtDate = (iso) =>
    new Date(iso + "T12:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  document.getElementById("post-date").textContent =
    fmtDate(post.date);

  document.getElementById("post-tags").innerHTML =
    (post.tags||[]).map(t=>`<span class="tag">#${t}</span>`).join("");

  // IMPORTANT: Make sure your cover paths are correct from /pages/posts/.
  // If your data uses "../assets/...", that is often WRONG here — you likely need "../../assets/..."
  // Best: store cover paths relative to the site root (e.g. "/assets/...") or fix the strings in `posts`.
  document.getElementById("post-cover").src = post.cover;
  document.getElementById("post-cover").alt = post.title;

  // Content
  const contentHTML = post.content || "<p>Post content coming soon.</p>";
  document.getElementById("post-content").innerHTML = contentHTML;

  // Reading time
  (function(){
    const tmp = document.createElement("div");
    tmp.innerHTML = contentHTML;
    const words = (tmp.textContent||"").trim().split(/\s+/).filter(Boolean).length;
    document.getElementById("read-time").textContent = `${Math.max(1, Math.round(words/200))} min read`;
  })();

  // Views
  document.getElementById("views").textContent = viewStore.increment(post.id);

  // Prev/Next — link to sibling HTML files in the same folder
  const prev = posts[idx-1] || null;
  const next = posts[idx+1] || null;

  const prevLink = document.getElementById("prevLink");
  const nextLink = document.getElementById("nextLink");

  if (prev){
    prevLink.href = `./${prev.id}.html`;
    document.getElementById("prevTitle").textContent = prev.title;
    prevLink.style.removeProperty('pointer-events');
    prevLink.style.removeProperty('opacity');
  } else {
    prevLink.style.pointerEvents = "none";
    prevLink.style.opacity = ".5";
    document.getElementById("prevTitle").textContent = "No previous post";
  }

  if (next){
    nextLink.href = `./${next.id}.html`;
    document.getElementById("nextTitle").textContent = next.title;
    nextLink.style.removeProperty('pointer-events');
    nextLink.style.removeProperty('opacity');
  } else {
    nextLink.style.pointerEvents = "none";
    nextLink.style.opacity = ".5";
    document.getElementById("nextTitle").textContent = "No next post";
  }

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();
})();