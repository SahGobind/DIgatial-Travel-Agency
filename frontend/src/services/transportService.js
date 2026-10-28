import api from './api';

/**
 * Transport Service for Nepal Roadway Transportation
 * Endpoints:
 * - Search: /api/v1/transports/search/
 * - Routes: /api/v1/transports/routes/
 * - Types: /api/v1/transports/types/
 * - Schedules: /api/v1/transports/schedules/:id/
 * - Bookings: /api/v1/transports/bookings/
 */
export const transportService = {
  /**
   * Search roadway transport departures
   * GET /api/v1/transports/search/
   */
  async searchTransports(params = {}) {
    const response = await api.get('/transports/search/', { params });
    const resData = response.data?.data || response.data;
    if (resData && Array.isArray(resData.results)) {
      return resData.results;
    }
    return Array.isArray(resData) ? resData : (resData?.results || []);
  },

  /**
   * List all routes and distinct cities in Nepal
   * GET /api/v1/transports/routes/
   */
  async getRoutes() {
    const response = await api.get('/transports/routes/');
    return response.data?.data || response.data;
  },

  /**
   * List vehicle types
   * GET /api/v1/transports/types/
   */
  async getTypes() {
    const response = await api.get('/transports/types/');
    return response.data?.data || response.data;
  },

  /**
   * Get single schedule with real-time seat availability for a date
   * GET /api/v1/transports/schedules/:id/
   */
  async getSchedule(id, dateStr) {
    const params = dateStr ? { date: dateStr } : {};
    const response = await api.get(`/transports/schedules/${id}/`, { params });
    return response.data?.data || response.data;
  },

  /**
   * Create a new roadway transport booking
   * POST /api/v1/transports/bookings/
   */
  async createBooking(bookingData) {
    const response = await api.post('/transports/bookings/', bookingData);
    return response.data?.data || response.data;
  },

  /**
   * Get booking details by ID or reference code
   * GET /api/v1/transports/bookings/:identifier/
   */
  async getBooking(identifier) {
    const response = await api.get(`/transports/bookings/${identifier}/`);
    return response.data?.data || response.data;
  },

  /**
   * List customer's road transport bookings
   * GET /api/v1/transports/bookings/
   */
  async getMyBookings(params = {}) {
    const response = await api.get('/transports/bookings/', { params });
    const resData = response.data?.data || response.data;
    if (resData && Array.isArray(resData.results)) {
      return resData.results;
    }
    return Array.isArray(resData) ? resData : (resData?.results || []);
  },

  /**
   * Cancel booking
   * PATCH /api/v1/transports/bookings/:identifier/
   */
  async cancelBooking(identifier) {
    const response = await api.patch(`/transports/bookings/${identifier}/`, { action: 'cancel' });
    return response.data?.data || response.data;
  }
};

export default transportService;

