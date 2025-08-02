import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Home = () => {
  const [text, setText] = useState("");
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({}); // { postId: "comment text" }
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;

  // Fetch posts
  const fetchPosts = async () => {
    const token = getToken();
    try {
      const res = await axios.get("http://localhost:5050/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      alert("🔐 Not authenticated.");
      navigate("/login");
      return;
    }
    fetchPosts();
  }, [navigate]);

  // Create post with validation
  const handlePost = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return alert("🔐 Not authenticated.");

    if (!text.trim()) {
      alert("Post cannot be empty.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5050/api/posts",
        { text: text.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setText("");
      await fetchPosts();
    } catch (err) {
      console.error("❌ Post creation error:", err);
      alert("❌ Failed to create post");
    }
  };

  // Start editing a post
  const startEdit = (post) => {
    setEditingPostId(post._id);
    setEditingText(post.text);
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditingText("");
  };

  const saveEdit = async (postId) => {
    const token = getToken();
    if (!editingText.trim()) {
      alert("Edited post cannot be empty.");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5050/api/posts/${postId}`,
        { text: editingText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingPostId(null);
      setEditingText("");
      await fetchPosts();
    } catch (err) {
      console.error("❌ Edit post error:", err);
      alert("Failed to update post");
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const token = getToken();
    try {
      await axios.delete(`http://localhost:5050/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchPosts();
    } catch (err) {
      console.error("❌ Delete post error:", err);
      alert("Failed to delete post");
    }
  };

  // Like toggle
  const toggleLike = async (postId) => {
    const token = getToken();
    try {
      await axios.post(
        `http://localhost:5050/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchPosts();
    } catch (err) {
      console.error("❌ Error liking post:", err);
    }
  };

  // Submit comment with validation
  const submitComment = async (postId) => {
    const token = getToken();
    const commentText = comments[postId] || "";
    if (!commentText.trim()) {
      alert("Comment cannot be empty.");
      return;
    }
    try {
      await axios.post(
        `http://localhost:5050/api/posts/${postId}/comment`,
        { text: commentText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => ({ ...prev, [postId]: "" }));
      await fetchPosts();
    } catch (err) {
      console.error("❌ Error adding comment:", err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Welcome to the Feed 🚀</h2>

      {/* Post Form */}
      <form onSubmit={handlePost}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          rows="4"
          style={{ width: "100%", marginBottom: "1rem" }}
        />
        <button type="submit">Post</button>
      </form>

      <hr />

      <div>
        <h3>Latest Posts</h3>
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          posts.map((post) => {
            const likedByUser = post.likes?.some(
              (l) =>
                String(l) === String(userId) ||
                (l?._id && String(l._id) === String(userId))
            );
            const isAuthor =
              String(post.author?._id || post.author?.id) === String(userId);
            return (
              <div key={post._id} style={{ marginBottom: "2rem" }}>
                <strong>
                  <Link
                    to={`/profile/${post.author?._id || post.author?.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {post.author?.name || "Anonymous"}
                  </Link>
                </strong>

                {editingPostId === post._id ? (
                  <>
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={3}
                      style={{ width: "100%", marginTop: "0.5rem" }}
                    />
                    <div style={{ marginTop: "0.5rem" }}>
                      <button onClick={() => saveEdit(post._id)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <p>{post.text}</p>
                )}

                <small>{new Date(post.createdAt).toLocaleString()}</small>

                {/* Actions: like / edit / delete */}
                <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.75rem" }}>
                  <div>
                    ❤️ {post.likes?.length || 0}{" "}
                    <button onClick={() => toggleLike(post._id)}>
                      {likedByUser ? "Unlike" : "Like"}
                    </button>
                  </div>

                  {isAuthor && editingPostId !== post._id && (
                    <>
                      <button onClick={() => startEdit(post)}>Edit</button>
                      <button onClick={() => deletePost(post._id)}>Delete</button>
                    </>
                  )}
                </div>

                {/* Comments */}
                <div style={{ marginTop: "1rem" }}>
                  <strong>Comments:</strong>
                  {post.comments?.map((comment, idx) => (
                    <div key={idx}>
                      <small>
                        <b>{comment.user?.name || "User"}:</b> {comment.text}
                      </small>
                    </div>
                  ))}
                  <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={comments[post._id] || ""}
                      onChange={(e) =>
                        setComments((prev) => ({
                          ...prev,
                          [post._id]: e.target.value,
                        }))
                      }
                      style={{ flex: 1 }}
                    />
                    <button onClick={() => submitComment(post._id)}>
                      Comment
                    </button>
                  </div>
                </div>

                <hr />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;
