# SKILL.md — OpenClaw Skill 命令参考

> 最后更新：2026-03-25
> 共 19 个 Skill

---

## Skill 清单

| 命令 | 文件 | 描述 |
|------|------|------|
| /搜索客户 | search_customer.js | 按姓名、公司名或电话模糊搜索客户/线索 |
| /客户详情 | get_customer.js | 获取指定客户的详细信息 |
| /新建客户 | create_customer.js | 创建新客户 |
| /新建线索 | create_lead.js | 创建新线索 |
| /线索详情 | get_lead.js | 获取指定线索的详细信息 |
| /新建跟进 | create_followup.js | 创建客户或线索的跟进记录 |
| /跟进记录 | list_followups.js | 获取客户或线索的跟进记录列表 |
| /待跟进 | list_upcoming_followups.js | 获取当前用户待跟进的客户/线索列表（含已逾期） |
| /跟进建议 | suggest_followup.js | AI 分析跟进内容，建议跟进结果和下次时间 |
| /跟进总结 | summarize_followups.js | AI 总结客户/线索跟进历史，生成摘要和下一步建议 |
| /线索 /leads | list_leads.js | 查询我的线索列表，支持状态筛选 |
| /商机 /opps | list_opportunities.js | 查询我的商机列表，支持阶段筛选 |
| /待办 /todo | my_todo.js | 查看今日待办和逾期提醒 |
| overtime-list | overtime_list.js | 查询超时预警列表，支持规则类型/级别/状态筛选 |
| overtime-summary | overtime_summary.js | 超时预警汇总，按规则类型分组展示数量 |
| overtime-resolve | overtime_resolve.js | 手动解除指定超时预警 |
| overtime-whitelist | overtime_whitelist.js | 将超时预警加入白名单，暂停通知 |
| config-overtime | config_overtime.js | 查看或修改超时阈值配置 |
| config-subscribe | config_subscribe.js | 管理超时通知订阅（查看/新增/删除/重置） |

---

## 详细说明

### /搜索客户 (`search_customer`)

**描述：** 按姓名、公司名或电话关键词模糊搜索客户或线索。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| query | string | 是 | 搜索关键词（姓名、公司名或电话） |
| type | string | 否 | 搜索类型：`customer`（默认）或 `lead` |
| pageSize | integer | 否 | 每页返回数量，默认10，最大50 |

**示例：**
```json
{
  "name": "search_customer",
  "arguments": {
    "query": "华为",
    "type": "customer",
    "pageSize": 10
  }
}
```

**返回：**
- `results`：匹配列表，每项含 `id / name / company / phone / email / status`
- `total`：总匹配数
- `message`：结果摘要文字

---

### /客户详情 (`get_customer`)

**描述：** 通过客户 ID 获取客户的完整详情信息。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| customer_id | string | 是 | 客户 ID |

**示例：**
```json
{
  "name": "get_customer",
  "arguments": {
    "customer_id": "cust-123"
  }
}
```

**返回：**
- `customer`：含 `id / name / company / phone / email / status / owner / created_at`

---

### /新建客户 (`create_customer`)

**描述：** 在 CRM 中创建一条新客户记录。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 客户姓名 |
| company | string | 否 | 公司名称 |
| phone | string | 否 | 电话号码 |
| email | string | 否 | 邮箱 |

**示例：**
```json
{
  "name": "create_customer",
  "arguments": {
    "name": "张三",
    "company": "阿里巴巴",
    "phone": "13800138000"
  }
}
```

**返回：**
- `customer_id`：新建客户 ID
- `name`：客户姓名
- `company`：公司名称
- `message`：操作结果提示

---

### /新建线索 (`create_lead`)

**描述：** 在 CRM 中创建一条新线索记录。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 线索联系人姓名 |
| company | string | 否 | 公司名称 |
| phone | string | 否 | 电话号码 |
| email | string | 否 | 邮箱 |
| source | string | 否 | 线索来源（如 referral / website / cold_call） |

