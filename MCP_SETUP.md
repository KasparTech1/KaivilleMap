# MCP (Model Context Protocol) Setup

**KaivilleMap MCP Server Configuration**

This document explains the MCP servers configured for this project and how to use them.

---

## 📋 What is MCP?

**Model Context Protocol (MCP)** is a standard protocol that allows AI assistants like Claude to connect to external tools and services. Think of it as plugins for Claude Code.

**Benefits**:
- ✅ Enhanced capabilities beyond basic file operations
- ✅ Browser automation for testing and debugging
- ✅ Advanced agent workflows with SuperClaude
- ✅ Seamless integration with Claude Code CLI

---

## 🔧 Configured MCP Servers

### 1. Agent Browser (`@nxavis/agent-browser-mcp`)

**Purpose**: Enables browser automation and web interaction capabilities

**Features**:
- Automated browser testing
- Web scraping and data extraction
- Screenshot capture
- Form filling and interaction
- Page navigation and inspection

**Use Cases for KaivilleMap**:
- Test the interactive building map UI
- Verify responsive design across viewports
- Automate research article generation flows
- Debug authentication and routing
- Visual regression testing

**Example Commands**:
```bash
# Claude can now:
- "Open the homepage in a browser and take a screenshot"
- "Navigate to the research center and test article creation"
- "Fill out the login form and verify it works"
- "Check if the map is rendering correctly on mobile"
```

---

### 2. SuperAgent (`@superclaude-org/superagent`)

**Purpose**: Advanced AI agent capabilities for complex multi-step tasks

**Features**:
- Multi-step task orchestration
- Context-aware decision making
- Advanced reasoning and planning
- Tool chaining and workflows
- Error recovery and retry logic

**Use Cases for KaivilleMap**:
- Complex refactoring across multiple files
- Feature implementation planning and execution
- Automated code review and suggestions
- Database schema migrations
- End-to-end testing workflows

**Example Commands**:
```bash
# Claude can now:
- "Plan and implement a new feature for user authentication"
- "Analyze the entire codebase and suggest performance optimizations"
- "Create a comprehensive test suite for the research module"
- "Migrate all components to use the new API structure"
```

---

## 🚀 Getting Started

### Prerequisites

- Claude Code CLI installed
- Node.js 18+ installed
- NPM or pnpm available

### Installation

**The MCP servers are automatically available** when you use Claude Code in this repository.

No manual installation needed - the `.mcp.json` configuration tells Claude Code to load these servers on-demand using `npx`.

---

## 📝 Configuration File

**Location**: `.mcp.json`

```json
{
  "agent-browser": {
    "command": "npx",
    "args": ["-y", "@nxavis/agent-browser-mcp"]
  },
  "superagent": {
    "command": "npx",
    "args": ["-y", "@superclaude-org/superagent"]
  }
}
```

**How it works**:
1. Claude Code reads `.mcp.json` when you start a session
2. When MCP capabilities are needed, Claude runs `npx -y <package>`
3. The package is downloaded and started as an MCP server
4. Claude communicates with the server via stdio

**The `-y` flag** automatically accepts prompts, allowing seamless server startup.

---

## 🎯 Usage Examples

### Browser Automation

**Test the Site Login**:
```
Claude, please open a browser, navigate to http://localhost:5173,
and test the site login with the password 'Bryan'
```

**Visual Regression Testing**:
```
Take screenshots of the homepage at desktop, tablet, and mobile
viewports and compare them for visual consistency
```

**Interactive Map Testing**:
```
Open the building map, click on each building, and verify the
connections are displayed correctly
```

---

### SuperAgent Workflows

**Feature Implementation**:
```
Plan and implement a dark mode toggle feature:
1. Add theme state management
2. Update all components to support dark mode
3. Add a toggle button to the header
4. Persist user preference
5. Test across all pages
```

**Code Quality Improvement**:
```
Review the entire codebase and:
1. Identify components over 800 lines
2. Suggest refactoring strategies
3. Create smaller, focused components
4. Update imports and tests
5. Verify nothing broke
```

**Database Migration**:
```
Migrate the articles table to add new fields:
1. Create migration SQL
2. Update Supabase client
3. Update TypeScript types
4. Update all queries
5. Test the changes
6. Document the new schema
```

---

## 🔍 Debugging MCP Servers

### Check if MCP servers are loaded

```bash
# In Claude Code, ask:
"What MCP servers are available?"
```

### View MCP server logs

MCP servers output logs to stderr. If something isn't working:

```bash
# Check Claude Code logs
# They will show MCP server startup and errors
```

### Common Issues

**Issue**: MCP server fails to start
**Solution**: Ensure Node.js 18+ is installed and `npx` is in your PATH

**Issue**: Browser automation doesn't work
**Solution**: Make sure you have a browser installed (Chrome/Chromium)

**Issue**: SuperAgent tasks timeout
**Solution**: Break down complex tasks into smaller steps

