# VSCode Configuration for Flexium

This directory contains Visual Studio Code configuration files optimized for Flexium development.

## Files Overview

### `settings.json`
Project-specific settings that provide:
- Auto-formatting with Prettier on save
- ESLint integration with auto-fix
- TypeScript configuration
- Optimized editor settings for React-style JSX
- File exclusions for better performance

### `extensions.json`
Recommended extensions for Flexium development:
- **Essential:** ESLint, Prettier, Error Lens
- **Productivity:** Path Intellisense, Auto Rename Tag, GitLens
- **Testing:** Vitest Explorer
- **Optional:** Import Cost, TODO Highlight, Better Comments

Install all recommended extensions:
1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type "Extensions: Show Recommended Extensions"
3. Click "Install All"

### `launch.json`
Debugging configurations:
- **Launch Chrome - Examples:** Debug examples in Chrome browser
- **Debug Tests:** Debug Vitest tests
- **Attach to Node:** Attach to running Node process
- **Debug Build:** Debug the build process

To debug:
1. Set breakpoints in your code
2. Press `F5` or select a configuration from the Debug panel
3. Use Debug toolbar to step through code

### `tasks.json`
Common build and test tasks:
- **Build:** Compile TypeScript (`Cmd+Shift+B` / `Ctrl+Shift+B`)
- **Watch Build:** Watch mode for development
- **Test:** Run all tests
- **Lint:** Check code quality
- **Format:** Format all files

Run tasks:
1. Open Command Palette
2. Type "Tasks: Run Task"
3. Select the task you want to run

### `flexium.code-snippets`
Code snippets for common Flexium patterns:
- `fsig` - Create a signal
- `fcomp` - Create a computed signal
- `feff` - Create an effect
- `fcomponent` - Full component boilerplate
- `frow`, `fcol` - Layout components
- `fmotion` - Animation component
- And many more!

To use snippets:
1. Type the prefix (e.g., `fsig`)
2. Press `Tab` to expand
3. Fill in the placeholders

## Customization

### Personal Settings

To override project settings without affecting others:

1. Create `.vscode/settings.local.json` (gitignored)
2. Add your personal preferences:
   ```json
   {
     "editor.fontSize": 14,
     "workbench.colorTheme": "Your Theme"
   }
   ```

### Adding Custom Snippets

To add your own snippets:

1. Edit `.vscode/flexium.code-snippets`
2. Add a new snippet:
   ```json
   {
     "My Custom Snippet": {
       "prefix": "fmy",
       "body": [
         "const ${1:name} = signal(${2:value})"
       ],
       "description": "My custom pattern"
     }
   }
   ```

## Keyboard Shortcuts

### Essential Shortcuts

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| Command Palette | `Cmd+Shift+P` | `Ctrl+Shift+P` |
| Quick Open | `Cmd+P` | `Ctrl+P` |
| Go to Definition | `F12` | `F12` |
| Format Document | `Shift+Option+F` | `Shift+Alt+F` |
| Toggle Terminal | `` Cmd+` `` | `` Ctrl+` `` |
| Start Debugging | `F5` | `F5` |
| Run Build Task | `Cmd+Shift+B` | `Ctrl+Shift+B` |

### Custom Keybindings

To add custom keybindings:
1. Open Command Palette
2. Type "Preferences: Open Keyboard Shortcuts"
3. Search for the command and add your binding

## Troubleshooting

### Extensions Not Working

1. Reload VSCode: `Cmd+Shift+P` > "Developer: Reload Window"
2. Check extension is enabled: Extensions panel
3. Check for conflicts in settings

### Formatting Not Working

1. Ensure Prettier extension is installed
2. Check `.prettierrc` file exists in project root
3. Verify `editor.defaultFormatter` is set to Prettier
4. Try manual format: `Shift+Option+F` / `Shift+Alt+F`

### TypeScript Errors

1. Restart TS Server: `Cmd+Shift+P` > "TypeScript: Restart TS Server"
2. Check `tsconfig.json` is properly configured
3. Ensure project is built: `npm run build`

### Debugger Not Connecting

1. Ensure HTTP server is running (for browser debugging)
2. Check port matches in `launch.json`
3. Clear browser cache
4. Check source maps are generated

## Tips & Tricks

### Multi-Cursor Editing
- `Cmd+D` / `Ctrl+D` - Select next occurrence
- `Cmd+Shift+L` / `Ctrl+Shift+L` - Select all occurrences
- `Option+Click` / `Alt+Click` - Add cursor

### Code Navigation
- `Cmd+Shift+O` / `Ctrl+Shift+O` - Go to symbol in file
- `Cmd+T` / `Ctrl+T` - Go to symbol in workspace
- `Cmd+Shift+F` / `Ctrl+Shift+F` - Find in files

### Refactoring
- `F2` - Rename symbol
- Right-click > "Refactor..." - Various refactoring options
- `Cmd+.` / `Ctrl+.` - Quick fix

## Additional Resources

- [VSCode Documentation](https://code.visualstudio.com/docs)
- [TypeScript in VSCode](https://code.visualstudio.com/docs/languages/typescript)
- [Debugging in VSCode](https://code.visualstudio.com/docs/editor/debugging)
- [Flexium IDE Setup Guide](../docs/IDE_SETUP.md)

## Contributing

Found a useful setting or extension? Please contribute by:
1. Adding it to the appropriate config file
2. Documenting it here
3. Submitting a PR

Your fellow developers will thank you!
