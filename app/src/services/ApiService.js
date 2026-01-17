/**
 * API Service - Handles all backend communication
 */

import axios from 'axios';
import * as FileSystem from 'expo-file-system';

// Configure API endpoint - adjust this to your Flask server
const API_BASE_URL = 'http://192.168.1.100:5001'; // Change to your machine IP

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const ApiService = {
  /**
   * Upload image to server
   */
  uploadImage: async (imageUri) => {
    try {
      const formData = new FormData();

      // Read file and create blob
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      const fileName = imageUri.split('/').pop();
      const mimeType = 'image/jpeg'; // Adjust based on image type

      const response = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      formData.append('file', {
        uri: imageUri,
        type: mimeType,
        name: fileName,
      });

      const uploadResponse = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return uploadResponse.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(error.response?.data?.error || 'Failed to upload image');
    }
  },

  /**
   * Validate description
   */
  validateDescription: async (description) => {
    try {
      const response = await api.post('/api/validate-description', {
        description,
      });
      return response.data;
    } catch (error) {
      console.error('Validation error:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to validate description'
      );
    }
  },

  /**
   * Preview content for all platforms
   */
  previewContent: async (description) => {
    try {
      const response = await api.post('/api/preview-content', {
        description,
      });
      return response.data;
    } catch (error) {
      console.error('Preview error:', error);
      throw new Error(error.response?.data?.error || 'Failed to generate preview');
    }
  },

  /**
   * Post content to selected platforms
   */
  postContent: async (sessionId, description, platforms) => {
    try {
      const response = await api.post('/api/post', {
        session_id: sessionId,
        description,
        platforms,
      });
      return response.data;
    } catch (error) {
      console.error('Post error:', error);
      throw new Error(error.response?.data?.error || 'Failed to post content');
    }
  },

  /**
   * Health check
   */
  healthCheck: async () => {
    try {
      const response = await api.get('/api/health');
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },

  /**
   * Set API base URL (for runtime configuration)
   */
  setBaseURL: (url) => {
    api.defaults.baseURL = url;
  },
};

export default ApiService;
