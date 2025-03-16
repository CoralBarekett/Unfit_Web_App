import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../../services/postService';
import { FaThumbsUp, FaRegThumbsUp, FaComment, FaEdit, FaTrash } from 'react-icons/fa';
import commentService, { Comment } from '../../services/commentService';
import '../../styles/PostItem.css';

interface PostItemProps {
  post: Post;
  currentUserId: string;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
  isInDashboard?: boolean;
  showCommentForm?: boolean;
}

const PostItem: React.FC<PostItemProps> = ({ 
  post, 
  currentUserId, 
  onDelete, 
  onLike,
  isInDashboard = false 
}) => {
  const isOwner = post.owner === currentUserId;
  const hasLiked = post.likes.includes(currentUserId);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  useEffect(() => {
    // Only fetch comments if we're in the dashboard and comments are visible
    if (isInDashboard && showComments) {
      fetchComments();
    }
  }, [showComments, post._id, isInDashboard]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await commentService.getCommentsByPostId(post._id);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    try {
      setSubmitLoading(true);
      const newComment = await commentService.createComment(post._id, commentText.trim());
      
      // If we're in dashboard, add the new comment to the list
      if (isInDashboard) {
        setComments([newComment, ...comments]);
      }
      
      setCommentText('');
      
      // Update local post data with new comment count
      post.commentCount = (post.commentCount || 0) + 1;
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="post-item">
      <div className="post-header">
        <h3 className="post-title">{post.title}</h3>
        <div className="post-meta">
          <span>Posted on {formatDate(post.createdAt)}</span>
        </div>
      </div>
      
      {post.imageUrl && (
        <div className="post-image">
          <img src={post.imageUrl} alt={post.title} />
        </div>
      )}
      
      <div className="post-content">
        <p>{post.content}</p>
      </div>
      
      <div className="post-actions">
        <button 
          className={`like-button ${hasLiked ? 'liked' : ''}`} 
          onClick={() => onLike(post._id)}
        >
          {hasLiked ? <FaThumbsUp /> : <FaRegThumbsUp />} {post.likes.length}
        </button>
        
        {isInDashboard ? (
          <button 
            className={`comment-button ${showComments ? 'active' : ''}`}
            onClick={toggleComments}
          >
            <FaComment /> {post.commentCount} {showComments ? 'Hide Comments' : 'Show Comments'}
          </button>
        ) : (
          <button 
            className="comment-button"
            onClick={() => setShowComments(!showComments)}
          >
            <FaComment /> {post.commentCount} {showComments ? 'Hide Form' : 'Comment'}
          </button>
        )}
        
        {isOwner && (
          <div className="owner-actions">
            <Link to={`/posts/edit/${post._id}`} className="edit-button">
              <FaEdit /> Edit
            </Link>
            <button onClick={() => onDelete(post._id)} className="delete-button">
              <FaTrash /> Delete
            </button>
          </div>
        )}
      </div>
      
      {/* Show comment form on any post when toggled */}
      {showComments && (
  <div className="comments-section">
    <form onSubmit={handleSubmitComment} className="comment-form">
      <textarea
        placeholder="Write a comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        className="comment-input"
        rows={2}
      />
      <button 
        type="submit" 
        className="comment-submit-btn"
        disabled={submitLoading || !commentText.trim()}
      >
        {submitLoading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
          
          {/* Only show comment list on dashboard */}
          {isInDashboard && (
      <div className="comments-container">
        <h4 className="comments-heading">Comments ({comments.length})</h4>
        {loading ? (
          <div className="loading-comments">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="no-comments">No comments yet</div>
        ) : (
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment._id} className="comment-item">
                <div className="comment-content">{comment.content}</div>
                <div className="comment-meta">
                  <small>{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Just now'}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
)}
</div>
);
}

export default PostItem;