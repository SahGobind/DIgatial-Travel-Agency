import api from './api';

/**
 * Ticket Service
 * Endpoints: /api/v1/tickets/
 */
export const ticketService = {
  /**
   * List ticket requests (scoped by user role)
   * GET /api/v1/tickets/
   */
  async getTickets(params = {}) {
    const response = await api.get('/tickets/', { params });
    // DRF may return array in data or paginated results
    const resData = response.data?.data || response.data;
    if (resData && Array.isArray(resData.results)) {
      return resData.results;
    }
    return Array.isArray(resData) ? resData : (resData?.results || []);
  },

  /**
   * Submit a new flight ticket request
   * POST /api/v1/tickets/
   */
  async createTicket(ticketData) {
    // Map frontend fields to backend serializer fields
    const payload = {
      trip_type: ticketData.tripType === 'roundTrip' || ticketData.trip_type === 'ROUND_TRIP' ? 'ROUND_TRIP' : 'ONE_WAY',
      from_location: ticketData.from || ticketData.from_location,
      to_location: ticketData.to || ticketData.to_location,
      departure_date: ticketData.departureDate || ticketData.departure_date,
      return_date: ticketData.tripType === 'roundTrip' ? (ticketData.returnDate || ticketData.return_date || null) : null,
      adults: parseInt(ticketData.adults, 10) || 1,
      children: parseInt(ticketData.children, 10) || 0,
      travel_class: (ticketData.travelClass || ticketData.travel_class || 'Economy').toUpperCase().replace(/\s+/g, '_'),
      special_request: ticketData.specialRequest || ticketData.special_request || '',
    };

    const response = await api.post('/tickets/', payload);
    return response.data?.data || response.data;
  },

  /**
   * Get single ticket request detail
   * GET /api/v1/tickets/:id/
   */
  async getTicket(id) {
    const response = await api.get(`/tickets/${id}/`);
    return response.data?.data || response.data;
  },

  /**
   * Update ticket request (Admin: status/notes/quote, Customer: details/cancel)
   * PATCH /api/v1/tickets/:id/
   */
  async updateTicket(id, updateData) {
    const response = await api.patch(`/tickets/${id}/`, updateData);
    return response.data?.data || response.data;
  },

  /**
   * Delete a ticket request
   * DELETE /api/v1/tickets/:id/
   */
  async deleteTicket(id) {
    const response = await api.delete(`/tickets/${id}/`);
    return response.data?.data || response.data;
  },

  /**
   * Estimate flight fare
   * POST /api/v1/tickets/estimate/
   */
  async estimateFare(estimateParams) {
    const response = await api.post('/tickets/estimate/', estimateParams);
    return response.data?.data || response.data;
  },

  /**
   * Search live flights via Flight API Provider
   * POST /api/v1/tickets/search/
   */
  async searchFlights(searchParams) {
    const response = await api.post('/tickets/search/', searchParams);
    return response.data?.data || response.data;
  },

  /**
   * Re-price / Confirm flight offer
   * POST /api/v1/tickets/reprice/
   */
  async repriceOffer(offerId, priceData = null) {
    const response = await api.post('/tickets/reprice/', { offer_id: offerId, price_data: priceData });
    return response.data?.data || response.data;
  },

  /**
   * Book confirmed flight offer & issue PNR / E-Tickets
   * POST /api/v1/tickets/book/
   */
  async bookFlight(bookingData) {
    const response = await api.post('/tickets/book/', bookingData);
    return response.data?.data || response.data;
  },
};

export default ticketService;

