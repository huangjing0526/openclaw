const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'overtime_list',
  description: '查询超时预警列表，支持按规则类型、级别、状态筛选和分页',

  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        description: '规则类型，逗号分隔多个值（可选值：lead_uncontacted/customer_no_followup/opportunity_stale/quote_no_response/contract_expiry/task_overdue）'
      },
      level: {
        type: 'string',
        enum: ['warning', 'escalated'],
        description: '预警级别：warning=预警，escalated=升级'
      },
      status: {
        type: 'string',
        default: 'active',
        description: '预警状态，默认 active'
      },
      page: {
        type: 'integer',
        minimum: 1,
        default: 1,
        description: '页码，默认1'
      },
      pageSize: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20,
        description: '每页条数，默认20'
      }
    },
    required: []
  },

  async execute(params, context) {
    const { type, level, status = 'active', page = 1, pageSize = 20 } = params;
    const { tenantId, userId } = context;

    if (!tenantId || !userId) {
      throw new Error('Missing tenantId or userId in context');
    }

    const client = createCRMClient({ tenantId, userId });

    try {
      const queryParams = { status, page, pageSize };
      if (type) queryParams.type = type;
      if (level) queryParams.level = level;

      const response = await client.get('/api/mcp/alerts/overtime', {
        params: queryParams
      });

      const { data, pagination } = response.data;

      return {
        success: true,
        alerts: (data || []).map(item => ({
          id: item.id,
          entityType: item.entityType || item.entity_type,
          entityName: item.entityName || item.entity_name,
          ruleType: item.ruleType || item.rule_type,
          level: item.level,
          overtimeHours: item.overtimeHours || item.overtime_hours,
          ownerName: item.ownerName || item.owner_name || '未分配'
        })),
        total: pagination?.total || 0,
        page: pagination?.page || page,
        message: `共 ${pagination?.total || 0} 条超时预警，当前第 ${pagination?.page || page} 页`
      };
    } catch (error) {
      console.error('[overtime_list] Error:', error.message);
      return {
        success: false,
        alerts: [],
        total: 0,
        error: error.response?.data?.respDesc || error.message || '获取超时预警列表失败'
      };
    }
  }
};
