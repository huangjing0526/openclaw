# Tarmeer CRM - MCP Server

AI-powered CRM system with Model Context Protocol (MCP) integration.

## Features

- 🔍 **Smart Customer Search** - Search customers by name, company, or phone
- 📝 **Followup Management** - Create and track customer followup records
- 🤖 **AI Integration** - Works with OpenClaw and other MCP-compatible clients
- 🔐 **Secure** - Gateway key authentication with tenant isolation

## Architecture

```
OpenClaw Gateway (MCP Client)
      ↓ (MCP Protocol - stdio)
tarmeer-mcp-server (This Project)
  ├─ Skills (独立功能单元)
  │   ├─ search_customer.js
  │   ├─ get_customer.js
  │   ├─ create_followup.js
  │   └─ list_followups.js
  └─ CRM Client (HTTP封装)
      ↓ (HTTP REST + Gateway Key Auth)
Tarmeer CRM API
```

## Installation

```bash
# Clone repository
git clone https://github.com/huangjing0526/tarmeerMCP.git
cd tarmeerMCP

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set CRM_BASE_URL and CRM_GATEWAY_KEY
```

## Configuration

Create a `.env` file with:

```env
CRM_BASE_URL=http://localhost:3000
CRM_GATEWAY_KEY=your-gateway-key-here
MCP_TRANSPORT=stdio
```

## Usage

### Standalone Mode

```bash
npm start
```

### With OpenClaw

Add to your OpenClaw configuration (`~/.openclaw/config.json`):

```json
{
  "mcp_servers": {
    "tarmeer-crm": {
      "command": "node",
      "args": ["/path/to/tarmeerMCP/index.js"],
      "env": {
        "CRM_BASE_URL": "http://localhost:3000",
        "CRM_GATEWAY_KEY": "your-gateway-key",
        "MCP_TRANSPORT": "stdio"
      }
    }
  }
}
```

## Available Skills

> 详细说明请参阅 [SKILL.md](./SKILL.md)

| 命令 | Skill | 描述 |
|------|-------|------|
| /搜索客户 | search_customer | 按姓名、公司名或电话模糊搜索客户/线索 |
| /客户详情 | get_customer | 获取指定客户的详细信息 |
| /新建客户 | create_customer | 创建新客户 |
| /新建线索 | create_lead | 创建新线索 |
| /线索详情 | get_lead | 获取指定线索的详细信息 |
| /新建跟进 | create_followup | 创建客户或线索的跟进记录 |
| /跟进记录 | list_followups | 获取客户或线索的跟进记录列表 |
| /待跟进 | list_upcoming_followups | 获取待跟进的客户/线索列表（含已逾期） |
| /跟进建议 | suggest_followup | AI 分析跟进内容，建议结果和下次时间 |
| /跟进总结 | summarize_followups | AI 总结跟进历史，生成摘要和建议 |
| /线索 /leads | list_leads | 查询我的线索列表，支持状态筛选 |
| /商机 /opps | list_opportunities | 查询我的商机列表，支持阶段筛选 |
| /待办 /todo | my_todo | 查看今日待办和逾期提醒 |

## Development

### Adding a New Skill

1. Create a new file in `skills/` directory:

```javascript
// skills/my_skill.js
const { createCRMClient } = require('../lib/crm-client');

module.exports = {
  name: 'my_skill',
  description: 'Description of what this skill does',

  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Parameter description'
      }
    },
    required: ['param1']
  },

  async execute(params, context) {
    const { tenantId, userId } = context;
    const client = createCRMClient({ tenantId, userId });

    // Your implementation here
    const response = await client.get('/api/endpoint');

    return {
      success: true,
      data: response.data
    };
  }
};
```

2. Skills are automatically loaded on server start

### Running Tests

```bash
npm test
```

## Project Structure

```
tarmeerMCP/
├── index.js              # MCP Server entry point
├── lib/
│   ├── crm-client.js     # CRM HTTP client factory
│   └── skill-loader.js   # Dynamic skill loader
├── skills/               # Skill implementations
│   ├── search_customer.js
│   ├── get_customer.js
│   ├── create_followup.js
│   └── list_followups.js
├── tests/                # Test files
│   └── skills/
├── .env.example          # Environment template
├── .gitignore
├── package.json
└── README.md
```

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues and questions, please open an issue on GitHub.
