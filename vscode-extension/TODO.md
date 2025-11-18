# VS Code Extension TODOs

## Before Publishing

- [ ] Convert `media/icon.svg` to `media/icon.png` (128x128 PNG)
  - Use: `convert media/icon.svg -resize 128x128 media/icon.png`
  - Or use online tool: https://cloudconvert.com/svg-to-png
  - Then add `"icon": "media/icon.png"` back to package.json

- [ ] Add real screenshots to README.md
  - IntelliSense demo
  - Hover tooltip demo
  - Sidebar demo
  - Status bar demo

- [ ] Test on Windows
- [ ] Test on Linux
- [ ] Test on macOS

## Nice to Have

- [ ] Add automated tests
- [ ] Add secret templates feature
- [ ] Add bulk operations
- [ ] Add search/filter for secrets
- [ ] Add inline decorations for environment variables
- [ ] Add CodeLens for quick actions
- [ ] Add workspace-level settings sync
