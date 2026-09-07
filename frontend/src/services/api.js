const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_BASE_URL = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`;

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('coopserve_token') || null;
    this.tokenListeners = [];
    this.refreshPromise = null;
    this.onAuthFailure = null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('coopserve_token', token);
    } else {
      localStorage.removeItem('coopserve_token');
    }
    this.tokenListeners.forEach(fn => {
      try { fn(token); } catch (err) { console.error(err); }
    });
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('coopserve_token');
    this.tokenListeners.forEach(fn => {
      try { fn(null); } catch (err) { console.error(err); }
    });
  }

  onTokenChange(callback) {
    this.tokenListeners.push(callback);
    return () => {
      this.tokenListeners = this.tokenListeners.filter(cb => cb !== callback);
    };
  }

  setOnAuthFailure(callback) {
    this.onAuthFailure = callback;
  }

  getHeaders() {
    const token = this.token || localStorage.getItem('coopserve_token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async refreshToken() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.token) {
          throw new Error(data.message || 'Session refresh failed');
        }

        this.setToken(data.token);
        return data;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async logout() {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
    } catch (err) {
      console.warn('Logout network notification failed:', err.message);
    } finally {
      this.clearToken();
    }
  }

  async request(endpoint, options = {}, isRetry = false) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      credentials: 'include',
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 with silent token refresh once (excluding login/register/refresh itself)
      if (
        response.status === 401 &&
        !isRetry &&
        endpoint !== '/auth/login' &&
        endpoint !== '/auth/refresh' &&
        endpoint !== '/auth/register'
      ) {
        try {
          const refreshed = await this.refreshToken();
          if (refreshed?.token) {
            return await this.request(endpoint, options, true);
          }
        } catch (refreshErr) {
          this.clearToken();
          if (this.onAuthFailure) {
            this.onAuthFailure();
          }
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || 'Session expired. Please log in again.');
        }
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth endpoints
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  demoLogin(role) {
    return this.request(`/auth/demo/${role}`, {
      method: 'POST',
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  getLocations() {
    return this.request('/locations');
  }

  getMe() {
    return this.request('/auth/me');
  }

  getDemoAccounts() {
    return this.request('/auth/demo-accounts');
  }

  checkHealth() {
    return this.request('/health');
  }

  // Services
  getCategories() {
    return this.request('/services/categories');
  }

  getServices(category) {
    const query = category && category !== 'all' ? `?category=${category}` : '';
    return this.request(`/services${query}`);
  }

  getServiceById(id) {
    return this.request(`/services/${id}`);
  }

  // Providers
  getProviders(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/providers${queryString}`);
  }

  smartMatch(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/providers/match${queryString}`);
  }

  getProviderById(id) {
    return this.request(`/providers/${id}`);
  }

  getProviderReviews(id) {
    return this.request(`/providers/${id}/reviews`);
  }

  // Bookings
  getBookings() {
    return this.request('/bookings');
  }

  createBooking(data) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  getBookingById(id) {
    return this.request(`/bookings/${id}`);
  }

  updateBookingStatus(id, status, note = '') {
    return this.request(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note })
    });
  }

  cancelBooking(id, reason) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  emergencyReassignBooking(id, providerId) {
    return this.request(`/bookings/${id}/emergency-reassign`, {
      method: 'POST',
      body: JSON.stringify({ providerId })
    });
  }

  // Provider Module APIs
  getProviderStats() {
    return this.request('/provider/stats');
  }

  getProviderEarnings() {
    return this.request('/provider/earnings');
  }

  getProviderAvailability() {
    return this.request('/provider/availability');
  }

  updateProviderAvailability(data) {
    return this.request('/provider/availability', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Customer Profile & Notifications
  getCustomerProfile() {
    return this.request('/customer/profile');
  }

  updateCustomerProfile(data) {
    return this.request('/customer/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  getNotifications() {
    return this.request('/customer/notifications');
  }

  markNotificationRead(id) {
    return this.request(`/customer/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }

  // Cooperative Ecosystem APIs
  getCooperativeOverview() {
    return this.request('/cooperative/overview');
  }

  // Admin APIs
  getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  getAdminProviders() {
    return this.request('/admin/providers');
  }

  updateAdminProviderStatus(id, data) {
    return this.request(`/admin/providers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  getAdminCustomers() {
    return this.request('/admin/customers');
  }

  getAdminMatching() {
    return this.request('/admin/matching');
  }

  getAdminLeakageRisk() {
    return this.request('/admin/leakage-risk');
  }

  getAdminAIInsights() {
    return this.request('/admin/ai-insights');
  }

  // Real-Time In-App Chat APIs
  getChatMessages(bookingId) {
    return this.request(`/chat/${bookingId}`);
  }

  sendChatMessage(bookingId, text) {
    return this.request(`/chat/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }

  // Payment APIs
  createRazorpayOrder(bookingId) {
    return this.request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ bookingId })
    });
  }

  getPaymentStatus(bookingId) {
    return this.request(`/payments/booking/${bookingId}/status`);
  }

  // Rating & Review APIs
  submitRating(bookingId, data) {
    return this.request(`/ratings/bookings/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  getRatingForBooking(bookingId) {
    return this.request(`/ratings/bookings/${bookingId}`);
  }

  verifyBookingLocation(id, data) {
    return this.request(`/bookings/${id}/verify-location`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const api = new ApiService();
