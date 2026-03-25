const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'daily_report',
  description: '获取销售简报原始数据，由 LLM 生成今日/本周/本月销售摘要并推送给订阅用户',

  inputSchema: {
    type: 'object',
    properties: {
      period: {
        type: 'string',
        enum: ['day', 'week', 'month'],
        default: 'day',
        description: '报告周期：day=今日，week=本周，month=本月'
      },
      date: {
        type: 'string',
        description: '日期（YYYY-MM-DD），默认今天'
      }
    },
    required: []
  },

  async execute(params, context) {
    const { period = 'day', date } = params;
    const { tenantId, userId } = context;

    if (!tenantId || !userId) {
      throw new Error('Missing tenantId or userId in context');
    }

    const client = createCRMClient({ tenantId, userId });

    try {
      const queryParams = { period };
      if (date) queryParams.date = date;

      const response = await client.get('/api/mcp/report/daily', { params: queryParams });
      const data = response.data?.data;

      if (!data) {
        return { success: false, error: '获取简报数据失败' };
      }

      return {
        success: true,
        date: data.date,
        period: data.period,
        alerts: data.alerts,
        metrics: data.metrics,
        teamRanking: data.teamRanking,
        pipeline: data.pipeline,
        // 给 LLM 的提示：请基于以上原始数据生成自然语言简报，突出异常和需关注事项
        _instructions: `请基于以上数据生成${period === 'day' ? '今日' : period === 'week' ? '本周' : '本月'}销售简报。
重点：1) 超时预警情况；2) 团队跟进表现对比；3) 管道风险商机；4) 数据亮点与建议行动。
语言与用户当前交互语言一致。`
      };
    } catch (error) {
      console.error('[daily_report] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || '获取简报数据失败'
      };
    }
  }
};
