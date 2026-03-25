require('dotenv').config();
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const sdkPath = require('path').join(__dirname, 'node_modules/@modelcontextprotocol/sdk/dist/cjs/types.js');
const { ListToolsRequestSchema, CallToolRequestSchema } = require(sdkPath);
const { loadSkills } = require('./lib/skill-loader');

// 创建MCP Server
const server = new Server(
  {
    name: 'Tarmeer CRM',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// 动态加载所有Skills（使用绝对路径，确保从任意 cwd 启动都能找到）
const skills = loadSkills(require('path').join(__dirname, 'skills'));

console.error(`[MCP Server] Loaded ${skills.length} skills:`);
skills.forEach(skill => {
  console.error(`  - ${skill.name}: ${skill.description}`);
});

// 注册工具列表处理器
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: skills.map(skill => ({
      name: skill.name,
      description: skill.description,
      inputSchema: skill.inputSchema
    }))
  };
});

// 注册工具调用处理器
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // 查找对应的Skill
  const skill = skills.find(s => s.name === name);
  if (!skill) {
    throw new Error(`Unknown tool: ${name}`);
  }

  // 从参数中提取上下文（OpenClaw会在_context中传递）
  const context = {
    tenantId: args._context?.tenantId || process.env.DEFAULT_TENANT_ID,
    userId: args._context?.userId || process.env.DEFAULT_USER_ID
  };

  // 移除_context避免传递给Skill
  const { _context, ...skillArgs } = args;

  // 执行Skill
  try {
    const result = await skill.execute(skillArgs, context);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    console.error(`[${name}] Error:`, error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

// 启动MCP Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[MCP Server] Started with stdio transport');
}

main().catch(error => {
  console.error('[MCP Server] Fatal error:', error);
  process.exit(1);
});
