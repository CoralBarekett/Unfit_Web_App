import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import postService, { CreatePostData } from '../../services/postService';
import fileService from '../../services/fileService';
import '../../styles/PostFormModal.css';

interface PostFormProps {
  isEditing?: boolean;
  onFormComplete?: () => void; // Added callback for modal integration
}

const PostForm: React.FC<PostFormProps> = ({ isEditing = false, onFormComplete }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      fetchPost(id);
    }
  }, [isEditing, id]);

  const fetchPost = async (postId: string) => {
    try {
      setLoading(true);
      const postData = await postService.getPostById(postId);
      setTitle(postData.title);
      setContent(postData.content);
      if (postData.imageUrl) {
        setImageUrl(postData.imageUrl);
        setImagePreview(postData.imageUrl);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Could not fetch post data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    try {
      setLoading(true);
      let finalImageUrl = imageUrl;
      
      // Upload new image if selected
      if (imageFile) {
        finalImageUrl = await fileService.uploadImage(imageFile);
      }
      
      const postData: CreatePostData = {
        title,
        content,
        imageUrl: finalImageUrl || undefined
      };
      
      if (isEditing && id) {
        await postService.updatePost(id, postData);
      } else {
        await postService.createPost(postData);
      }
      
      // Call the onFormComplete callback if provided (for modal)
      if (onFormComplete) {
        onFormComplete();
      } else {
        // Otherwise navigate as before
        navigate(isEditing ? '/my-posts' : '/');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      setError('Error saving post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="loading">Loading post data...</div>;
  }

  return (
    <div className="post-form-container">
      <h2>{isEditing ? 'Edit Post' : 'Create New Post'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here..."
            rows={6}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <button 
                type="button" 
                className="remove-image-button" 
                onClick={handleRemoveImage}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => onFormComplete ? onFormComplete() : navigate(isEditing ? '/my-posts' : '/')} 
            className="cancel-button"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;