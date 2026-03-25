const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'team_stats',
  description: '获取团队统计数据，按人展示跟进数、新增线索、成单金额、超时预警数',

  inputSchema: {
    type: 'object',
    properties: {
      period: {
        type: 'string',
        enum: ['day', 'week', 'month'],
        default: 'week',
        description: '统计周期：day=今日，week=本周，month=本月'
      },
      date: {
        type: 'string',
        description: '日期（YYYY-MM-DD），默认今天'
      }
    },
    required: []
  },

  async execute(params, context) {
    const { period = 'week', date } = params;
    const { tenantId, userId } = context;

    if (!tenantId || !userId) {
      throw new Error('Missing tenantId or userId in context');
    }

    const client = createCRMClient({ tenantId, userId });

    try {
      const queryParams = { period };
      if (date) queryParams.date = date;

      const response = await client.get('/api/mcp/report/team-stats', { params: queryParams });
      const data = response.data?.data;

      if (!data) {
        return { success: false, error: '获取团队统计失败' };
      }

      const total = data.members?.length || 0;
      return {
        success: true,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
        members: data.members || [],
        message: `${data.period === 'week' ? '本周' : data.period === 'month' ? '本月' : '今日'}共 ${total} 位成员有数据`
      };
    } catch (error) {
      console.error('[team_stats] Error:', error.message);
      return {
        success: false,
        members: [],
        error: error.response?.data?.message || error.message || '获取团队统计失败'
      };
    }
  }
};
