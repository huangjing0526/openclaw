const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'list_opportunities',
  description: '查询我的商机列表，支持按阶段筛选',

  inputSchema: {
    type: 'object',
    properties: {
      stage: {
        type: 'string',
        description: '阶段筛选，逗号分隔多个值（可选值：prospect/qualified/proposal/negotiation/closed_won/closed_lost）'
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20,
        description: '返回条数，默认20'
      },
      page: {
        type: 'integer',
        minimum: 1,
        default: 1,
        description: '页码，默认1'
      }
    },
    required: []
  },

  async execute(params, context) {
    const { stage, limit = 20, page = 1 } = params;
    const { tenantId, userId } = context;

    if (!tenantId || !userId) {
      throw new Error('Missing tenantId or userId in context');
    }

    const client = createCRMClient({ tenantId, userId });

    try {
      const queryParams = { limit, page };
      if (stage) {
        queryParams.stage = stage;
      }

      const response = await client.get('/api/mcp/opportunities', {
        params: queryParams
      });

      const { data, pagination } = response.data;

      return {
        success: true,
        opportunities: data.map(item => ({
          id: item.id,
          title: item.title,
          stage: item.stage,
          amount: item.amount || 0,
          customer: item.customer?.name || '',
          owner: item.owner?.name || '未分配'
        })),
        total: pagination.total,
        page: pagination.page,
        message: `共 ${pagination.total} 个商机，当前第 ${pagination.page} 页`
      };
    } catch (error) {
      console.error('[list_opportunities] Error:', error.message);
      return {
        success: false,
        opportunities: [],
        total: 0,
        error: error.response?.data?.respDesc || '获取商机列表失败'
      };
    }
  }
};
