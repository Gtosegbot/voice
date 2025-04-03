/**
 * API Service for communicating with the backend
 */
class ApiService {
  constructor(app) {
    this.app = app;
    this.baseUrl = '/api';
  }
  
  /**
   * Make HTTP request to the API
   */
  async request(method, url, data = null, options = {}) {
    const token = this.app.store.getState().token;
    
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    if (token) {
      fetchOptions.headers.Authorization = `Bearer ${token}`;
    }
    
    if (data && method !== 'GET') {
      fetchOptions.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(`${this.baseUrl}${url}`, fetchOptions);
      
      // Check if response is JSON
      const contentType = response.headers.get('Content-Type');
      
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await response.json();
        
        if (!response.ok) {
          throw {
            status: response.status,
            message: jsonResponse.message || 'An error occurred',
            data: jsonResponse
          };
        }
        
        return jsonResponse;
      } else if (options.responseType === 'blob') {
        return await response.blob();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error(`API Error (${method} ${url}):`, error);
      
      // Dispatch error
      this.app.store.dispatch({
        type: 'SET_ERROR',
        payload: {
          message: error.message || 'An error occurred',
          status: error.status || 500
        }
      });
      
      throw error;
    }
  }
  
  /**
   * Perform GET request
   */
  async get(url, options = {}) {
    return this.request('GET', url, null, options);
  }
  
  /**
   * Perform POST request
   */
  async post(url, data, options = {}) {
    return this.request('POST', url, data, options);
  }
  
  /**
   * Perform PUT request
   */
  async put(url, data, options = {}) {
    return this.request('PUT', url, data, options);
  }
  
  /**
   * Perform DELETE request
   */
  async delete(url, options = {}) {
    return this.request('DELETE', url, null, options);
  }
}
