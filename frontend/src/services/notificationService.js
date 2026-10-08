import api from './api';

/**
 * Notification Service
 * Endpoints: /api/v1/notifications/
 */
export const notificationService = {
  /**
   * List notifications
   * GET /api/v1/notifications/
   */
  async getNotifications() {
    const response = await api.get('/notifications/');
    const resData = response.data?.data || response.data;
    if (resData && Array.isArray(resData.results)) {
      return resData.results;
    }
    return Array.isArray(resData) ? resData : (resData?.results || []);
  },

  /**
   * Mark notification as read
   * POST /api/v1/notifications/:id/read/
   */
  async markAsRead(id) {
    const response = await api.post(`/notifications/${id}/read/`);
    return response.data?.data || response.data;
  },
};

export default notificationService;
