import api from './api';

/**
 * Hotel Service
 * Endpoints:
 * - Hotels: /api/v1/hotels/
 * - Hotel Bookings: /api/v1/hotel-bookings/
 */
export const hotelService = {
  /**
   * Browse available hotels (Public)
   * GET /api/v1/hotels/
   */
  async getHotels(params = {}) {
    const response = await api.get('/hotels/', { params });
    const resData = response.data?.data || response.data;
    if (resData && Array.isArray(resData.results)) {
      return resData.results;
    }
    return Array.isArray(resData) ? resData : (resData?.results || []);
  },

  /**
   * Get single hotel details
   * GET /api/v1/hotels/:id/
   */
  async getHotel(id) {
    const response = await api.get(`/hotels/${id}/`);
    return response.data?.data || response.data;
  },

  /**
   * Create new hotel (Admin only)
   * POST /api/v1/hotels/
   */
  async createHotel(hotelData) {
    const response = await api.post('/hotels/', hotelData);
    return response.data?.data || response.data;
  },

  /**
   * Update hotel (Admin only)
   * PATCH /api/v1/hotels/:id/
   */
  async updateHotel(id, hotelData) {
    const response = await api.patch(`/hotels/${id}/`, hotelData);
    return response.data?.data || response.data;
  },

  /**
   * List hotel bookings (scoped by role)
   * GET /api/v1/hotel-bookings/
   */
  async getBookings(params = {}) {
    const response = await api.get('/hotel-bookings/', { params });
    const resData = response.data?.data || response.data;
    if (resData && Array.isArray(resData.results)) {
      return resData.results;
    }
    return Array.isArray(resData) ? resData : (resData?.results || []);
  },

  /**
   * Create hotel booking
   * POST /api/v1/hotel-bookings/
   */
  async createBooking(bookingData) {
    const payload = {
      hotel_id: bookingData.hotel_id || bookingData.hotelId || bookingData.hotel,
      check_in: bookingData.check_in || bookingData.checkIn,
      check_out: bookingData.check_out || bookingData.checkOut,
      guests: parseInt(bookingData.guests || bookingData.guestsCount, 10) || 1,
      rooms: parseInt(bookingData.rooms || bookingData.roomsCount, 10) || 1,
      special_requests: bookingData.special_requests || bookingData.specialRequests || '',
      total_amount: bookingData.total_amount || bookingData.totalAmount || null,
    };

    const response = await api.post('/hotel-bookings/', payload);
    return response.data?.data || response.data;
  },

  /**
   * Get single booking details
   * GET /api/v1/hotel-bookings/:id/
   */
  async getBooking(id) {
    const response = await api.get(`/hotel-bookings/${id}/`);
    return response.data?.data || response.data;
  },

  /**
   * Update hotel booking status
   * PATCH /api/v1/hotel-bookings/:id/
   */
  async updateBooking(id, updateData) {
    const response = await api.patch(`/hotel-bookings/${id}/`, updateData);
    return response.data?.data || response.data;
  },
};

export default hotelService;
