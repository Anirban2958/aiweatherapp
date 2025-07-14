# 🔧 Environment Configuration Guide

Complete guide for setting up API keys and configuring your AI Weather App for different environments.

## 🎯 Overview

This app requires two API keys to function:
1. **OpenWeatherMap API** - For weather data
2. **Google Gemini AI API** - For AI chatbot functionality

## 📋 Required API Keys

### 1. OpenWeatherMap API Key

#### What it provides:
- Current weather conditions
- 5-day weather forecasts
- Air quality index data
- Weather maps and radar
- Historical weather data

#### How to get it:
1. **Visit**: [OpenWeatherMap API](https://openweathermap.org/api)
2. **Sign Up**: Click "Sign Up" for a free account
3. **Verify Email**: Check your inbox and verify your account
4. **Access Dashboard**: Go to your user dashboard
5. **Get API Key**: 
   - Navigate to "API Keys" section
   - Your default API key will be shown
   - Copy the key (format: `abc123def456...`)

#### Free Tier Limits:
- **1,000 calls/day** (plenty for personal use)
- **60 calls/minute**
- Access to current weather and 5-day forecast
- No credit card required

#### API Key Format:
```
32-character alphanumeric string
Example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 2. Google Gemini AI API Key

#### What it provides:
- AI-powered weather insights
- Natural language weather queries
- Clothing recommendations
- Activity suggestions
- Conversational weather assistance

#### How to get it:
1. **Visit**: [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Sign In**: Use your Google account
3. **Create Key**: Click "Create API Key"
4. **Select Project**: Choose existing project or create new one
5. **Copy Key**: Save the generated API key

#### Free Tier Limits:
- **15 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**
- No credit card required initially

#### API Key Format:
```
Starts with "AIza" followed by 35 characters
Example: AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

## 🛠️ Configuration Methods

### Method 1: Direct Code Edit (Development)

**Best for**: Local development, personal use, learning

1. **Open** `script_enhanced_final.js` in your text editor
2. **Locate the API configuration section** (around lines 30-41):
   ```javascript
   // ===== API CONFIGURATION =====
   const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
   const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
   ```

3. **Replace placeholders** with your actual keys:
   ```javascript
   // ===== API CONFIGURATION =====
   const API_KEY = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
   const GEMINI_API_KEY = 'AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567';
   ```

4. **Save the file**

⚠️ **Security Note**: Never commit actual API keys to public repositories!

### Method 2: Environment Variables (Production)

**Best for**: Production deployments, team projects, CI/CD

#### For Node.js/Server environments:
1. **Create `.env` file** (not included in Git):
   ```bash
   OPENWEATHER_API_KEY=your_openweathermap_key_here
   GEMINI_API_KEY=your_gemini_key_here
   ```

2. **Modify JavaScript** to read from environment:
   ```javascript
   const API_KEY = process.env.OPENWEATHER_API_KEY;
   const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
   ```

#### For hosting platforms:
- **Netlify**: Site settings → Environment variables
- **Vercel**: Project settings → Environment Variables
- **GitHub Pages**: Repository secrets (for GitHub Actions)

### Method 3: Configuration File (Advanced)

**Best for**: Multiple environments, team development

1. **Create `config.js`** (add to .gitignore):
   ```javascript
   // config.js - DO NOT COMMIT THIS FILE
   export const config = {
     openWeatherApiKey: 'your_openweathermap_key_here',
     geminiApiKey: 'your_gemini_key_here',
     environment: 'development'
   };
   ```

2. **Create `config.example.js`** (safe to commit):
   ```javascript
   // config.example.js - Template for configuration
   export const config = {
     openWeatherApiKey: 'YOUR_OPENWEATHERMAP_API_KEY',
     geminiApiKey: 'YOUR_GEMINI_API_KEY',
     environment: 'development'
   };
   ```

3. **Update main JavaScript**:
   ```javascript
   import { config } from './config.js';
   
   const API_KEY = config.openWeatherApiKey;
   const GEMINI_API_KEY = config.geminiApiKey;
   ```

## 🔒 Security Best Practices

### DO ✅
- Use environment variables for production
- Add config files to `.gitignore`
- Rotate API keys regularly (every 3-6 months)
- Monitor API usage for unexpected activity
- Use HTTPS for all production deployments
- Implement rate limiting in your app

### DON'T ❌
- Commit API keys to version control
- Share API keys in plain text
- Use production keys for development
- Expose keys in client-side code (for server-deployed apps)
- Use the same keys across multiple projects

### API Key Security Checklist
- [ ] Keys are not in source code
- [ ] `.env` files are in `.gitignore`
- [ ] Production keys are different from development
- [ ] Regular monitoring of API usage
- [ ] Keys are stored securely on hosting platform

## 🧪 Testing Your Configuration

### Quick Test
1. **Open browser console** (F12 → Console)
2. **Load your app**
3. **Check for errors**:
   ```javascript
   // Should see weather data loading
   console.log('Weather API working:', !!currentWeatherData);
   
   // Should see AI responses
   console.log('AI API working:', typeof GEMINI_API_KEY === 'string');
   ```

### Verification Steps
1. **Weather Data Test**:
   - Allow location access OR search for a city
   - Verify weather information displays
   - Check that forecast loads

2. **AI Chatbot Test**:
   - Open chat interface
   - Send message: "What's the weather like?"
   - Verify AI responds appropriately

3. **Error Checking**:
   - Open browser console (F12)
   - Look for API-related errors
   - Verify no "undefined" or "null" API key messages

## 🌍 Environment-Specific Setup

### Development Environment
```javascript
// For local development
const config = {
  apiKey: 'dev_openweather_key',
  geminiKey: 'dev_gemini_key',
  baseUrl: 'http://localhost:3000',
  debug: true
};
```

### Staging Environment
```javascript
// For testing/staging
const config = {
  apiKey: 'staging_openweather_key',
  geminiKey: 'staging_gemini_key',
  baseUrl: 'https://staging.yourapp.com',
  debug: false
};
```

### Production Environment
```javascript
// For production
const config = {
  apiKey: process.env.OPENWEATHER_API_KEY,
  geminiKey: process.env.GEMINI_API_KEY,
  baseUrl: 'https://yourapp.com',
  debug: false
};
```

## 📊 API Usage Monitoring

### OpenWeatherMap Monitoring
- **Dashboard**: [OpenWeatherMap Dashboard](https://home.openweathermap.org/statistics)
- **View usage**: Calls made, remaining quota
- **Upgrade**: If you need more calls

### Google AI Monitoring
- **Console**: [Google Cloud Console](https://console.cloud.google.com/)
- **Monitor**: API usage and quotas
- **Billing**: Set up alerts for usage limits

### Usage Optimization Tips
- Cache weather data for short periods
- Implement request debouncing
- Use appropriate polling intervals
- Handle API errors gracefully

## 🚨 Troubleshooting

### Common Issues

**❌ "API key invalid" error**
- Verify key is copied correctly (no extra spaces)
- Check if key is activated (can take a few minutes)
- Ensure you're using the correct API endpoint

**❌ "CORS error" in browser**
- For OpenWeatherMap: Should work directly from browser
- For Gemini: May need server-side proxy in some cases
- Ensure you're using HTTPS in production

**❌ "Rate limit exceeded"**
- Check your API usage in dashboards
- Implement caching to reduce calls
- Consider upgrading your API plan

**❌ "Quota exceeded"**
- Monitor daily usage limits
- Implement usage tracking in your app
- Consider multiple API keys for high-traffic apps

### Debug Commands
```javascript
// Check API key configuration
console.log('APIs configured:', {
  weather: API_KEY !== 'YOUR_OPENWEATHERMAP_API_KEY',
  ai: GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY'
});

// Test API connectivity
fetch(`https://api.openweathermap.org/data/2.5/weather?q=London&appid=${API_KEY}`)
  .then(response => console.log('Weather API status:', response.status))
  .catch(error => console.error('Weather API error:', error));
```

## 🔄 API Key Rotation

### When to Rotate
- Every 3-6 months (routine)
- When team member leaves
- If key is accidentally exposed
- Security breach or concern

### Rotation Process
1. **Generate new API key**
2. **Update staging environment**
3. **Test thoroughly**
4. **Update production environment**
5. **Monitor for issues**
6. **Revoke old key**
7. **Update documentation**

## 📞 Getting Help

### Official Support
- **OpenWeatherMap**: [Support Center](https://openweathermap.org/support)
- **Google AI**: [AI Studio Help](https://ai.google.dev/docs)

### Community Resources
- Project GitHub Issues
- Weather API forums
- Google AI developer community
- Stack Overflow (tag with relevant APIs)

## ✅ Configuration Checklist

Before going live:
- [ ] API keys are secured and not in source code
- [ ] Both APIs are tested and working
- [ ] Environment variables are configured
- [ ] Error handling is implemented
- [ ] Usage monitoring is set up
- [ ] Rate limiting is considered
- [ ] HTTPS is enabled for production

Your API configuration is now complete! 🎉

- **Never commit your actual API keys to GitHub**
- Keep your API keys private and secure
- Use environment variables for production deployments
- Regenerate keys if they're accidentally exposed
- Monitor your API usage to detect unauthorized access

## 🧪 Testing Your Setup

After adding your API keys:

1. Open `index.html` in your browser
2. Allow location access or search for a city
3. Verify weather data loads correctly
4. Test the AI chatbot by asking a weather question

If something doesn't work:
- Check the browser console for error messages
- Verify your API keys are correct and active
- Ensure you haven't exceeded API rate limits

## 📞 Need Help?

- Check the [QUICKSTART.md](QUICKSTART.md) guide
- Read the [README.md](README.md) for detailed documentation
- Open an issue on GitHub if you encounter problems
