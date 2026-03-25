const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'pipeline_forecast',
  description: '获取销售管道预测，展示活跃商机总金额、各阶段分布、高风险商机列表',

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
      const response = await client.get('/api/mcp/report/pipeline-forecast');
      const data = response.data?.data;

      if (!data) {
        return { success: false, error: '获取管道预测失败' };
      }

      const riskCount = data.opportunities?.filter(o => o.isAtRisk).length || 0;

      return {
        success: true,
        totalForecast: data.totalForecast,
        byStage: data.byStage,
        opportunities: data.opportunities || [],
        message: `管道预测总金额 ¥${(data.totalForecast || 0).toLocaleString()}，其中 ${riskCount} 个商机有超时风险`
      };
    } catch (error) {
      console.error('[pipeline_forecast] Error:', error.message);
      return {
        success: false,
        opportunities: [],
        error: error.response?.data?.message || error.message || '获取管道预测失败'
      };
    }
  }
};
