import api from './api';

/**
 * Customer Profile Management Service
 * Endpoints: /api/v1/customers/
 */
export const customerService = {
  /**
   * List customers (Admin only)
   * GET /api/v1/customers/
   */
  async getCustomers(params = {}) {
    const response = await api.get('/customers/', { params });
    const resData = response.data?.data || response.data;
    if (resData && Array.isArray(resData.results)) {
      return resData.results;
    }
    return Array.isArray(resData) ? resData : (resData?.results || []);
  },

  /**
   * Get customer profile by ID
   * GET /api/v1/customers/:id/
   */
  async getCustomer(id) {
    const response = await api.get(`/customers/${id}/`);
    return response.data?.data || response.data;
  },

  /**
   * Create customer profile
   * POST /api/v1/customers/
   */
  async createCustomer(customerData) {
    const response = await api.post('/customers/', customerData);
    return response.data?.data || response.data;
  },
};

export default customerService;