---

## 📚 Additional Resources

### Agent Browser MCP
- **Package**: `@nxavis/agent-browser-mcp`
- **Docs**: https://github.com/nxavis/agent-browser-mcp

### SuperAgent
- **Package**: `@superclaude-org/superagent`
- **Docs**: https://github.com/superclaude-org/superagent

### MCP Protocol
- **Specification**: https://modelcontextprotocol.io
- **Claude Docs**: https://docs.anthropic.com/claude/docs/model-context-protocol

---

## 🔐 Security Considerations

### Browser Automation
- MCP browser server runs **locally** on your machine
- No data is sent to external services
- Browser sessions are isolated and temporary
- Always review what actions Claude will take before confirming

### SuperAgent
- Executes operations with your local permissions
- Can modify files, run commands, and make API calls
- Always verify complex operations before approving
- Use version control to track changes

---

## 🛠️ Customization

### Adding New MCP Servers

To add additional MCP servers:

1. **Edit `.mcp.json`**:
```json
{
  "agent-browser": { ... },
  "superagent": { ... },
  "my-custom-server": {
    "command": "npx",
    "args": ["-y", "@org/my-custom-mcp-server"]
  }
}
```

2. **Restart Claude Code session**
3. **Verify**: Ask Claude "What MCP servers are available?"

### Creating Custom MCP Servers

You can build custom MCP servers for KaivilleMap-specific tasks:

```typescript
// Example: Custom Supabase MCP server
// Provides direct database operations
// Handles RLS policies automatically
// Validates data before insertion
```

See: `docs/CUSTOM_MCP_SERVERS.md` (to be created)

---

## 📊 Performance Impact

**Startup Time**:
- Initial MCP server load: ~2-3 seconds
- Subsequent commands: Nearly instant
- Servers remain active during Claude Code session

**Resource Usage**:
- Agent Browser: ~100-200MB RAM (when active)
- SuperAgent: ~50-100MB RAM
- Minimal CPU when idle

**Network Usage**:
- First run: Downloads packages (~10-20MB)
- Cached locally for future sessions
- No network needed after initial download

---

## 🧪 Testing

### Verify MCP Setup

Run these commands to test each server:

**Test Browser MCP**:
```
Claude, open a browser to https://example.com and
describe what you see
```

**Test SuperAgent**:
```
Claude, analyze this codebase structure and create
a summary of the architecture
```

If both work, your MCP setup is configured correctly! ✅

---

## 🔄 Updating MCP Servers

MCP servers are loaded via `npx -y`, which means:

- **Latest version** is used by default
- **No manual updates** needed
- **Cache cleared** periodically by npm/npx

To force update:
```bash
# Clear npx cache
npx clear-npx-cache

# Or manually reinstall
npm cache clean --force
```

---

## 💡 Best Practices

### When to Use MCP

**Use Browser MCP when**:
- Testing UI interactions
- Debugging visual issues
- Scraping data from web sources
- Automating repetitive browser tasks

**Use SuperAgent when**:
- Planning complex features
- Multi-file refactoring
- Implementing new architecture patterns
- Automated code reviews

**Use Regular Claude Code when**:
- Simple file edits
- Reading documentation
- Answering questions
- Quick fixes

### Prompting Tips

**Be specific about which tool to use**:
```
✅ "Use browser automation to test the login flow"
✅ "Use SuperAgent to plan this refactoring"

❌ "Test the login" (ambiguous)
```

**Break down complex tasks**:
```
✅ "First, analyze the codebase structure. Then, plan the
    refactoring. Finally, implement it step by step."

❌ "Refactor everything" (too broad)
```

---

## 🎓 Learning Resources

### Tutorials
1. **MCP Basics**: Read `AI_AGENT_README.md` for AI agent context
2. **Browser Automation**: See agent-browser-mcp examples
3. **SuperAgent**: Check SuperClaude documentation

### Example Use Cases
- Browser testing: `examples/browser-testing.md` (to be created)
- SuperAgent workflows: `examples/superagent-workflows.md` (to be created)

---

## 🤝 Contributing

If you discover useful MCP patterns or create custom servers:

1. Document them in this file
2. Share examples in `/examples`
3. Create guides in `/docs`
4. Update `AI_AGENT_README.md` if relevant

---

## ❓ FAQ

**Q: Do MCP servers cost money?**
A: No, these are open-source tools that run locally.

**Q: Can MCP servers access my files?**
A: Only files in the current repository. They follow Claude Code's permissions.

**Q: Will MCP work offline?**
A: After initial download, yes (except for web-dependent features).

**Q: Can I disable MCP?**
A: Yes, remove or rename `.mcp.json`.

**Q: Are there more MCP servers available?**
A: Yes! See https://github.com/modelcontextprotocol/servers for a list.

---

**Last Updated**: 2026-02-01
**Maintained By**: KaivilleMap Development Team
**Version**: 1.0
