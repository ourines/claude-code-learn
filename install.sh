#!/bin/sh
# claude-code-learn installer
# Works on macOS, Linux, and Git Bash on Windows.

set -e

PLUGIN_NAME="claude-code-learn"
PLUGIN_DIR="$HOME/.claude/plugins/$PLUGIN_NAME"
LEARNINGS_DIR="$HOME/.claude/learnings"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Installing $PLUGIN_NAME..."

# 1. Create learnings directory
mkdir -p "$LEARNINGS_DIR"
echo "  Created $LEARNINGS_DIR"

# 2. Symlink plugin to ~/.claude/plugins/
if [ -d "$PLUGIN_DIR" ] || [ -L "$PLUGIN_DIR" ]; then
    echo "  Plugin directory already exists, removing old link..."
    rm -rf "$PLUGIN_DIR"
fi

ln -s "$SCRIPT_DIR" "$PLUGIN_DIR"
echo "  Linked $SCRIPT_DIR -> $PLUGIN_DIR"

echo ""
echo "Installation complete!"
echo ""
echo "Enable the plugin:"
echo "  claude --plugin-dir $SCRIPT_DIR"
echo ""
echo "Available skills:"
echo "  /claude-code-learn:learn <topic>    - Research and save knowledge"
echo "  /claude-code-learn:recall <topic>   - Retrieve saved knowledge"
echo "  /claude-code-learn:forget <topic>   - Remove saved knowledge"
echo ""
echo "Bundled MCP servers (auto-configured via .mcp.json):"
echo "  memory - Knowledge graph for entity tracking"
echo ""
echo "Hooks are auto-registered via hooks/hooks.json."
echo "Knowledge is stored in: $LEARNINGS_DIR"
