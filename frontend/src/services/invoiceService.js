import api from './api';

/**
 * Invoice Service
 * Endpoints: /api/v1/invoices/
 */
export const invoiceService = {
  /**
   * List invoices
   * GET /api/v1/invoices/
   */
  async getInvoices(params = {}) {
    const response = await api.get('/invoices/', { params });
    const resData = response.data?.data || response.data;
    if (resData && Array.isArray(resData.results)) {
      return resData.results;
    }
    return Array.isArray(resData) ? resData : (resData?.results || []);
  },

  /**
   * Get single invoice
   * GET /api/v1/invoices/:id/
   */
  async getInvoice(id) {
    const response = await api.get(`/invoices/${id}/`);
    return response.data?.data || response.data;
  },
};

export default invoiceService;
