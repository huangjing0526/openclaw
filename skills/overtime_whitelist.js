const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'overtime_whitelist',
  description: '将指定超时预警加入白名单，暂停通知一段时间',

  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: '预警记录 ID',
        minLength: 1
      },
      durationDays: {
        type: 'integer',
        minimum: 1,
        maximum: 90,
        description: '暂停通知天数（1-90天）'
      }
    },
    required: ['id', 'durationDays']
  },

  async execute(params, context) {
    const { id, durationDays } = params;
    const { tenantId, userId } = context;

    if (!tenantId || !userId) {
      throw new Error('Missing tenantId or userId in context');
    }

    const client = createCRMClient({ tenantId, userId });

    try {
      const response = await client.post(`/api/mcp/alerts/overtime/${id}/whitelist`, {
        durationDays
      });

      const data = response.data.data;

      const expiresAt = data?.expiresAt || data?.expires_at;
      const expiresStr = expiresAt ? `，白名单到期时间：${expiresAt}` : '';

      return {
        success: true,
        alert: data || null,
        expiresAt: expiresAt || null,
        message: `超时预警 ${id} 已加入白名单，暂停通知 ${durationDays} 天${expiresStr}`
      };
    } catch (error) {
      console.error('[overtime_whitelist] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.respDesc || error.message || '加入白名单失败'
      };
    }
  }
};
