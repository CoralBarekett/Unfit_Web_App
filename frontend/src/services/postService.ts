import axios from "axios";

axios.defaults.baseURL = "http://localhost:3001";
axios.defaults.withCredentials = true;

const API_URL = "/api/posts";

export interface Post {
  _id: string;
  title: string;
  content: string;
  image?: string;
  imageUrl?: string;
  owner: string;
  likes: string[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  imageUrl?: string;
}

class PostService {
  async getAllPosts(
    page = 1,
    limit = 10
  ): Promise<{
    posts: Post[];
    totalPages: number;
    currentPage: number;
    totalPosts: number;
  }> {
    const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getPostById(id: string): Promise<Post> {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  }

  async getMyPosts(): Promise<Post[]> {
    const response = await axios.get(`${API_URL}/my-posts`);
    return response.data;
  }

  async createPost(postData: CreatePostData): Promise<Post> {
    const response = await axios.post(API_URL, postData);
    return response.data;
  }

  async updatePost(id: string, postData: CreatePostData): Promise<Post> {
    const response = await axios.put(`${API_URL}/${id}`, postData);
    return response.data;
  }

  async deletePost(id: string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  }

  async toggleLike(id: string): Promise<Post> {
    const response = await axios.post(`${API_URL}/${id}/like`);
    return response.data;
  }

  async generatePostContent(title: string, topic: string = "") {
    try {
      const response = await axios.post(`/api/ai/generate-content`, { 
        title,
        topic,
      });
      return response.data.content;
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    }
  }
}

export default new PostService();
