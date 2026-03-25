const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'my_todo',
  description: '查看今日待办和逾期提醒，包含逾期任务、今日任务、待跟进和待处理商机',

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
      const response = await client.get('/api/mcp/my/todo');

      const data = response.data.data;

      const formatList = (items, labelKey) =>
        (items || []).map(item => ({
          id: item.id,
          label: item[labelKey] || item.title || item.name || '',
          due_at: item.due_at || item.next_follow_at || null
        }));

      return {
        success: true,
        overdue_tasks: {
          count: (data.overdueTasks || []).length,
          items: formatList(data.overdueTasks, 'title')
        },
        today_tasks: {
          count: (data.todayTasks || []).length,
          items: formatList(data.todayTasks, 'title')
        },
        follow_ups: {
          count: (data.followUps || []).length,
          items: formatList(data.followUps, 'name')
        },
        opportunities: {
          count: (data.opportunities || []).length,
          items: formatList(data.opportunities, 'title')
        },
        message: `逾期 ${(data.overdueTasks || []).length} 项，今日待办 ${(data.todayTasks || []).length} 项，待跟进 ${(data.followUps || []).length} 条，待处理商机 ${(data.opportunities || []).length} 个`
      };
    } catch (error) {
      console.error('[my_todo] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.respDesc || '获取待办信息失败'
      };
    }
  }
};
