import { MerchantData, ApiResponse, AuthCredentials } from '../types';

interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

const defaultRetryConfig: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Delays execution for the specified time
 */
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Determines if an error is retryable
 */
const isRetryableError = (status?: number): boolean => {
  if (!status) return true; // Network errors are retryable
  return status >= 500 || status === 408 || status === 429;
};

/**
 * Generic fetch with exponential backoff retry logic
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  config: RetryConfig = {}
): Promise<T> {
  const { maxRetries, initialDelay, maxDelay, backoffMultiplier } = {
    ...defaultRetryConfig,
    ...config,
  };

  let lastError: Error | null = null;
  let currentDelay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      // If response is not ok and it's retryable, throw to trigger retry
      if (!response.ok && isRetryableError(response.status) && attempt < maxRetries) {
        throw new Error(`HTTP ${response.status}: ${data.message || 'Request failed'}`);
      }

      return data as T;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if error is retryable
      const errorStatus = (error as Error & { status?: number }).status;
      if (!isRetryableError(errorStatus)) {
        break;
      }

      // Wait before retrying with exponential backoff
      await delay(Math.min(currentDelay, maxDelay));
      currentDelay *= backoffMultiplier;
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${currentDelay}ms`);
    }
  }

  // All retries exhausted
  throw lastError || new Error('Request failed after multiple retries');
}

/**
 * Updates a single merchant with retry logic
 */
export const updateMerchant = async (
  merchantId: string,
  data: MerchantData,
  credentials: AuthCredentials,
  retryConfig?: RetryConfig
): Promise<ApiResponse> => {
  try {
    const response = await fetchWithRetry<ApiResponse>(
      `/api/merchant/${merchantId}/kyc`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          username: credentials.username,
          password: credentials.password,
        }),
      },
      retryConfig
    );

    return response;
  } catch (error) {
    console.error('Error updating merchant:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      statusCode: 500,
    };
  }
};

/**
 * Updates multiple merchants via JSON payload with retry logic
 */
export const updateMultipleMerchants = async (
  updates: Array<{ merchantId: string; [key: string]: string }>,
  credentials: AuthCredentials,
  retryConfig?: RetryConfig
): Promise<ApiResponse> => {
  try {
    const response = await fetchWithRetry<ApiResponse>(
      '/api/merchant/bulk-kyc',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates,
          username: credentials.username,
          password: credentials.password,
        }),
      },
      retryConfig
    );

    return response;
  } catch (error) {
    console.error('Error updating multiple merchants:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      statusCode: 500,
    };
  }
};
