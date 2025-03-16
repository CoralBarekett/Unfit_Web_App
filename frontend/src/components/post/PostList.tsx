/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostItem from './PostItem';
import postService, { Post } from '../../services/postService';
import Pagination from './Pagination';
import PostModal from './PostModal';
import '../../styles/PostList.css';

interface PostListProps {
  currentUserId: string;
  filterMyPosts?: boolean;
}

const PostList: React.FC<PostListProps> = ({ currentUserId, filterMyPosts = false }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [currentPage, filterMyPosts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      if (filterMyPosts) {
        const myPosts = await postService.getMyPosts();
        setPosts(myPosts);
        setTotalPages(1); // No pagination for my posts
      } else {
        const response = await postService.getAllPosts(currentPage);
        setPosts(response.posts);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(id);
        setPosts(posts.filter(post => post._id !== id));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleLikePost = async (id: string) => {
    try {
      const updatedPost = await postService.toggleLike(id);
      setPosts(posts.map(post => post._id === id ? updatedPost : post));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Refresh posts after modal closes to show any newly created posts
    fetchPosts();
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  return (
    <div className="post-list">
      <div className="post-list-header">
        <h2>{filterMyPosts ? 'My Posts' : 'All Posts'}</h2>
        <button 
          className="new-post-button" 
          onClick={() => setIsModalOpen(true)}
        >
          Create New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="no-posts">No posts found.</p>
      ) : (
        <>
          {posts.map(post => (
            <PostItem
              key={post._id}
              post={post}
              currentUserId={currentUserId}
              onDelete={handleDeletePost}
              onLike={handleLikePost}
              // Only show comment form on dashboard (my posts)
              showCommentForm={filterMyPosts}
            />
          ))}
          
          {!filterMyPosts && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Use your existing PostModal component */}
      <PostModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default PostList;