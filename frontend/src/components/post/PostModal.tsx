import React from 'react';
import PostForm from './PostForm';
import '../../styles/PostModal.css';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Close modal when clicking outside the content
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <div></div>
          <div className="modal-title">Create New Post</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <PostForm onFormComplete={onClose} />
        </div>
      </div>
    </div>
  );
};

export default PostModal;