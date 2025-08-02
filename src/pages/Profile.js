import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const Profile = () => {
  const { id } = useParams(); // profile user id
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isSelf = currentUser?.id === id; // or currentUser?._id depending on shape

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [nameEdit, setNameEdit] = useState("");
  const [bioEdit, setBioEdit] = useState("");

  // Fetch profile + posts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5050/api/users/${id}`);
        setProfile(res.data.user);
        setPosts(res.data.posts);
        setNameEdit(res.data.user.name || "");
        setBioEdit(res.data.user.bio || "");
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    fetchProfile();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:5050/api/users/${id}`,
        { name: nameEdit, bio: bioEdit },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProfile(res.data);
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  // Reuse like/comment logic from Home if desired
  const handleLike = async (postId) => {
    try {
      await axios.post(
        `http://localhost:5050/api/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // refresh posts
      const res = await axios.get(`http://localhost:5050/api/users/${id}`);
      setPosts(res.data.posts);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const [commentInputs, setCommentInputs] = useState({});
  const submitComment = async (postId) => {
    try {
      await axios.post(
        `http://localhost:5050/api/posts/${postId}/comment`,
        { text: commentInputs[postId] || "" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // refresh posts
      const res = await axios.get(`http://localhost:5050/api/users/${id}`);
      setPosts(res.data.posts);
      setCommentInputs((p) => ({ ...p, [postId]: "" }));
    } catch (err) {
      console.error("Error commenting:", err);
    }
  };

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{profile.name}'s Profile</h2>
      <p>
        <strong>Email:</strong> {profile.email}
      </p>
      <p>
        <strong>Bio:</strong> {profile.bio || "No bio yet."}
      </p>

      {isSelf && (
        <div style={{ marginTop: "1rem" }}>
          {editing ? (
            <form onSubmit={handleSave}>
              <div>
                <input
                  value={nameEdit}
                  onChange={(e) => setNameEdit(e.target.value)}
                  placeholder="Name"
                />
              </div>
              <div>
                <textarea
                  value={bioEdit}
                  onChange={(e) => setBioEdit(e.target.value)}
                  placeholder="Bio"
                  rows={3}
                />
              </div>
              <button type="submit">Save</button>{" "}
              <button type="button" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </form>
          ) : (
            <button onClick={() => setEditing(true)}>Edit Profile</button>
          )}
        </div>
      )}

      <hr />

      <div>
        <h3>Posts by {profile.name}</h3>
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          posts.map((post) => {
            const likedByUser = post.likes?.some(
              (l) =>
                l === currentUser.id || (l?._id && l._id === currentUser.id)
            );
            return (
              <div key={post._id} style={{ marginBottom: "1.5rem" }}>
                <strong>{post.author?.name || "Anonymous"}</strong>
                <p>{post.text}</p>
                <small>{new Date(post.createdAt).toLocaleString()}</small>

                <div style={{ marginTop: "0.5rem" }}>
                  ❤️ {post.likes?.length || 0}{" "}
                  <button onClick={() => handleLike(post._id)}>
                    {likedByUser ? "Unlike" : "Like"}
                  </button>
                </div>

                <div style={{ marginTop: "0.5rem" }}>
                  <strong>Comments:</strong>
                  {post.comments?.map((comment, idx) => (
                    <div key={idx}>
                      <small>
                        <b>{comment.user?.name || "User"}:</b> {comment.text}
                      </small>
                    </div>
                  ))}
                  <div style={{ marginTop: "0.5rem" }}>
                    <input
                      type="text"
                      placeholder="Add comment..."
                      value={commentInputs[post._id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post._id]: e.target.value,
                        }))
                      }
                      style={{ marginRight: "0.5rem" }}
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

export default Profile;
