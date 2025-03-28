import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import postService, { CreatePostData } from "../../services/postService";
import fileService from "../../services/fileService";
import "../../styles/PostFormModal.css";

interface PostFormProps {
  isEditing?: boolean;
  postId?: string;
  onFormComplete?: () => void;
}

const PostForm: React.FC<PostFormProps> = ({
  isEditing = false,
  postId,
  onFormComplete,
}) => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isEditing && postId) {
      fetchPost(postId);
    }
  }, [isEditing, postId]);

  const fetchPost = async (id: string) => {
    try {
      setLoading(true);
      const postData = await postService.getPostById(id);
      setTitle(postData.title);
      setContent(postData.content);
      if (postData.imageUrl) {
        setImageUrl(postData.imageUrl);
        setImagePreview(postData.imageUrl);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      setError("Could not fetch post data");
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
    setImagePreview("");
    setImageUrl("");
  };

  const generateContent = async () => {
    if (!title.trim()) {
      setError("Please enter a title before generating content");
      return;
    }

    try {
      setIsGenerating(true);
      setError("");

      // Call the AI content generation endpoint
      const generatedContent = await postService.generatePostContent(
        title,
        topic
      );
      setContent(generatedContent);
    } catch (error) {
      console.error("Error generating content:", error);
      setError("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      setLoading(true);
      let finalImageUrl = imageUrl;

      // Upload new image if selected
      if (imageFile) {
        console.log("Uploading image file:", imageFile.name);
        try {
          finalImageUrl = await fileService.uploadImage(imageFile);
          console.log("Image uploaded successfully, URL:", finalImageUrl);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          // Continue without the image if upload fails
          finalImageUrl = "";
        }
      }

      const postData: CreatePostData = {
        title,
        content,
        imageUrl: finalImageUrl || undefined,
      };

      console.log("Submitting post data:", postData);

      if (isEditing && postId) {
        console.log(`Updating post with ID: ${postId}`);
        await postService.updatePost(postId, postData);
      } else {
        console.log("Creating new post");
        await postService.createPost(postData);
      }

      console.log("Post saved successfully");

      // Call the onFormComplete callback if provided (for modal)
      if (onFormComplete) {
        onFormComplete();
      } else {
        // Otherwise navigate as before
        navigate(isEditing ? "/my-posts" : "/");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error saving post details:", error.message);
        if ((error as any)?.response) {
          console.error("Response status:", (error as any).response.status);
          console.error("Response data:", (error as any).response.data);
        }
      } else {
        console.error("Unknown error saving post:", error);
      }
      setError("Error saving post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="loading">Loading post data...</div>;
  }

  return (
    <div className="post-form-container">
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
          <label htmlFor="topic">
            Topic (Optional - helps AI generate better content)
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter main topic for AI content"
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
          <button
            type="button"
            className="generate-button"
            onClick={generateContent}
            disabled={isGenerating || !title.trim()}
          >
            {isGenerating ? "Generating..." : "Generate Content with AI"}
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="image">Add a photo</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          <label htmlFor="image" className="file-upload-label">
            Choose Photo
          </label>
          {imageFile && (
            <div className="file-name-display">{imageFile.name}</div>
          )}

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                className="remove-image-button"
                onClick={handleRemoveImage}
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() =>
              onFormComplete
                ? onFormComplete()
                : navigate(isEditing ? "/my-posts" : "/")
            }
            className="cancel-button"
          >
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
