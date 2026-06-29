// blog.js

function blogCardHtml(post) {
  return `
    <div class="value-row" onclick="window.location.href='blog-post.html?id=${post.id}'">
      <div class="match-info">
        <div class="time">${post.date} &middot; ${post.author}</div>
        <div class="teams" style="margin-top:6px;font-size:1.05em;">${post.title}</div>
        <div style="color:var(--muted);font-size:0.85em;margin-top:4px;">${post.summary || ""}</div>
      </div>
      <div class="pick-cell">Read &rarr;</div>
    </div>`;
}

async function loadBlogs() {
  const container = document.getElementById("blogList");
  try {
    const response = await fetch(`${API_BASE_URL}/api/blogs`);
    if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

    const data = await response.json();
    if (!data.blogs.length) {
      container.innerHTML = `<div class="empty-state">No blog posts yet. Check back soon.</div>`;
      return;
    }

    container.innerHTML = data.blogs.map(blogCardHtml).join("");
  } catch (err) {
    console.error("Failed to load blogs:", err);
    container.innerHTML = `<div class="empty-state">
      Could not connect to the backend.<br>
      Make sure your Render backend is running and API_BASE_URL in config.js is correct.
    </div>`;
  }
}

loadBlogs();
