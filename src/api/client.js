const axios = require('axios');

class CausalityClient {
  constructor(config = {}) {
    this.client = axios.create({
      baseURL: config.baseURL || 'http://18.136.124.172:3200',
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });
  }

  // Get direct invites with pagination
  async getDirectInvites(address, project, page = 1, pageSize = 10) {
    try {
      const response = await this.client.get(`/api/invite/direct/${address}`, {
        params: { 
          project,
          page,
          page_size: pageSize
        }
      });
      return response.data.result;
    } catch (error) {
      console.error('Failed to get direct invites:', error);
      throw error;
    }
  }

  // Get total invites
  async getTotalInvites(address, project) {
    try {
      const response = await this.client.get(`/api/invite/total/${address}`, {
        params: { project }
      });
      // 直接返回数字结果
      return response.data.result;
    } catch (error) {
      console.error('Failed to get total invites:', error);
      throw error;
    }
  }

  // Get incentives count
  async getIncentives(address, projectId) {
    try {
      const response = await this.client.get(`/api/incentives/${address}`, {
        params: { projectId }
      });
      return response.data.result;
    } catch (error) {
      console.error('Failed to get incentives:', error);
      throw error;
    }
  }

  // Helper method to calculate indirect invites
  async getIndirectInvites(address, project, page = 1, pageSize = 10) {
    try {
      const [totalInvites, directInvites] = await Promise.all([
        this.getTotalInvites(address, project),
        this.getDirectInvites(address, project, page, pageSize)
      ]);

      // Calculate indirect invites
      const directCount = directInvites.items[0]?.count || 0;
      const indirectCount = totalInvites - directCount;

      return {
        items: [{
          id: directInvites.items[0]?.id,
          from: address,
          count: indirectCount,
          project: project,
          info: {},
          created_at: new Date().toISOString()
        }],
        total_items: 1,
        page,
        page_size: pageSize,
        num_pages: 1
      };
    } catch (error) {
      console.error('Failed to calculate indirect invites:', error);
      throw error;
    }
  }
}

module.exports = { CausalityClient };