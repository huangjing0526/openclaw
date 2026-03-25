const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'reassign',
  description: '将指定线索或客户重新分配给其他销售人员，需部门级或公司级权限',

  inputSchema: {
    type: 'object',
    properties: {
      entity_type: {
        type: 'string',
        enum: ['leads', 'customers'],
        description: '实体类型：leads=线索，customers=客户'
      },
      entity_id: {
        type: 'string',
        description: '线索或客户 ID'
      },
      to_user_id: {
        type: 'string',
        description: '目标销售人员 ID'
      },
      reason: {
        type: 'string',
        description: '重新分配原因（可选）'
      }
    },
    required: ['entity_type', 'entity_id', 'to_user_id']
  },

  async execute(params, context) {
    const { entity_type, entity_id, to_user_id, reason } = params;
    const { tenantId, userId } = context;

    if (!tenantId || !userId) {
      throw new Error('Missing tenantId or userId in context');
    }

    const client = createCRMClient({ tenantId, userId });

    try {
      const response = await client.post('/api/mcp/actions/reassign', {
        entityType: entity_type,
        entityId: entity_id,
        toUserId: to_user_id,
        reason: reason || null
      });

      const data = response.data;

      if (data.respCode !== 0) {
        return { success: false, error: data.message || '重新分配失败' };
      }

      return {
        success: true,
        entityId: entity_id,
        entityType: entity_type,
        toUserId: to_user_id,
        message: `已成功将${entity_type === 'leads' ? '线索' : '客户'} ${entity_id} 重新分配，双方已收到通知`
      };
    } catch (error) {
      if (error.response?.status === 403) {
        return { success: false, error: '权限不足，重新分配需要部门级或公司级权限' };
      }
      if (error.response?.status === 404) {
        return { success: false, error: '实体或目标用户不存在' };
      }
      console.error('[reassign] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || '重新分配失败'
      };
    }
  }
};
