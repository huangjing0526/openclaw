const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'overtime_resolve',
  description: '手动解除指定超时预警记录',

  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: '预警记录 ID',
        minLength: 1
      }
    },
    required: ['id']
  },

  async execute(params, context) {
    const { id } = params;
    const { tenantId, userId } = context;

    if (!tenantId || !userId) {
      throw new Error('Missing tenantId or userId in context');
    }

    const client = createCRMClient({ tenantId, userId });

    try {
      const response = await client.post(`/api/mcp/alerts/overtime/${id}/resolve`);

      const data = response.data.data;

      return {
        success: true,
        alert: data || null,
        message: `超时预警 ${id} 已成功解除`
      };
    } catch (error) {
      console.error('[overtime_resolve] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.respDesc || error.message || '解除超时预警失败'
      };
    }
  }
};
