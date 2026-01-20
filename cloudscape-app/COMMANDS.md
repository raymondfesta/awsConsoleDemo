# Command Reference

## 🚀 Development Commands

### Start Development Server
```bash
npm run dev
```
- Starts Vite dev server
- Opens at `http://localhost:5173`
- Hot module replacement enabled
- Fast refresh on file changes

### Build for Production
```bash
npm run build
```
- Compiles TypeScript
- Bundles with Vite
- Optimizes for production
- Output in `dist/` folder

### Preview Production Build
```bash
npm run preview
```
- Serves production build locally
- Test before deployment
- Opens at `http://localhost:4173`

### Type Check
```bash
npm run type-check
```
- Runs TypeScript compiler
- Checks for type errors
- No output files generated

### Lint Code
```bash
npm run lint
```
- Runs ESLint
- Checks code quality
- Reports warnings and errors

---

## 📦 Installation Commands

### Install Dependencies
```bash
npm install
```
- Installs all packages
- Creates node_modules/
- Updates package-lock.json

### Clean Install
```bash
rm -rf node_modules package-lock.json
npm install
```
- Fresh installation
- Resolves dependency issues

---

## 🧹 Cleanup Commands

### Remove Build Artifacts
```bash
rm -rf dist/
```

### Remove Dependencies
```bash
rm -rf node_modules/
```

### Full Clean
```bash
rm -rf node_modules/ dist/ package-lock.json
npm install
```

---

## 🔍 Inspection Commands

### View Project Structure
```bash
tree -I 'node_modules|dist' -L 3
```

### Count Lines of Code
```bash
find src -name '*.tsx' -o -name '*.ts' | xargs wc -l
```

### Check Bundle Size
```bash
npm run build
ls -lh dist/assets/
```

---

## 🧪 Testing Commands

### Run Dev Server (Background)
```bash
npm run dev &
```

### Kill Dev Server
```bash
pkill -f vite
```

### Check Port Usage
```bash
lsof -i :5173
```

---

## 📊 Analysis Commands

### Analyze Dependencies
```bash
npm list --depth=0
```

### Check for Updates
```bash
npm outdated
```

### Security Audit
```bash
npm audit
```

---

## 🚢 Deployment Commands

### Build and Preview
```bash
npm run build && npm run preview
```

### Deploy to AWS Amplify
```bash
npm run build
# Upload dist/ folder to Amplify
```

### Deploy to Vercel
```bash
npm run build
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## 🛠️ Development Workflow

### Standard Workflow
```bash
# 1. Start development
npm run dev

# 2. Make changes (auto-reloads)

# 3. Type check
npm run type-check

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

### Quick Test Workflow
```bash
# One-liner to test everything
npm run type-check && npm run build && npm run preview
```

---

## 📝 Git Commands (Optional)

### Initialize Git
```bash
git init
git add .
git commit -m "Initial commit: CloudScape React App"
```

### Create Repository
```bash
git remote add origin <your-repo-url>
git push -u origin main
```

---

## 🔧 Troubleshooting Commands

### Clear Vite Cache
```bash
rm -rf node_modules/.vite
```

### Reinstall Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Check Node Version
```bash
node --version
npm --version
```

### Fix Permissions
```bash
sudo chown -R $USER:$USER node_modules
```

---

## 📱 Quick Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run type-check` | Check TypeScript |
| `npm run lint` | Lint code |

---

## 🎯 Most Used Commands

```bash
# Development
npm run dev

# Production
npm run build

# Testing
npm run type-check && npm run build
```

---

## 💡 Pro Tips

### Watch Mode
```bash
# Dev server already has watch mode
npm run dev
```

### Multiple Terminals
```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Type checking
npm run type-check -- --watch
```

### Environment Variables
```bash
# Create .env file
echo "VITE_API_URL=https://api.example.com" > .env

# Access in code
import.meta.env.VITE_API_URL
```

---

## 🚀 Ready to Start?

```bash
cd /Users/festar/Desktop/UDE-V1/cloudscape-app
npm run dev
```

Open `http://localhost:5173` and start building! 🎉
