const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'list_leads',
  description: '查询我的线索列表，支持按状态筛选',

  inputSchema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: '状态筛选，逗号分隔多个值（可选值：new/contacted/qualified/lost）'
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
    const { status, limit = 20, page = 1 } = params;
    const { tenantId, userId } = context;

    if (!tenantId || !userId) {
      throw new Error('Missing tenantId or userId in context');
    }

    const client = createCRMClient({ tenantId, userId });

    try {
      const queryParams = { limit, page };
      if (status) {
        queryParams.status = status;
      }

      const response = await client.get('/api/mcp/leads', {
        params: queryParams
      });

      const { data, pagination } = response.data;

      return {
        success: true,
        leads: data.map(item => ({
          id: item.id,
          name: item.name,
          status: item.status,
          phone: item.phone || '',
          created_at: item.created_at,
          owner: item.owner?.name || '未分配'
        })),
        total: pagination.total,
        page: pagination.page,
        message: `共 ${pagination.total} 条线索，当前第 ${pagination.page} 页`
      };
    } catch (error) {
      console.error('[list_leads] Error:', error.message);
      return {
        success: false,
        leads: [],
        total: 0,
        error: error.response?.data?.respDesc || '获取线索列表失败'
      };
    }
  }
};
