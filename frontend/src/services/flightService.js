import api from './api';

/**
 * Flight API Client Service
 * Interacts with standardized RESTful Flight endpoints under /api/v1/flights/
 */
export const flightService = {
  /**
   * 1. Search live flights
   * POST /api/v1/flights/search/
   */
  async searchFlights(searchParams) {
    const response = await api.post('/flights/search/', searchParams);
    return response.data?.data || response.data;
  },

  /**
   * 2. Get latest offer details
   * GET /api/v1/flights/offers/{offer_id}/
   */
  async getOffer(offerId) {
    const response = await api.get(`/flights/offers/${offerId}/`);
    return response.data?.data || response.data;
  },

  /**
   * STEP 25: Authoritative Travelport AirPrice re-pricing
   * POST /api/v1/flights/price/
   */
  async priceOffer(pricePayload) {
    const response = await api.post('/flights/price/', pricePayload);
    return response.data?.data || response.data;
  },

  /**
   * STEP 26: Validate passenger details & travel documents
   * POST /api/v1/flights/passengers/validate/
   */
  async validatePassengers(passengerPayload) {
    const response = await api.post('/flights/passengers/validate/', passengerPayload);
    return response.data?.data || response.data;
  },

  /**
   * 3. Confirm current price & lock inventory (15-min TTL)
   * POST /api/v1/flights/offers/{offer_id}/price/
   */
  async confirmOfferPrice(offerId, priceData = null) {
    const response = await api.post(`/flights/offers/${offerId}/price/`, { price_data: priceData });
    return response.data?.data || response.data;
  },


  /**
   * 4. Create flight reservation & generate PNR
   * POST /api/v1/flights/book/
   */
  async createBooking(bookingData) {
    const response = await api.post('/flights/book/', bookingData);
    return response.data?.data || response.data;
  },

  /**
   * 5. Issue official e-ticket
   * POST /api/v1/flights/ticket/
   */
  async issueTicket(ticketPayload) {
    const response = await api.post('/flights/ticket/', ticketPayload);
    return response.data?.data || response.data;
  },

  /**
   * 6. List bookings for customer
   * GET /api/v1/flights/bookings/
   */
  async getBookings() {
    const response = await api.get('/flights/bookings/');
    return response.data?.data || response.data;
  },

  /**
   * 7. Get booking itinerary by ID
   * GET /api/v1/flights/bookings/{id}/
   */
  async getBooking(id) {
    const response = await api.get(`/flights/bookings/${id}/`);
    return response.data?.data || response.data;
  },

  /**
   * STEP 30: Get booking itinerary & status by PNR
   * GET /api/v1/flights/pnr/{pnr}/
   */
  async getBookingByPnr(pnr) {
    const response = await api.get(`/flights/pnr/${pnr}/`);
    return response.data?.data || response.data;
  },

  /**
   * 7. Cancel booking
   * POST /api/v1/flights/bookings/{id}/cancel/
   */
  async cancelBooking(id) {
    const response = await api.post(`/flights/bookings/${id}/cancel/`);
    return response.data?.data || response.data;
  },

  /**
   * 8. Check Flight Provider Authentication & Health
   * GET /api/v1/flights/provider-status/
   */
  async getProviderStatus() {
    const response = await api.get('/flights/provider-status/');
    return response.data?.data || response.data;
  },
};

export default flightService;

