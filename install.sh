#!/bin/sh
# claude-code-learn installer
# Installs the plugin and configures the SessionStart hook.
# Works on macOS, Linux, and Git Bash on Windows.

set -e

PLUGIN_NAME="claude-code-learn"
PLUGIN_DIR="$HOME/.claude/plugins/$PLUGIN_NAME"
LEARNINGS_DIR="$HOME/.claude/learnings"
SETTINGS_FILE="$HOME/.claude/settings.json"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Installing $PLUGIN_NAME..."

# 0. Check Node.js is available (required by Claude Code)
if ! command -v node >/dev/null 2>&1; then
    echo "  ERROR: Node.js is required but not found."
    echo "  Claude Code requires Node.js — please install it first."
    exit 1
fi

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

# 3. Configure SessionStart hook in settings.json
HOOK_CMD="node $PLUGIN_DIR/hooks/session-start.js"

if [ -f "$SETTINGS_FILE" ]; then
    if grep -q "session-start.js" "$SETTINGS_FILE" 2>/dev/null; then
        echo "  SessionStart hook already configured in settings.json"
    else
        echo ""
        echo "  Add the following hook to your $SETTINGS_FILE under hooks.SessionStart:"
        echo ""
        echo '    {'
        echo '      "type": "command",'
        echo "      \"command\": \"$HOOK_CMD\","
        echo '      "timeout": 5'
        echo '    }'
        echo ""
        echo "  Or merge it into your existing SessionStart hooks array."
    fi
else
    echo "  No settings.json found. Creating minimal config..."
    cat > "$SETTINGS_FILE" << EOF
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$HOOK_CMD",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
EOF
    echo "  Created $SETTINGS_FILE with SessionStart hook"
fi

echo ""
echo "Installation complete!"
echo ""
echo "Commands available:"
echo "  /learn <topic>   - Research and save knowledge"
echo "  /recall <topic>  - Retrieve saved knowledge"
echo "  /forget <topic>  - Delete saved knowledge"
echo ""
echo "Knowledge is stored in: $LEARNINGS_DIR"
echo ""
echo "Restart Claude Code to activate the plugin."
