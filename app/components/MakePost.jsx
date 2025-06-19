"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";

const MakePost = () => {
  const { isLoggedIn, user, logout, loading } = useAuth();

  const [postContent, setPostContent] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    setSubmitting(true);
    try {
      // Replace with your actual API endpoint
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: postContent, userId: user?.id }),
      });
      if (res.ok) {
        setPostContent("");
        // Optionally, show a success message or refresh posts
      }
    } catch (err) {
      // Handle error (optionally show error message)
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <p>What is on your mind today?</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="border border-white-900"
              disabled={submitting}
              placeholder="Write your post..."
            />
            <button type="submit" disabled={submitting || !postContent.trim()}>
              {submitting ? "Posting..." : "Post"}
            </button>
          </form>
        </div>
      ) : (
        <div className="m-200">
          <p>The user is not logged in</p>
        </div>
      )}
    </div>
  );
};

export default MakePost;
