import axios from 'axios';

const API_URL = '/file';

interface UploadResponse {
  success: boolean;
  url: string;
  filename: string;
  size: number;
}

class FileService {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post<UploadResponse>(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.url;
  }
}

export default new FileService();