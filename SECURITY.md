# Security Configuration Guide

## 🔐 API Key Security

### Important Security Notes

⚠️ **NEVER commit API keys to version control!**

Your API keys are sensitive credentials that should be kept private. Follow these guidelines:

### 1. Environment Variables (Recommended)
For production deployments, use environment variables:

```javascript
// In your deployment platform (Netlify, Vercel, etc.)
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
```

### 2. Local Development
For local development, replace the placeholder keys in `script_enhanced_final.js`:

```javascript
// Replace these with your actual API keys
const WEATHER_API_KEY = 'your_actual_openweathermap_key_here';
const GEMINI_API_KEY = 'your_actual_gemini_key_here';
```

### 3. API Key Locations to Update

#### OpenWeatherMap API Key
- File: `script_enhanced_final.js`
- Line: Look for `const WEATHER_API_KEY`
- Get your key: https://openweathermap.org/api

#### Google Gemini AI API Key
- File: `script_enhanced_final.js`
- Line: Look for `const GEMINI_API_KEY`
- Get your key: https://makersuite.google.com/app/apikey

### 4. Before Committing to Git

1. **Check your API keys are not in the code**
2. **Use placeholder values for commits**
3. **Verify .gitignore excludes sensitive files**

### 5. Deployment Security

#### For GitHub Pages:
- Use environment variables in your deployment workflow
- Never store keys in repository secrets for client-side apps

#### For Netlify:
- Set environment variables in Site Settings → Environment Variables
- Use build-time replacement for static sites

#### For Vercel:
- Set environment variables in Project Settings
- Use Vercel's environment variable system

### 6. API Usage Limits

#### OpenWeatherMap Free Tier:
- 1,000 calls/day
- 60 calls/minute
- Monitor usage in your dashboard

#### Google Gemini AI:
- Check current limits in AI Studio
- Monitor usage to avoid overages

### 7. Best Practices

✅ **Do:**
- Use environment variables for production
- Rotate API keys regularly
- Monitor API usage
- Use HTTPS for all requests
- Implement rate limiting in your app

❌ **Don't:**
- Commit API keys to version control
- Share keys in screenshots or logs
- Use keys in client-side code for production
- Ignore usage monitoring

### 8. If You Accidentally Commit Keys

1. **Immediately regenerate** the exposed keys
2. **Update** your application with new keys
3. **Delete** the commit history or repository if necessary
4. **Review** your security practices

### 9. Alternative Security Approaches

For production applications, consider:
- **Backend proxy**: Create a server to handle API calls
- **Serverless functions**: Use Netlify/Vercel functions
- **CORS-enabled APIs**: Some APIs allow domain restrictions

---

Remember: Client-side applications (like this one) expose code to users. For production use with sensitive data, consider implementing a backend service.
