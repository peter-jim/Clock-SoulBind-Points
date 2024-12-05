const axios = require('axios');

class APIClient {
  constructor(baseURL = 'https://api.csbp.example.com') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Get clock value for specific event type
  async getClockValue(eventType, address) {
    try {
      const response = await this.client.get(`/api/clock/${eventType}/${address}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get clock value:', error);
      throw error;
    }
  }

  // Get global clock value
  async getGlobalClockValue(address) {
    try {
      const response = await this.client.get(`/api/clock/global/${address}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get global clock value:', error);
      throw error;
    }
  }

  // Get direct invites count
  async getDirectInvites(address, projectId) {
    try {
      const response = await this.client.get(`/api/invite/direct/${address}`, {
        params: { projectId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get direct invites:', error);
      throw error;
    }
  }

  // Get indirect invites count
  async getIndirectInvites(address, projectId) {
    try {
      const response = await this.client.get(`/api/invite/indirect/${address}`, {
        params: { projectId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get indirect invites:', error);
      throw error;
    }
  }

  // Get total invites count
  async getTotalInvites(address, projectId) {
    try {
      const response = await this.client.get(`/api/invite/total/${address}`, {
        params: { projectId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get total invites:', error);
      throw error;
    }
  }

  // Get incentives information
  async getIncentives(address, projectId) {
    try {
      const response = await this.client.post(`/api/incentives/${address}`, null, {
        params: { projectId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get incentives:', error);
      throw error;
    }
  }

  // Get invitation tree for visualization
  async getInviteTree(address, projectId) {
    try {
      const response = await this.client.get(`/api/invite/tree/${address}`, {
        params: { projectId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get invite tree:', error);
      throw error;
    }
  }

  // Get invitation path between two addresses
  async getInvitePath(fromAddress, toAddress, projectId) {
    try {
      const response = await this.client.get(`/api/invite/path/${fromAddress}/${toAddress}`, {
        params: { projectId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get invite path:', error);
      throw error;
    }
  }
}

module.exports = { APIClient }; 