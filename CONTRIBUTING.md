# 🤝 Contributing to AI Weather App

Thank you for your interest in contributing to the AI Weather App! This document provides guidelines and information for contributors.

## 🎯 Ways to Contribute

### 🐛 Bug Reports
- Use the [GitHub Issues](https://github.com/Anirban2958/aiweatherapp/issues) page
- Search existing issues before creating new ones
- Provide detailed steps to reproduce
- Include browser/device information
- Add screenshots if applicable

### 💡 Feature Requests
- Check existing issues for similar requests
- Clearly describe the feature and its benefits
- Provide use cases and examples
- Consider the scope and complexity

### 🔧 Code Contributions
- Fork the repository
- Create a feature branch
- Follow coding standards
- Add appropriate comments
- Test your changes thoroughly
- Submit a pull request

## 🛠️ Development Setup

### Prerequisites
- Modern web browser
- Text editor/IDE (VS Code recommended)
- Basic knowledge of HTML, CSS, JavaScript
- Git for version control

### Local Development
1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/aiweatherapp.git
   cd aiweatherapp
   ```

2. **Set Up API Keys**
   - Follow the [Environment Setup Guide](ENVIRONMENT_SETUP.md)
   - Add your API keys to `script_enhanced_final.js`

3. **Start Development**
   - Open `index.html` in your browser
   - Make changes and refresh to test
   - Use browser developer tools for debugging

## 📝 Coding Standards

### JavaScript
- Use ES6+ features when appropriate
- Follow camelCase naming convention
- Add JSDoc comments for functions
- Use meaningful variable names
- Handle errors gracefully

```javascript
/**
 * Fetches weather data for a given city
 * @param {string} cityName - Name of the city
 * @returns {Promise<Object>} Weather data object
 */
async function getWeatherData(cityName) {
  // Implementation
}
```

### CSS
- Use BEM methodology for class naming
- Group related properties together
- Add comments for complex styles
- Use CSS custom properties for consistent theming

```css
/* Weather card component */
.weather-card {
  /* Layout */
  display: flex;
  padding: var(--spacing-lg);
  
  /* Appearance */
  background: var(--glass-bg);
  border-radius: var(--border-radius);
}
```

### HTML
- Use semantic HTML elements
- Add proper ARIA labels for accessibility
- Include alt text for images
- Use meaningful class and ID names

## 🔄 Pull Request Process

### Before Submitting
- [ ] Code follows project standards
- [ ] Changes are tested in multiple browsers
- [ ] Documentation is updated if needed
- [ ] No console errors or warnings
- [ ] API keys are not committed

### PR Guidelines
1. **Create a descriptive title**
   - ✅ "Add dark mode toggle functionality"
   - ❌ "Fix stuff"

2. **Provide detailed description**
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Screenshots if UI changes

3. **Reference related issues**
   - Use "Fixes #123" or "Closes #123"
   - Link to relevant discussions

### Review Process
- Maintainers will review within 48 hours
- Address feedback promptly
- Be open to suggestions and changes
- Update documentation if requested

## 🧪 Testing Guidelines

### Manual Testing
- Test in Chrome, Firefox, Safari, Edge
- Test on mobile devices
- Test with different screen sizes
- Verify all features work correctly
- Check for console errors

### Accessibility Testing
- Use keyboard navigation
- Test with screen readers
- Verify color contrast
- Check ARIA labels

## 📋 Issue Templates

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Browser: [e.g., Chrome 91]
- OS: [e.g., Windows 10]
- Device: [e.g., Desktop]
```

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Screenshots, mockups, etc.
```

## 🏷️ Labels and Milestones

### Issue Labels
- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - Critical issues
- `ui/ux` - User interface/experience

## 🎖️ Recognition

Contributors will be:
- Listed in the README contributors section
- Mentioned in release notes for significant contributions
- Invited to join the maintainers team for outstanding contributions

## ❓ Questions?

- Check existing [Issues](https://github.com/Anirban2958/aiweatherapp/issues)
- Read the [README](README.md) and [Documentation](QUICKSTART.md)
- Contact maintainers through GitHub

## 📜 Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Expected Behavior
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior
- Harassment of any kind
- Discriminatory language or actions
- Personal attacks or insults
- Public or private harassment
- Publishing others' private information

Thank you for contributing to the AI Weather App! 🌤️