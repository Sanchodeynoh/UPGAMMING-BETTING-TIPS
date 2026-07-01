// blog-post.js

async function loadPost() {
  const container = document.getElementById("postContainer");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    container.innerHTML = `<div class="empty-state">No post specified.</div>`;
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`);

    if (response.status === 404) {
      container.innerHTML = `<div class="empty-state">Post not found.</div>`;
      return;
    }
    if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

    const post = await response.json();
    const paragraphs = (post.content || "")
      .split("\n\n")
      .map((p) => `<p>${p}</p>`)
      .join("");

    container.innerHTML = `
      <div class="analysis-block">
        <h3 style="font-size:1.4em;">${post.title}</h3>
        <div style="color:var(--muted);font-size:0.85em;margin-bottom:16px;">
          ${post.date} &middot; ${post.author}
        </div>
        ${paragraphs}
      </div>`;
  } catch (err) {
    console.error("Failed to load post:", err);
    container.innerHTML = `<div class="empty-state">
      Could not connect to the backend.<br>
      Make sure your Render backend is running and API_BASE_URL in config.js is correct.
    </div>`;
  }
}

loadPost();