**示例：**
```json
{
  "name": "create_lead",
  "arguments": {
    "name": "李四",
    "company": "腾讯",
    "phone": "13900139000",
    "source": "referral"
  }
}
```

**返回：**
- `lead_id`：新建线索 ID
- `name`：联系人姓名
- `company`：公司名称
- `message`：操作结果提示

---

### /线索详情 (`get_lead`)

**描述：** 通过线索 ID 获取线索的完整详情信息。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| lead_id | string | 是 | 线索 ID |

**示例：**
```json
{
  "name": "get_lead",
  "arguments": {
    "lead_id": "lead-456"
  }
}
```

**返回：**
- `lead`：含 `id / name / company / phone / email / status / source / score / last_followed_at / owner / created_at`

---

### /新建跟进 (`create_followup`)

**描述：** 为客户、线索或商机创建一条跟进记录。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| entity_type | string | 是 | 实体类型：`customer` / `lead` / `opportunity` |
| entity_id | string | 是 | 实体 ID |
| method | string | 是 | 跟进方式：`phone` / `wechat` / `email` / `visit` / `meeting` |
| content | string | 是 | 跟进内容 |
| result | string | 否 | 跟进结果：`interested` / `considering` / `rejected` |
| next_follow_at | string | 否 | 下次跟进时间（ISO 8601 格式） |

**示例：**
```json
{
  "name": "create_followup",
  "arguments": {
    "entity_type": "lead",
    "entity_id": "lead-456",
    "method": "phone",
    "content": "电话沟通了解需求，客户对产品感兴趣",
    "result": "interested",
    "next_follow_at": "2026-03-28T10:00:00Z"
  }
}
```

**返回：**
- `followup_id`：跟进记录 ID
- `created_at`：创建时间
- `message`：操作结果提示

---

### /跟进记录 (`list_followups`)

**描述：** 获取指定客户、线索或商机的历史跟进记录列表。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| entity_type | string | 是 | 实体类型：`customer` / `lead` / `opportunity` |
| entity_id | string | 是 | 实体 ID |
| pageSize | integer | 否 | 每页返回数量，默认10，最大50 |

**示例：**
```json
{
  "name": "list_followups",
  "arguments": {
    "entity_type": "lead",
    "entity_id": "lead-456",
    "pageSize": 5
  }
}
```

**返回：**
- `followups`：跟进记录列表，每项含 `id / method / content / result / created_by / created_at / next_follow_at`
- `total`：总记录数

---

### /待跟进 (`list_upcoming_followups`)

**描述：** 获取当前用户待跟进的客户/线索列表，包含已逾期记录。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| days | integer | 否 | 查询未来几天内的待跟进，默认7天（同时包含已逾期） |
| pageSize | integer | 否 | 返回数量，默认20，最大50 |

**示例：**
```json
{
  "name": "list_upcoming_followups",
  "arguments": {
    "days": 3,
    "pageSize": 10
  }
}
```

**返回：**
- `followups`：待跟进列表，每项含 `id / method / content / next_follow_at / is_overdue / entity_type / entity_id / entity_name / entity_company / entity_status`
- `total`：总记录数
- `message`：结果摘要文字

---

### /跟进建议 (`suggest_followup`)

**描述：** 基于本次跟进内容，AI 分析并建议跟进结果、下次跟进时间和意向强度。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| entity_id | string | 是 | 客户或线索 ID |
| entity_type | string | 否 | 实体类型：`lead`（默认）或 `customer` |
| content | string | 是 | 本次跟进的内容描述 |
| recent_followups | array | 否 | 最近几次跟进内容字符串数组（用于上下文分析） |

**示例：**
```json
{
  "name": "suggest_followup",
  "arguments": {
    "entity_id": "lead-456",
    "entity_type": "lead",
    "content": "今天电话沟通，客户说下周要开预算会议，有意向但需要等审批"
  }
}
```

