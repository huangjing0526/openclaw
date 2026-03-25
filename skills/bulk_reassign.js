const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'bulk_reassign',
  description: '批量将某销售人员的线索/客户重新分配给另一人，先 preview 确认再执行',

  inputSchema: {
    type: 'object',
    properties: {
      entity_type: {
        type: 'string',
        enum: ['leads', 'customers'],
        description: '实体类型：leads=线索，customers=客户'
      },
      from_user_id: {
        type: 'string',
        description: '原负责人 ID'
      },
      to_user_id: {
        type: 'string',
        description: '目标负责人 ID'
      },
      status: {
        type: 'string',
        description: '状态筛选，逗号分隔（如 new,following）'
      },
      overtime_only: {
        type: 'boolean',
        default: false,
        description: '仅重新分配超时的实体'
      },
      preview: {
        type: 'boolean',
        default: true,
        description: 'true=仅预览（默认），false=执行'
      }
    },
    required: ['entity_type', 'from_user_id', 'to_user_id']
  },

  async execute(params, context) {
    const {
      entity_type,
      from_user_id,
      to_user_id,
      status,
      overtime_only = false,
      preview = true
    } = params;
    const { tenantId, userId } = context;

    if (!tenantId || !userId) {
      throw new Error('Missing tenantId or userId in context');
    }

    const client = createCRMClient({ tenantId, userId });

    const body = {
      entityType: entity_type,
      fromUserId: from_user_id,
      toUserId: to_user_id,
      filter: {
        overtimeOnly: overtime_only
      },
      preview
    };

    if (status) {
      body.filter.status = status.split(',').map(s => s.trim());
    }

    try {
      const response = await client.post('/api/mcp/actions/bulk-reassign', body);
      const data = response.data;

      if (data.respCode !== 0) {
        return { success: false, error: data.message || '批量重新分配失败' };
      }

      const result = data.data;

      if (preview) {
        const entityLabel = entity_type === 'leads' ? '线索' : '客户';
        const itemsDesc = (result.items || [])
          .map(i => `• ${i.name}${i.overtimeHours != null ? `（超时 ${i.overtimeHours}h）` : ''}`)
          .join('\n');

        return {
          success: true,
          preview: true,
          total: result.total,
          items: result.items || [],
          message: `将把以下 ${result.total} 条${entityLabel}从原负责人转给目标用户：\n${itemsDesc}\n\n回复"确认执行"以继续，或调整筛选条件。`
        };
      }

      return {
        success: true,
        preview: false,
        count: result.count,
        message: `已完成。${result.count} 条${entity_type === 'leads' ? '线索' : '客户'}已重新分配，目标用户已收到通知`
      };
    } catch (error) {
      if (error.response?.status === 403) {
        return { success: false, error: '权限不足，批量重新分配需要部门级或公司级权限' };
      }
      console.error('[bulk_reassign] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || '批量重新分配失败'
      };
    }
  }
};
