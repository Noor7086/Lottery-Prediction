import { apiService } from './api';
import { Prediction, Purchase, LotteryType, ApiResponse } from '../types';

class PredictionService {
  async getPredictions(lotteryType: LotteryType, page = 1, limit = 10): Promise<Prediction[]> {
    const response = await apiService.get<ApiResponse<{ predictions: Prediction[] }>>(
      `/predictions/${lotteryType}?page=${page}&limit=${limit}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch predictions');
    }
    return response.data.predictions;
  }

  async getPredictionDetails(lotteryType: LotteryType, id: string): Promise<Prediction> {
    const response = await apiService.get<ApiResponse<{ prediction: Prediction }>>(
      `/predictions/${lotteryType}/${id}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch prediction details');
    }
    return response.data.prediction;
  }

  async purchasePrediction(lotteryType: LotteryType, id: string, paymentMethod: string): Promise<void> {
    const response = await apiService.post<ApiResponse>(
      `/predictions/${lotteryType}/${id}/purchase`,
      { paymentMethod }
    );
    if (!response.success) {
      throw new Error(response.message || 'Purchase failed');
    }
  }

  async getMyPurchases(page = 1, limit = 10): Promise<Purchase[]> {
    const response = await apiService.get<ApiResponse<{ purchases: Purchase[] }>>(
      `/predictions/my-purchases?page=${page}&limit=${limit}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch purchases');
    }
    return response.data.purchases;
  }

  async getTrialPredictions(lotteryType: LotteryType): Promise<{ predictions: Prediction[]; message?: string }> {
    const response = await apiService.get<ApiResponse<{ predictions: Prediction[]; message?: string }>>(
      `/predictions/trial/${lotteryType}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch trial predictions');
    }
    return {
      predictions: response.data.predictions || [],
      message: response.data.message
    };
  }

  // Download prediction (increment download count)
  async downloadPrediction(lotteryType: LotteryType, id: string): Promise<Prediction> {
    // This would typically be a separate endpoint for tracking downloads
    // For now, we'll just fetch the details which increments the count
    return this.getPredictionDetails(lotteryType, id);
  }
}

export const predictionService = new PredictionService();