**返回：**
- `suggestion`：含 `result / result_explanation / next_follow_at / next_follow_explanation / intent_strength / key_points`

---

### /跟进总结 (`summarize_followups`)

**描述：** AI 总结客户或线索的全部跟进历史，生成摘要、当前阶段和下一步行动建议。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| entity_id | string | 是 | 客户或线索 ID |
| entity_type | string | 否 | 实体类型：`leads`（默认）或 `customers`（注意用复数） |
| locale | string | 否 | 返回语言：`zh`（默认）或 `en` |

**示例：**
```json
{
  "name": "summarize_followups",
  "arguments": {
    "entity_id": "lead-456",
    "entity_type": "leads"
  }
}
```

**返回：**
- `summary`：含 `text / current_stage / next_action / key_points`
- 若跟进记录不足，返回 `summary: null` 和提示 `message`

---

### /线索 /leads (`list_leads`)

**描述：** 查询当前用户的线索列表，支持按状态筛选和分页。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 状态筛选，逗号分隔多个值。可选：`new` / `contacted` / `qualified` / `lost` |
| limit | integer | 否 | 返回条数，默认20，最大100 |
| page | integer | 否 | 页码，默认1 |

**示例：**
```json
{
  "name": "list_leads",
  "arguments": {
    "status": "new,contacted",
    "limit": 20,
    "page": 1
  }
}
```

**返回：**
- `leads`：线索列表，每项含 `id / name / status / phone / created_at / owner`
- `total`：总记录数
- `page`：当前页码
- `message`：结果摘要文字

---

### /商机 /opps (`list_opportunities`)

**描述：** 查询当前用户的商机列表，支持按阶段筛选和分页。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| stage | string | 否 | 阶段筛选，逗号分隔多个值。可选：`prospect` / `qualified` / `proposal` / `negotiation` / `closed_won` / `closed_lost` |
| limit | integer | 否 | 返回条数，默认20，最大100 |
| page | integer | 否 | 页码，默认1 |

**示例：**
```json
{
  "name": "list_opportunities",
  "arguments": {
    "stage": "proposal,negotiation",
    "limit": 20,
    "page": 1
  }
}
```

**返回：**
- `opportunities`：商机列表，每项含 `id / title / stage / amount / customer / owner`
- `total`：总记录数
- `page`：当前页码
- `message`：结果摘要文字

---

### /待办 /todo (`my_todo`)

**描述：** 查看今日待办和逾期提醒，分组展示逾期任务、今日任务、待跟进联系人和待处理商机。

**参数：** 无

**示例：**
```json
{
  "name": "my_todo",
  "arguments": {}
}
```

**返回：**
- `overdue_tasks`：逾期任务，含 `count` 和 `items`（每项含 `id / label / due_at`）
- `today_tasks`：今日任务，含 `count` 和 `items`
- `follow_ups`：待跟进联系人，含 `count` 和 `items`
- `opportunities`：待处理商机，含 `count` 和 `items`
- `message`：各组数量的汇总摘要

---

### overtime-list (`overtime_list`)

**描述：** 查询超时预警列表，支持按规则类型、级别和状态筛选。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 规则类型，逗号分隔多个值。可选：`lead_uncontacted` / `customer_no_followup` / `opportunity_stale` / `quote_no_response` / `contract_expiry` / `task_overdue` |
| level | string | 否 | 预警级别：`warning` 或 `escalated` |
| status | string | 否 | 预警状态，默认 `active` |
| page | integer | 否 | 页码，默认1 |
| pageSize | integer | 否 | 每页条数，默认20，最大100 |

**示例：**
```json
{
  "name": "overtime_list",
  "arguments": {
    "type": "lead_uncontacted,customer_no_followup",
    "level": "warning",
    "page": 1,
    "pageSize": 20
  }
}
```

