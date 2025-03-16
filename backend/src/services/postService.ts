/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './apiService';

export interface CreatePostData {
  title: string;
  content: string;
  imageUrl?: string;
}

const createPost = async (postData: CreatePostData): Promise<any> => {
  const response = await api.post('/posts', postData);
  return response.data;
};

const getPostById = async (postId: string): Promise<any> => {
  const response = await api.get(`/posts/${postId}`);
  return response.data;
};

const updatePost = async (postId: string, postData: CreatePostData): Promise<any> => {
  const response = await api.put(`/posts/${postId}`, postData);
  return response.data;
};

const getAllPosts = async (page = 1, limit = 10): Promise<any> => {
  const response = await api.get(`/posts?page=${page}&limit=${limit}`);
  return response.data;
};

const getMyPosts = async (): Promise<any> => {
  const response = await api.get('/posts/my-posts');
  return response.data;
};

const toggleLike = async (postId: string): Promise<any> => {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
};

const postService = {
  createPost,
  getPostById,
  updatePost,
  getAllPosts,
  getMyPosts,
  toggleLike
};

export default postService;