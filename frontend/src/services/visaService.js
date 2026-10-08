import api from './api';

/**
 * Visa Service
 * Endpoints: /api/v1/visas/
 */
export const visaService = {
  /**
   * List visa applications (scoped by user role)
   * GET /api/v1/visas/
   */
  async getVisas(params = {}) {
    const response = await api.get('/visas/', { params });
    const resData = response.data?.data || response.data;
    if (resData && Array.isArray(resData.results)) {
      return resData.results;
    }
    return Array.isArray(resData) ? resData : (resData?.results || []);
  },

  /**
   * Submit a new visa application
   * POST /api/v1/visas/
   */
  async createVisa(visaData) {
    // Clean and normalize visa type (e.g. "Tourist Visa" -> "TOURIST")
    let normalizedVisaType = 'TOURIST';
    const rawType = (visaData.visaType || visaData.visa_type || '').toUpperCase();
    if (rawType.includes('WORK')) normalizedVisaType = 'WORK';
    else if (rawType.includes('BUSINESS')) normalizedVisaType = 'BUSINESS';
    else if (rawType.includes('STUDENT')) normalizedVisaType = 'STUDENT';
    else normalizedVisaType = 'TOURIST';

    const payload = {
      country: visaData.country,
      visa_type: normalizedVisaType,
      full_name: visaData.fullName || visaData.full_name,
      phone: visaData.phone,
      email: visaData.email,
      passport_number: (visaData.passportNumber || visaData.passport_number || '').trim().toUpperCase(),
      travel_date: visaData.travelDate || visaData.travel_date,
      nationality: visaData.nationality || 'Nepalese',
    };

    const response = await api.post('/visas/', payload);
    return response.data?.data || response.data;
  },

  /**
   * Get single visa application detail
   * GET /api/v1/visas/:id/
   */
  async getVisa(id) {
    const response = await api.get(`/visas/${id}/`);
    return response.data?.data || response.data;
  },

  /**
   * Update visa application (Admin: status/fee/notes, Customer: update info)
   * PATCH /api/v1/visas/:id/
   */
  async updateVisa(id, updateData) {
    const response = await api.patch(`/visas/${id}/`, updateData);
    return response.data?.data || response.data;
  },

  /**
   * Upload document to a visa application
   * POST /api/v1/visas/:id/documents/
   */
  async uploadDocument(visaId, file, documentType = 'PASSPORT') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const response = await api.post(`/visas/${visaId}/documents/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  /**
   * Get visa requirements for a country
   * GET /api/v1/visas/requirements/
   */
  async getRequirements(country, category = 'tourist') {
    const response = await api.get('/visas/requirements/', {
      params: { country, category },
    });
    return response.data?.data || response.data;
  },
};

export default visaService;
