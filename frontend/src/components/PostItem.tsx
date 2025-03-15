import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../services/postService';
import { FaThumbsUp, FaRegThumbsUp, FaComment, FaEdit, FaTrash } from 'react-icons/fa';
import './PostItem.css';

interface PostItemProps {
  post: Post;
  currentUserId: string;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, currentUserId, onDelete, onLike }) => {
  const isOwner = post.owner === currentUserId;
  const hasLiked = post.likes.includes(currentUserId);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
        <Link to={`/posts/${post._id}/comments`} className="comment-button">
          <FaComment /> {post.commentCount}
        </Link>
        
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
    </div>
  );
};

export default PostItem;