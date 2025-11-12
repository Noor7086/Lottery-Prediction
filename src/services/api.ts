import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          
          switch (status) {
            case 401:
              // Unauthorized - clear token and redirect to login
              localStorage.removeItem('token');
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
              break;
            case 403:
              toast.error('Access denied. You do not have permission to perform this action.');
              break;
            case 400:
              // Bad request - don't show toast for validation errors (let components handle them)
              // Only show toast for non-validation 400 errors
              if (!data.errors && data.message) {
                toast.error(data.message);
              }
              // If data.errors exists, it's a validation error - let the component handle it
              break;
            case 404:
              // Don't show toast for 404 errors - let components handle them
              // Components can show appropriate messages or handle silently
              break;
            case 422:
              // Validation errors - don't show toast (let components handle them)
              // Components will display field-level validation errors
              break;
            case 429:
              toast.error('Too many requests. Please try again later.');
              break;
            case 500:
              toast.error('Server error. Please try again later.');
              break;
            default:
              toast.error(data.message || 'An error occurred');
          }
        } else if (error.request) {
          toast.error('Network error. Please check your connection.');
        } else {
          toast.error('An unexpected error occurred');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Generic methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete(url);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.patch(url, data);
    return response.data;
  }

  // File upload method
  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health');
  }

  // Contact form submission
  async sendContactMessage(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    return this.post('/contact', data);
  }
}

export const apiService = new ApiService();

