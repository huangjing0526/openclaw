const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'individual_stats',
  description: '获取指定销售人员的详情统计，包括跟进方式分布、成单、当前负载和超时预警',

  inputSchema: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        description: '目标用户 ID'
      },
      period: {
        type: 'string',
        enum: ['day', 'week', 'month'],
        default: 'month',
        description: '统计周期'
      },
      date: {
        type: 'string',
        description: '日期（YYYY-MM-DD），默认今天'
      }
    },
    required: ['user_id']
  },

  async execute(params, context) {
    const { user_id, period = 'month', date } = params;
    const { tenantId, userId } = context;

    if (!tenantId || !userId) {
      throw new Error('Missing tenantId or userId in context');
    }

    const client = createCRMClient({ tenantId, userId });

    try {
      const queryParams = { period };
      if (date) queryParams.date = date;

      const response = await client.get(`/api/mcp/report/individual/${user_id}`, { params: queryParams });
      const data = response.data?.data;

      if (!data) {
        return { success: false, error: '获取个人统计失败' };
      }

      return {
        success: true,
        userId: data.userId,
        name: data.name,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
        followups: data.followups,
        newLeads: data.newLeads,
        closedDeals: data.closedDeals,
        currentLoad: data.currentLoad,
        overtimeAlerts: data.overtimeAlerts,
        message: `${data.name} ${data.period === 'month' ? '本月' : data.period === 'week' ? '本周' : '今日'}：跟进 ${data.followups?.total || 0} 次，成单 ${data.closedDeals?.count || 0} 单`
      };
    } catch (error) {
      if (error.response?.status === 403) {
        return { success: false, error: '权限不足，只能查看本人或本部门数据' };
      }
      if (error.response?.status === 404) {
        return { success: false, error: '用户不存在' };
      }
      console.error('[individual_stats] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || '获取个人统计失败'
      };
    }
  }
};
