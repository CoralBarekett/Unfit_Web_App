import api from './apiService';

const uploadImage = async (file: File): Promise<string> => {
  // Create form data
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    // Make sure this endpoint matches your backend route for file uploads
    const response = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

const fileService = {
  uploadImage,
};

export default fileService;