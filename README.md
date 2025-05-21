# AI Code Reviewer

A sophisticated code analysis tool leveraging Google's Gemini AI for comprehensive code reviews.

## Features
- Multi-language support (JavaScript, Python, Java, etc)
- Security vulnerability detection
- Performance optimization suggestions
- Code style & best practice analysis
- Interactive code improvement suggestions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Gemini API key ([obtain here](https://ai.google.dev/))

### Installation
1. Clone repository:
   ```bash
   git clone https://github.com/Sandipan2005/ai-code-reviewer.git
   cd ai-code-reviewer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   ```bash
   echo "GEMINI_API_KEY=your_actual_key_here" > .env.local
   ```

### Local Development
```bash
npm run dev
```

## 🔧 Configuration
| Environment Variable | Description |
|----------------------|-------------|
| GEMINI_API_KEY | Required Gemini API key |

## 🛠️ Build for Production
```bash
npm run build
```

## 🌐 Deployment
Host the `dist/` folder on:
- Vercel
- Netlify
- Firebase Hosting
- Any static hosting service

## 🐛 Troubleshooting
| Error | Solution |
|-------|----------|
| Missing API Key | Verify .env.local exists in root |
| Network Errors | Check internet connection |
| JSON Parsing Errors | Try smaller code snippets |

## 🤝 Contributing
1. Fork the project
2. Create your feature branch
3. Commit changes
4. Push to branch
5. Open PR

## 📄 License
MIT © Sandipan Majumder
