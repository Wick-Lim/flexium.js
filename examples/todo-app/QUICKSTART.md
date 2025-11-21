# Todo App - Quick Start Guide

Get the Flexium Todo App running in 30 seconds!

## 🚀 Option 1: Direct Open (Easiest)

Simply open the file in your browser:

```bash
# macOS
open examples/todo-app/index.html

# Linux
xdg-open examples/todo-app/index.html

# Windows
start examples/todo-app/index.html
```

## 🌐 Option 2: Local Server (Recommended)

For a better experience with browser DevTools:

```bash
# Using Python (usually pre-installed)
cd examples/todo-app
python3 -m http.server 8080
# Visit http://localhost:8080

# Using Node.js serve
npx serve examples/todo-app
# Visit URL shown in terminal

# Using PHP (if installed)
cd examples/todo-app
php -S localhost:8080
# Visit http://localhost:8080
```

## ✅ That's It!

No installation, no build step, no dependencies. Just open and run!

## 🎯 What to Try

1. **Add a todo** - Fill in the form and click "Add Task"
2. **Toggle completion** - Check/uncheck todos
3. **Try filters** - Click status and category filters
4. **Search** - Type in the search box
5. **Refresh page** - See todos persist from localStorage
6. **Resize window** - Check responsive design
7. **Open console** - See reactive updates logged

## 📖 Learn More

- Read `README.md` for full feature documentation
- Read `FEATURES_DEMONSTRATED.md` for detailed technical breakdown
- Read `ISSUES_AND_LIMITATIONS.md` for honest assessment

## 🐛 Troubleshooting

**Problem**: Todos don't persist after refresh
**Solution**: Check browser's localStorage is enabled (not in private mode)

**Problem**: Styles look broken
**Solution**: Ensure you're viewing via `file://` or `http://`, not raw file

**Problem**: Want to modify the code
**Solution**: Edit `index.html` directly - all code is in one file!

## 💡 Pro Tips

- Open browser DevTools console to see reactive updates
- Try the app on mobile for responsive design
- Add lots of todos to test performance
- Check the Network tab - no external dependencies!

Enjoy exploring Flexium! 🎉
