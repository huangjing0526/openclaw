const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'config_overtime',
  description: '查看或修改超时阈值配置，支持查询、更新指定规则阈值和重置为默认值',

  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['get', 'reset'],
        default: 'get',
        description: '操作类型：get=查看配置（默认），reset=重置为默认值'
      },
      rule: {
        type: 'string',
        description: '规则类型（可选值：lead_uncontacted/customer_no_followup/opportunity_stale/quote_no_response/contract_expiry/task_overdue），配合 hours 使用来更新阈值'
      },
      hours: {
        type: 'number',
        minimum: 1,
        description: '提醒阈值（小时），配合 rule 使用'
      },
      escalationHours: {
        type: 'number',
        minimum: 1,
        description: '升级阈值（小时），配合 rule 使用（可选）'
      }
    },
    required: []
  },

  async execute(params, context) {
    const { action = 'get', rule, hours, escalationHours } = params;
    const { tenantId, userId } = context;

    if (!tenantId || !userId) {
      throw new Error('Missing tenantId or userId in context');
    }

    const client = createCRMClient({ tenantId, userId });

    try {
      // 重置为默认配置
      if (action === 'reset') {
        const response = await client.post('/api/tenant-config/overtime-rules/reset');
        const data = response.data.data;
        return {
          success: true,
          config: data || null,
          message: '超时阈值配置已重置为默认值'
        };
      }

      // 如果传了 rule + hours，则更新指定规则阈值
      if (rule && hours !== undefined) {
        // 先获取现有配置
        const getResponse = await client.get('/api/tenant-config/overtime-rules');
        const existingConfig = getResponse.data.data;

        // 找到对应规则并修改阈值
        const rules = Array.isArray(existingConfig)
          ? existingConfig
          : (existingConfig?.rules || []);

        const updatedRules = rules.map(r => {
          const ruleKey = r.ruleType || r.rule_type || r.type;
          if (ruleKey === rule) {
            const updated = { ...r };
            if (updated.thresholds) {
              updated.thresholds = { ...updated.thresholds };
              updated.thresholds.warningHours = hours;
              if (escalationHours !== undefined) {
                updated.thresholds.escalationHours = escalationHours;
              }
            } else {
              updated.warningHours = hours;
              if (escalationHours !== undefined) {
                updated.escalationHours = escalationHours;
              }
            }
            return updated;
          }
          return r;
        });

        const putPayload = Array.isArray(existingConfig)
          ? updatedRules
          : { ...existingConfig, rules: updatedRules };

        const putResponse = await client.put('/api/tenant-config/overtime-rules', putPayload);
        const updatedConfig = putResponse.data.data;

        return {
          success: true,
          config: updatedConfig || putPayload,
          message: `规则 ${rule} 的提醒阈值已更新为 ${hours} 小时${escalationHours !== undefined ? `，升级阈值 ${escalationHours} 小时` : ''}`
        };
      }

      // 默认：查看配置
      const response = await client.get('/api/tenant-config/overtime-rules');
      const data = response.data.data;

      const rules = Array.isArray(data) ? data : (data?.rules || []);

      return {
        success: true,
        config: data,
        rules: rules.map(r => ({
          ruleType: r.ruleType || r.rule_type || r.type,
          enabled: r.enabled !== undefined ? r.enabled : true,
          warningHours: r.thresholds?.warningHours || r.warningHours,
          escalationHours: r.thresholds?.escalationHours || r.escalationHours
        })),
        message: `当前共 ${rules.length} 条超时规则配置`
      };
    } catch (error) {
      console.error('[config_overtime] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.respDesc || error.message || '操作超时配置失败'
      };
    }
  }
};