**返回：**
- `alerts`：预警列表，每项含 `id / entityType / entityName / ruleType / level / overtimeHours / ownerName`
- `total`：总记录数
- `page`：当前页码
- `message`：结果摘要文字

---

### overtime-summary (`overtime_summary`)

**描述：** 获取超时预警汇总统计，按规则类型分组展示各类预警数量。

**参数：** 无

**示例：**
```json
{
  "name": "overtime_summary",
  "arguments": {}
}
```

**返回：**
- `summary`：分组列表，每项含 `ruleType / total / warning / escalated`
- `total`：所有类型预警总数
- `message`：汇总摘要文字

---

### overtime-resolve (`overtime_resolve`)

**描述：** 手动解除指定超时预警记录。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 预警记录 ID |

**示例：**
```json
{
  "name": "overtime_resolve",
  "arguments": {
    "id": "alert-123"
  }
}
```

**返回：**
- `alert`：已解除的预警信息
- `message`：操作结果提示

---

### overtime-whitelist (`overtime_whitelist`)

**描述：** 将指定超时预警加入白名单，暂停通知一段时间。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 预警记录 ID |
| durationDays | integer | 是 | 暂停通知天数（1-90天） |

**示例：**
```json
{
  "name": "overtime_whitelist",
  "arguments": {
    "id": "alert-123",
    "durationDays": 7
  }
}
```

**返回：**
- `alert`：预警信息
- `expiresAt`：白名单到期时间
- `message`：操作结果提示，含到期时间

---

### config-overtime (`config_overtime`)

**描述：** 查看或修改超时阈值配置，支持更新指定规则阈值和重置为默认值。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 否 | 操作类型：`get`=查看（默认），`reset`=重置为默认 |
| rule | string | 否 | 规则类型，配合 `hours` 使用来更新阈值 |
| hours | number | 否 | 提醒阈值（小时），配合 `rule` 使用 |
| escalationHours | number | 否 | 升级阈值（小时），配合 `rule` 使用（可选） |

**示例 - 查看配置：**
```json
{
  "name": "config_overtime",
  "arguments": {}
}
```

**示例 - 修改规则阈值：**
```json
{
  "name": "config_overtime",
  "arguments": {
    "rule": "lead_uncontacted",
    "hours": 48,
    "escalationHours": 72
  }
}
```

**示例 - 重置为默认：**
```json
{
  "name": "config_overtime",
  "arguments": {
    "action": "reset"
  }
}
```

**返回：**
- `config`：完整配置数据
- `rules`（查看时）：格式化规则列表，每项含 `ruleType / enabled / warningHours / escalationHours`
- `message`：操作结果摘要

---

### config-subscribe (`config_subscribe`)

**描述：** 管理超时通知订阅，支持查看、新增、删除订阅和重置为默认订阅。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 操作类型：`list` / `add` / `remove` / `defaults` |
| category | string | 否 | 订阅类别（如：`overtime_lead` / `overtime_customer` / ...），action=add 时使用 |
| scope | string | 否 | 订阅范围：`department` 或 `company`，action=add 时使用 |
| subscriptionId | string | 否 | 订阅记录 ID，action=remove 时必填 |

**示例 - 查看订阅列表：**
```json
{
  "name": "config_subscribe",
  "arguments": {
    "action": "list"
  }
}
```

**示例 - 新增订阅：**
```json
{
  "name": "config_subscribe",
  "arguments": {
    "action": "add",
    "category": "overtime_lead",
    "scope": "department"
  }
}
```

**示例 - 删除订阅：**
```json
{
  "name": "config_subscribe",
  "arguments": {
    "action": "remove",
    "subscriptionId": "sub-456"
  }
}
```

**返回：**
- `list`：`subscriptions`（含 `id / category / scope / enabled / createdAt`）和 `total`
- `add`：`subscription`（新建的订阅记录）
- `remove`：`message`（操作结果提示）
- `defaults`：`subscriptions`（重置后的订阅列表）
