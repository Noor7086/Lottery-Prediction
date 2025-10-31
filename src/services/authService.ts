import { apiService } from './api';
import { User, LoginForm, RegisterForm, ProfileUpdateForm, PasswordChangeForm, ApiResponse } from '../types';

interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(credentials: LoginForm): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed');
    }
    return response.data;
  }

  async register(userData: RegisterForm): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Registration failed');
    }
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<ApiResponse<{ user: User }>>('/auth/me');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get user data');
    }
    return response.data.user;
  }

  async updateProfile(data: ProfileUpdateForm): Promise<User> {
    const response = await apiService.put<ApiResponse<{ user: User }>>('/auth/profile', data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Profile update failed');
    }
    return response.data.user;
  }

  async changePassword(data: PasswordChangeForm): Promise<void> {
    try {
      const response = await apiService.put<ApiResponse>('/auth/change-password', data);
      if (!response.success) {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error: any) {
      console.error('AuthService changePassword error:', error);
      console.error('AuthService error response:', error.response);
      console.error('AuthService error data:', error.response?.data);
      
      // Handle axios error response
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Handle validation errors (422 status)
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map((err: any) => err.message || err.msg).join(', ');
          throw new Error(errorMessages);
        }
        
        // Handle other errors
        const errorMessage = errorData.message || 'Password change failed';
        throw new Error(errorMessage);
      }
      
      // Handle other errors
      throw new Error(error.message || 'Password change failed');
    }
  }

  async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem('token');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  async updateUserWalletBalance(_userId: string, newBalance: number): Promise<User> {
    // Use the existing profile update endpoint to update wallet balance
    const response = await apiService.put<ApiResponse<{ user: User }>>('/auth/profile', {
      walletBalance: newBalance
    });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update wallet balance');
    }
    return response.data.user;
  }
}

export const authService = new AuthService();

