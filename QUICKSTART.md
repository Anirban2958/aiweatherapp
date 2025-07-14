# 🚀 Quick Setup Guide

Get your AI Weather App running in 5 minutes!

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Text editor (VS Code, Sublime, etc.)

## ⚡ Quick Start

### Step 1: Get API Keys (Free)

#### OpenWeatherMap API Key
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Click "Sign Up" for a free account
3. Verify your email
4. Go to "API Keys" section
5. Copy your API key

#### Google Gemini AI API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy your API key

### Step 2: Configure the App

1. **Open** `script_enhanced_final.js` in your text editor
2. **Find line 11** and **replace**:
   ```javascript
   const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
   ```
   **With**:
   ```javascript
   const API_KEY = 'your_actual_api_key_here';
   ```

3. **Find line 20** and **replace**:
   ```javascript
   const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
   ```
   **With**:
   ```javascript
   const GEMINI_API_KEY = 'your_actual_gemini_key_here';
   ```

4. **Save** the file

### Step 3: Run the App

#### Option A: Double-click
- Simply double-click `index.html`
- Your browser will open the app

#### Option B: Local Server (Recommended)
```bash
# Using Python (if installed)
python -m http.server 8000

# Using Node.js (if installed)
npx serve .

# Then open: http://localhost:8000
```

### Step 4: Test Features

1. **Click "Use My Location"** (allow location access)
2. **Try the search** with any city name
3. **Open the chatbot** (floating button)
4. **Explore forecast** and other features

## 🎉 You're Done!

Your AI Weather App is now running with:
- ✅ Real-time weather data
- ✅ AI-powered chatbot
- ✅ 5-day forecasts
- ✅ Beautiful animations
- ✅ Responsive design

## 🚨 Troubleshooting

### Weather data not loading?
- ✓ Check your OpenWeatherMap API key
- ✓ Make sure you have internet connection
- ✓ Wait a few minutes for API activation (new keys)

### Chatbot not working?
- ✓ Check your Gemini API key
- ✓ Make sure the key has no extra spaces
- ✓ Try refreshing the page

### Location not working?
- ✓ Make sure you're using HTTPS or localhost
- ✓ Allow location permissions in browser
- ✓ Try manual city search instead

## 📚 Next Steps

- 🌐 [Deploy to the web](DEPLOYMENT.md)
- 🤝 [Contribute to the project](CONTRIBUTING.md)
- 🔒 [Learn about security](SECURITY.md)
- 📖 [Read full documentation](README.md)

## 💡 Pro Tips

1. **Bookmark localhost** for easy access during development
2. **Open browser DevTools** (F12) to see any errors
3. **Test on mobile** by accessing your local IP on your phone
4. **Star the repository** if you find it useful!

---

**Need help?** Open an issue on GitHub or check the full README.md
