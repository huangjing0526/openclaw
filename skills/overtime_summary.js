const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'overtime_summary',
  description: '超时预警汇总，按规则类型分组展示各类预警数量',

  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  },

  async execute(params, context) {
    const { tenantId, userId } = context;

    if (!tenantId || !userId) {
      throw new Error('Missing tenantId or userId in context');
    }

    const client = createCRMClient({ tenantId, userId });

    try {
      const response = await client.get('/api/mcp/alerts/overtime/summary');

      const data = response.data.data;

      const summary = (Array.isArray(data) ? data : Object.entries(data || {}).map(([ruleType, counts]) => ({
        ruleType,
        total: counts.total || 0,
        warning: counts.warning || 0,
        escalated: counts.escalated || 0
      })));

      const totalCount = summary.reduce((sum, item) => sum + (item.total || 0), 0);

      return {
        success: true,
        summary: summary.map(item => ({
          ruleType: item.ruleType || item.rule_type,
          total: item.total || 0,
          warning: item.warning || 0,
          escalated: item.escalated || 0
        })),
        total: totalCount,
        message: `当前共 ${totalCount} 条超时预警，涉及 ${summary.length} 种规则类型`
      };
    } catch (error) {
      console.error('[overtime_summary] Error:', error.message);
      return {
        success: false,
        summary: [],
        total: 0,
        error: error.response?.data?.respDesc || error.message || '获取超时预警汇总失败'
      };
    }
  }
};
