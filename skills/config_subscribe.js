const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'config_subscribe',
  description: '管理超时通知订阅，支持查看、新增、删除订阅和重置为默认订阅',

  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['list', 'add', 'remove', 'defaults'],
        description: '操作类型：list=查看订阅列表，add=新增订阅，remove=删除订阅，defaults=重置为默认订阅'
      },
      category: {
        type: 'string',
        description: '订阅类别（如：overtime_lead/overtime_customer/overtime_opportunity/overtime_quote/overtime_contract/overtime_task），action=add 时使用'
      },
      scope: {
        type: 'string',
        enum: ['department', 'company'],
        description: '订阅范围：department=部门，company=全公司，action=add 时使用'
      },
      subscriptionId: {
        type: 'string',
        description: '订阅记录 ID，action=remove 时必填'
      }
    },
    required: ['action']
  },

  async execute(params, context) {
    const { action, category, scope, subscriptionId } = params;
    const { tenantId, userId } = context;

    if (!tenantId || !userId) {
      throw new Error('Missing tenantId or userId in context');
    }

    const client = createCRMClient({ tenantId, userId });

    try {
      switch (action) {
        case 'list': {
          const response = await client.get('/api/alert-subscriptions');
          const data = response.data.data;
          const subscriptions = Array.isArray(data) ? data : (data?.subscriptions || []);

          return {
            success: true,
            subscriptions: subscriptions.map(s => ({
              id: s.id,
              category: s.category,
              scope: s.scope,
              enabled: s.enabled !== undefined ? s.enabled : true,
              createdAt: s.createdAt || s.created_at
            })),
            total: subscriptions.length,
            message: `当前共 ${subscriptions.length} 条通知订阅`
          };
        }

        case 'add': {
          if (!category) {
            return {
              success: false,
              error: '新增订阅需要提供 category 参数'
            };
          }

          const body = { category };
          if (scope) body.scope = scope;

          const response = await client.post('/api/alert-subscriptions', body);
          const data = response.data.data;

          return {
            success: true,
            subscription: data || null,
            message: `已成功订阅通知类别：${category}${scope ? `（范围：${scope}）` : ''}`
          };
        }

        case 'remove': {
          if (!subscriptionId) {
            return {
              success: false,
              error: '删除订阅需要提供 subscriptionId 参数'
            };
          }

          await client.delete(`/api/alert-subscriptions/${subscriptionId}`);

          return {
            success: true,
            message: `订阅 ${subscriptionId} 已成功删除`
          };
        }

        case 'defaults': {
          const response = await client.post('/api/alert-subscriptions/defaults');
          const data = response.data.data;

          return {
            success: true,
            subscriptions: data || null,
            message: '已重置为默认通知订阅配置'
          };
        }

        default:
          return {
            success: false,
            error: `不支持的操作类型：${action}，可选值：list/add/remove/defaults`
          };
      }
    } catch (error) {
      console.error('[config_subscribe] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.respDesc || error.message || '操作通知订阅失败'
      };
    }
  }
};
