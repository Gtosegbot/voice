/**
 * API Service
 * Handles all HTTP requests to the backend API
 */
class ApiService {
  constructor() {
    this.baseUrl = 'http://localhost:8000'; // Backend API URL
    this.authToken = null;
  }
  
  /**
   * Set the authentication token for requests
   */
  setAuthToken(token) {
    this.authToken = token;
  }
  
  /**
   * Clear the authentication token
   */
  clearAuthToken() {
    this.authToken = null;
  }
  
  /**
   * Get common headers for all requests
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }
  
  /**
   * Make a GET request
   */
  async get(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        ...options
      });
      
      // Handle binary responses (like file downloads)
      if (options.responseType === 'blob') {
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        return response.blob();
      }
      
      // For regular JSON responses
      const data = await response.json();
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Unknown error',
          response: data
        };
      }
      
      return data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Make a POST request
   */
  async post(endpoint, body = {}, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
        ...options
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Unknown error',
          response: data
        };
      }
      
      return data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Make a PUT request
   */
  async put(endpoint, body = {}, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
        ...options
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Unknown error',
          response: data
        };
      }
      
      return data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Make a DELETE request
   */
  async delete(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
        ...options
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Unknown error',
          response: data
        };
      }
      
      return data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Upload a file
   */
  async uploadFile(endpoint, file, additionalData = {}, onProgress = null) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const formData = new FormData();
      
      // Add the file
      formData.append('file', file);
      
      // Add any additional data
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
      
      // Create request options
      const options = {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      };
      
      // Add auth token if available
      if (this.authToken) {
        options.headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      // Handle progress if needed
      if (typeof onProgress === 'function') {
        const xhr = new XMLHttpRequest();
        
        return new Promise((resolve, reject) => {
          xhr.open('POST', url);
          
          // Add headers
          if (this.authToken) {
            xhr.setRequestHeader('Authorization', `Bearer ${this.authToken}`);
          }
          
          xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.response));
            } else {
              reject({
                status: xhr.status,
                message: 'Upload failed',
                response: xhr.response
              });
            }
          };
          
          xhr.onerror = function() {
            reject({
              status: xhr.status,
              message: 'Upload failed',
              response: xhr.response
            });
          };
          
          xhr.upload.onprogress = function(event) {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              onProgress(percentComplete);
            }
          };
          
          xhr.send(formData);
        });
      }
      
      // Regular fetch if no progress needed
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Unknown error',
          response: data
        };
      }
      
      return data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Handle API errors
   */
  handleError(error) {
    console.error('API Error:', error);
    
    // Handle authentication errors
    if (error.status === 401) {
      // Clear token and trigger logout
      this.clearAuthToken();
      
      // Dispatch logout event
      const logoutEvent = new CustomEvent('auth:logout', {
        detail: { reason: 'token_expired' }
      });
      
      document.dispatchEvent(logoutEvent);
    }
  }
}
