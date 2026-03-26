/**
 * API Service for Lung Cancer Detection Backend
 * Handles communication with the FastAPI backend
 */

const API_BASE_URL = 'http://localhost:8000';

export interface PredictionResponse {
    label: string;
    status: string;
}

/**
 * Upload an image to the backend for lung cancer prediction
 * @param file - The image file to analyze
 * @returns Promise with prediction result containing label and status
 */
export async function predictLungCancer(file: File): Promise<PredictionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data: PredictionResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error predicting lung cancer:', error);
        throw error;
    }
}

/**
 * Check if the backend API is healthy
 * @returns Promise with health status
 */
export async function checkHealth(): Promise<{ status: string; model_loaded: boolean; model_path: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error checking health:', error);
        throw error;
    }
}
