/**
 * ===== WEATHER APP - ENHANCED FINAL VERSION =====
 * 
 * A comprehensive weather application featuring:
 * - Real-time weather data from OpenWeatherMap API
 * - AI-powered chatbot using Google Gemini API
 * - 5-day forecast with interactive charts
 * - Weather-based activity suggestions
 * - Smart clothing recommendations
 * - Air quality and pollen information
 * - Interactive weather maps with multiple overlays
 * - Animated backgrounds based on weather conditions
 * - Favorites management with CRUD operations
 * - Modern glassmorphism UI with smooth animations
 * 
 * @author Weather App Team
 * @version 2.0.0
 * @date 2025
 */

// ===== API CONFIGURATION =====

/**
 * OpenWeatherMap API Configuration
 * Used for fetching current weather data and 5-day forecasts
 * 
 * ⚠️ IMPORTANT: Replace 'YOUR_OPENWEATHERMAP_API_KEY' with your actual API key
 * Get your free API key from: https://openweathermap.org/api
 */
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'; // Current weather endpoint
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'; // 5-day forecast endpoint

/**
 * Google Gemini AI API Configuration
 * Powers the intelligent chatbot for weather-related conversations
 * 
 * ⚠️ IMPORTANT: Replace 'YOUR_GEMINI_API_KEY' with your actual API key
 * Get your free API key from: https://makersuite.google.com/app/apikey
 */
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // Replace with your Gemini API key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// ===== GLOBAL STATE VARIABLES =====

/**
 * Application state management variables
 * Store current data and UI states for the entire app
 */
let currentWeatherData = null;    // Current weather information from API
let currentForecastData = null;   // 5-day forecast data from API
let weatherMap = null;            // Leaflet map instance for weather visualization
let temperatureChart = null;      // Chart.js instance for temperature trends
let humidityChart = null;         // Chart.js instance for humidity/pressure data
let isMetric = true;              // Temperature unit preference (Celsius/Fahrenheit)

// ===== DOM ELEMENT REFERENCES =====

/**
 * Core UI control elements
 * Main buttons and input fields for user interaction
 */
const getLocationBtn = document.getElementById('getLocationBtn');  // GPS location button
const searchBtn = document.getElementById('searchBtn');            // Search trigger button
const cityInput = document.getElementById('cityInput');            // City search input field
const loading = document.getElementById('loading');                // Loading spinner container
const error = document.getElementById('error');                    // Error message container
const weatherCard = document.getElementById('weatherCard');        // Main weather display card

/**
 * Weather data display elements
 * DOM elements that show specific weather information
 */
const cityName = document.getElementById('cityName');          // City name display
const country = document.getElementById('country');            // Country name display
const weatherEmoji = document.getElementById('weatherEmoji');  // Weather condition emoji
const temperature = document.getElementById('temperature');    // Main temperature value
const feelsLike = document.getElementById('feelsLike');        // "Feels like" temperature
const description = document.getElementById('description');    // Weather description text
const windSpeed = document.getElementById('windSpeed');        // Wind speed value
const humidity = document.getElementById('humidity');          // Humidity percentage
const visibility = document.getElementById('visibility');      // Visibility distance
const pressure = document.getElementById('pressure');          // Atmospheric pressure
const sunrise = document.getElementById('sunrise');            // Sunrise time
const sunset = document.getElementById('sunset');              // Sunset time
const lastUpdated = document.getElementById('lastUpdated');    // Last update timestamp

// ===== WEATHER EMOJI MAPPING =====

/**
 * Maps OpenWeatherMap icon codes to emoji representations
 * Provides visual weather indicators for better UX
 * 
 * Icon codes format: [condition][time]
 * - Conditions: 01=clear, 02=few clouds, 03=scattered clouds, etc.
 * - Time: d=day, n=night
 */
const weatherEmojis = {
    '01d': '☀️',    // Clear sky - day
    '01n': '🌙',    // Clear sky - night
    '02d': '⛅',    // Few clouds - day
    '02n': '☁️',    // Few clouds - night
    '03d': '☁️',    // Scattered clouds - day
    '03n': '☁️',    // Scattered clouds - night
    '04d': '☁️',    // Broken clouds - day
    '04n': '☁️',    // Broken clouds - night
    '09d': '🌦️',   // Shower rain - day
    '09n': '🌦️',   // Shower rain - night
    '10d': '🌧️',   // Rain - day
    '10n': '🌧️',   // Rain - night
    '11d': '⛈️',   // Thunderstorm - day
    '11n': '⛈️',   // Thunderstorm - night
    '13d': '❄️',   // Snow - day
    '13n': '❄️',   // Snow - night
    '50d': '🌫️',   // Mist/fog - day
    '50n': '🌫️'    // Mist/fog - night
};

// ===== WEATHER ALERT CONFIGURATION =====

/**
 * Weather severity levels for alert system
 * Categorizes weather conditions by potential impact on users
 * Used to trigger appropriate warning messages and safety recommendations
 */
const WEATHER_ALERTS = {
    extreme: ['tornado', 'hurricane', 'blizzard'],        // Life-threatening conditions
    severe: ['thunderstorm', 'heavy rain', 'snow'],       // Potentially dangerous conditions
    moderate: ['light rain', 'cloudy', 'fog']             // Minor inconvenience conditions
};

// ===== EVENT LISTENERS SETUP =====

/**
 * Primary user interaction event listeners
 * Handle user input and trigger weather data fetching
 */
getLocationBtn.addEventListener('click', getCurrentLocationWeather);  // GPS location request
searchBtn.addEventListener('click', searchWeather);                   // Manual city search
cityInput.addEventListener('keypress', (e) => {
    // Allow Enter key to trigger search for better UX
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// ===== APPLICATION INITIALIZATION =====

/**
 * Initialize the application when DOM is fully loaded
 * Sets up the weather map and attempts to get user's current location
 */
document.addEventListener('DOMContentLoaded', () => {
    // Auto-detect user location if geolocation is available
    if (navigator.geolocation) {
        getCurrentLocationWeather();
    }
    // Initialize the interactive weather map component
    initializeMap();
});

// ===== CORE WEATHER FUNCTIONS =====

/**
 * Get weather data using browser's geolocation API
 * Requests user permission and fetches weather for current coordinates
 * Provides the most accurate local weather information
 */
function getCurrentLocationWeather() {
    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by this browser.');
        return;
    }

    showLoading();
    
    // Request current position from browser's geolocation API
    navigator.geolocation.getCurrentPosition(
        // Success callback: got user's coordinates
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoords(lat, lon);  // Fetch weather for these coordinates
        },
        // Error callback: handle various geolocation failures
        (error) => {
            hideLoading();
            // Provide specific error messages based on failure type
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    showError('Location access denied. Please enter a city name manually.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    showError('Location information is unavailable.');
                    break;
                case error.TIMEOUT:
                    showError('Location request timed out.');
                    break;
                default:
                    showError('An unknown error occurred while retrieving location.');
                    break;
            }
        }
    );
}

/**
 * Search weather by city name
 * Validates user input and triggers API call for specified city
 * Provides manual weather lookup functionality
 */
function searchWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name.');
        return;
    }

    showLoading();
    fetchWeatherByCity(city);  // Fetch weather data for entered city
}

/**
 * Fetch weather data using geographical coordinates
 * Makes parallel API calls for current weather and 5-day forecast
 * Updates all weather displays and map visualization
 * 
 * @param {number} lat - Latitude coordinate
 * @param {number} lon - Longitude coordinate
 */
async function fetchWeatherByCoords(lat, lon) {
    try {
        // Fetch both current weather and forecast data simultaneously for efficiency
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
            fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        ]);
        
        // Check if both API requests were successful
        if (!weatherResponse.ok || !forecastResponse.ok) {
            throw new Error('Weather data not found');
        }
        
        // Parse JSON responses
        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();
        
        // Store data globally for use by other features
        currentWeatherData = weatherData;
        currentForecastData = forecastData;
        
        // Update all UI components with new data
        displayWeather(weatherData);              // Update main weather display
        updateAnimatedBackground(weatherData);    // Change background animation
        updateMapLocation(lat, lon);              // Center map on location
        hideLoading();                            // Hide loading spinner
    } catch (err) {
        hideLoading();
        showError('Failed to fetch weather data. Please try again.');
    }
}

/**
 * Fetch weather data using city name
 * Makes parallel API calls for current weather and 5-day forecast
 * Updates all weather displays upon successful data retrieval
 * 
 * @param {string} city - City name to search for
 */
async function fetchWeatherByCity(city) {
    try {
        // Fetch both current weather and forecast data for the specified city
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`),
            fetch(`${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`)
        ]);
        
        // Verify both API calls were successful
        if (!weatherResponse.ok || !forecastResponse.ok) {
            throw new Error('City not found');
        }
        
        // Parse JSON responses from APIs
        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();
        
        // Store data globally for access by other features
        currentWeatherData = weatherData;
        currentForecastData = forecastData;
        
        // Update all UI components with new weather data
        displayWeather(weatherData);                                           // Main weather display
        updateAnimatedBackground(weatherData);                                 // Background animations
        updateMapLocation(weatherData.coord.lat, weatherData.coord.lon);       // Center map on city
        hideLoading();                                                         // Hide loading spinner
    } catch (err) {
        hideLoading();
        showError('City not found. Please check the spelling and try again.');
    }
}

// ===== WEATHER DISPLAY FUNCTIONS =====

/**
 * Main weather display function
 * Populates the weather card with comprehensive weather information
 * Updates all UI elements with current weather data from API
 * 
 * @param {Object} data - Weather data object from OpenWeatherMap API
 */
function displayWeather(data) {
    hideError();                    // Clear any existing error messages
    checkWeatherAlerts(data);       // Check for severe weather conditions
    
    // === LOCATION INFORMATION ===
    // Display city name and country code
    cityName.textContent = data.name;
    country.textContent = data.sys.country;
    
    // === WEATHER ICON ===
    // Get weather icon code and map to appropriate emoji
    const iconCode = data.weather[0].icon;
    weatherEmoji.textContent = weatherEmojis[iconCode] || '🌤️';  // Fallback to default icon
    
    // === TEMPERATURE INFORMATION ===
    // Display main temperature and "feels like" temperature (rounded to whole numbers)
    temperature.textContent = Math.round(data.main.temp);
    feelsLike.textContent = Math.round(data.main.feels_like);
    description.textContent = data.weather[0].description;  // Weather condition description
    
    // === DETAILED WEATHER METRICS ===
    // Wind speed in meters per second
    windSpeed.textContent = `${data.wind.speed} m/s`;
    // Humidity as percentage
    humidity.textContent = `${data.main.humidity}%`;
    // Visibility converted from meters to kilometers with one decimal place
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    // Atmospheric pressure in hectopascals
    pressure.textContent = `${data.main.pressure} hPa`;
    
    // === SUN TIMES ===
    // Sunrise and sunset times formatted for local timezone
    sunrise.textContent = formatTime(data.sys.sunrise);
    sunset.textContent = formatTime(data.sys.sunset);
    
    // === UPDATE TIMESTAMP ===
    // Show when the data was last refreshed
    lastUpdated.textContent = new Date().toLocaleString();
    
    // === UI STATE UPDATES ===
    // Make weather card visible and clear search input
    weatherCard.classList.remove('hidden');
    cityInput.value = '';
    
    // === ENHANCED FEATURES ===
    // Apply additional modern UI enhancements and background updates
    enhancedDisplayWeather(data);    // Progress bars, animations, time updates
    updateBackgroundByWeather(data); // Dynamic background based on weather conditions
}

// ===== ADVANCED WEATHER FEATURES =====

// ===== FEATURE 1: 5-DAY FORECAST =====

/**
 * Toggle visibility of the 5-day forecast section
 * Loads and displays forecast data if not already shown
 * Manages active tab state for navigation
 */
function toggleForecast() {
    const forecastSection = document.getElementById('forecastSection');
    if (forecastSection.classList.contains('hidden')) {
        // Show forecast section if forecast data is available
        if (currentForecastData) {
            displayForecast(currentForecastData);       // Generate forecast cards
            forecastSection.classList.remove('hidden'); // Make section visible
        } else {
            showError('No forecast data available. Please search for a location first.');
        }
    } else {
        forecastSection.classList.add('hidden');         // Hide if already shown
    }
}

/**
 * Display 5-day weather forecast in card format
 * Processes forecast data and creates visual cards for each day
 * Groups API data by day and selects midday forecasts for accuracy
 * 
 * @param {Object} forecastData - 5-day forecast data from OpenWeatherMap API
 */
function displayForecast(forecastData) {
    const container = document.getElementById('forecastContainer');
    container.innerHTML = '';  // Clear existing forecast cards
    
    // === FORECAST DATA PROCESSING ===
    // Group forecast data by day (API provides 3-hour intervals)
    const dailyForecasts = {};
    
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);  // Convert Unix timestamp to Date
        const dateKey = date.toDateString();    // Use date string as unique key
        
        // Select the forecast closest to noon (12:00) for most representative daily weather
        // This avoids extreme morning/evening temperatures and gives better daily overview
        if (!dailyForecasts[dateKey] || 
            Math.abs(date.getHours() - 12) < Math.abs(new Date(dailyForecasts[dateKey].dt * 1000).getHours() - 12)) {
            dailyForecasts[dateKey] = item;
        }
    });
    
    // === FORECAST CARD GENERATION ===
    // Display first 5 days only (limit for optimal UI display)
    Object.values(dailyForecasts).slice(0, 5).forEach(forecast => {
        const card = createForecastCard(forecast);  // Create individual forecast card
        container.appendChild(card);                 // Add to forecast container
    });
}

/**
 * Create individual forecast card element
 * Generates HTML structure for a single day's weather forecast
 * Formats date, temperature, and weather conditions for display
 * 
 * @param {Object} forecast - Single day forecast data from API
 * @returns {HTMLElement} - Formatted forecast card element
 */
function createForecastCard(forecast) {
    const date = new Date(forecast.dt * 1000);  // Convert Unix timestamp to Date object
    const card = document.createElement('div');
    card.className = 'forecast-card';           // Apply CSS styling class
    
    // Generate card HTML with formatted forecast data
    card.innerHTML = `
        <div class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
        <div class="forecast-icon">${weatherEmojis[forecast.weather[0].icon] || '🌤️'}</div>
        <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
        <div class="forecast-desc">${forecast.weather[0].description}</div>
    `;
    
    return card;
}

// ===== FEATURE 2: INTERACTIVE WEATHER CHARTS =====

/**
 * Toggle visibility of weather analytics charts section
 * Creates interactive charts using Chart.js library
 * Shows temperature trends and humidity/pressure data
 */
function toggleCharts() {
    const chartsSection = document.getElementById('chartsSection');
    if (chartsSection.classList.contains('hidden')) {
        // Generate charts if forecast data is available
        if (currentForecastData) {
            createWeatherCharts(currentForecastData);    // Generate both chart types
            chartsSection.classList.remove('hidden');   // Make charts section visible
        } else {
            showError('No data available for charts. Please search for a location first.');
        }
    } else {
        chartsSection.classList.add('hidden');           // Hide charts section
    }
}

/**
 * Create both temperature and humidity charts
 * Orchestrates the creation of all weather visualization charts
 * 
 * @param {Object} forecastData - 5-day forecast data for chart generation
 */
function createWeatherCharts(forecastData) {
    createTemperatureChart(forecastData);  // 24-hour temperature trend line chart
    createHumidityChart(forecastData);     // Humidity and pressure combination chart
}

/**
 * Create 24-hour temperature trend line chart
 * Uses Chart.js to visualize temperature changes over time
 * Shows smooth temperature curve with gradient fill
 * 
 * @param {Object} forecastData - Forecast data containing temperature readings
 */
function createTemperatureChart(forecastData) {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    
    if (temperatureChart) {
        temperatureChart.destroy();
    }
    
    const labels = forecastData.list.slice(0, 8).map(item => {
        return new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });
    
    const temperatures = forecastData.list.slice(0, 8).map(item => Math.round(item.main.temp));
    
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: '#74b9ff',
                backgroundColor: 'rgba(116, 185, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}

function createHumidityChart(forecastData) {
    const ctx = document.getElementById('humidityChart').getContext('2d');
    
    if (humidityChart) {
        humidityChart.destroy();
    }
    
    const labels = forecastData.list.slice(0, 8).map(item => {
        return new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });
    
    const humidity = forecastData.list.slice(0, 8).map(item => item.main.humidity);
    const pressure = forecastData.list.slice(0, 8).map(item => item.main.pressure);
    
    humidityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Humidity (%)',
                data: humidity,
                backgroundColor: 'rgba(116, 185, 255, 0.6)',
                borderColor: '#74b9ff',
                borderWidth: 1,
                yAxisID: 'y'
            }, {
                label: 'Pressure (hPa)',
                data: pressure,
                type: 'line',
                borderColor: '#fd79a8',
                backgroundColor: 'rgba(253, 121, 168, 0.1)',
                borderWidth: 2,
                fill: false,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    max: 100,
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Pressure (hPa)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

// NEW FEATURE 3: Interactive Weather Map
function initializeMap() {
    if (typeof L !== 'undefined') {
        weatherMap = L.map('weatherMap', {
            center: [20, 0],
            zoom: 2,
            zoomControl: true
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: ' OpenStreetMap contributors'
        }).addTo(weatherMap);
    }
}

function toggleMap() {
    const mapSection = document.getElementById('mapSection');
    if (mapSection.classList.contains('hidden')) {
        mapSection.classList.remove('hidden');
        setTimeout(() => {
            if (weatherMap) {
                weatherMap.invalidateSize();
            }
        }, 100);
    } else {
        mapSection.classList.add('hidden');
    }
}

function updateMapLocation(lat, lon) {
    if (weatherMap) {
        weatherMap.setView([lat, lon], 10);
        
        // Clear existing markers
        weatherMap.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                weatherMap.removeLayer(layer);
            }
        });
        
        // Add marker for current location
        L.marker([lat, lon])
            .addTo(weatherMap)
            .bindPopup(`📍 Current Location<br>Lat: ${lat.toFixed(4)}<br>Lon: ${lon.toFixed(4)}`)
            .openPopup();
    }
}

function switchMapLayer(layerType) {
    // Remove active class from all buttons
    document.querySelectorAll('.map-btn').forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    if (weatherMap) {
        // Remove existing weather layers
        weatherMap.eachLayer(layer => {
            if (layer.options && layer.options.isWeatherLayer) {
                weatherMap.removeLayer(layer);
            }
        });
        
        // Add new weather layer based on type
        const weatherLayer = L.tileLayer(
            `https://tile.openweathermap.org/map/${layerType}_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
            {
                attribution: 'Weather data © OpenWeatherMap',
                opacity: 0.6,
                isWeatherLayer: true
            }
        );
        
        weatherLayer.addTo(weatherMap);
    }
}

// NEW FEATURE 4: Animated Backgrounds
function updateAnimatedBackground(weatherData) {
    const weatherMain = weatherData.weather[0].main.toLowerCase();
    const backgroundDiv = document.querySelector('.weather-particles');
    
    // Clear existing particles
    backgroundDiv.innerHTML = '';
    
    switch (weatherMain) {
        case 'rain':
            createRainAnimation(backgroundDiv);
            break;
        case 'snow':
            createSnowAnimation(backgroundDiv);
            break;
        case 'clouds':
            createCloudAnimation(backgroundDiv);
            break;
        case 'thunderstorm':
            createThunderstormAnimation(backgroundDiv);
            break;
        case 'clear':
            createSunAnimation(backgroundDiv);
            break;
        default:
            // No special animation for other weather types
            break;
    }
}

function createRainAnimation(container) {
    for (let i = 0; i < 50; i++) {
        const raindrop = document.createElement('div');
        raindrop.className = 'rain-particle';
        raindrop.style.left = Math.random() * 100 + '%';
        raindrop.style.animationDelay = Math.random() * 1 + 's';
        raindrop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
        container.appendChild(raindrop);
    }
}

function createSnowAnimation(container) {
    for (let i = 0; i < 30; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snow-particle';
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDelay = Math.random() * 3 + 's';
        snowflake.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(snowflake);
    }
}

function createCloudAnimation(container) {
    for (let i = 0; i < 5; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud-particle';
        cloud.style.top = Math.random() * 30 + '%';
        cloud.style.width = (Math.random() * 100 + 50) + 'px';
        cloud.style.height = (Math.random() * 50 + 30) + 'px';
        cloud.style.animationDelay = Math.random() * 20 + 's';
        cloud.style.animationDuration = (Math.random() * 10 + 15) + 's';
        container.appendChild(cloud);
    }
}

function createThunderstormAnimation(container) {
    createRainAnimation(container);
    
    // Add lightning effect
    setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance every interval
            const lightning = document.createElement('div');
            lightning.className = 'lightning';
            container.appendChild(lightning);
            
            setTimeout(() => {
                container.removeChild(lightning);
            }, 200);
        }
    }, 2000);
}

function createSunAnimation(container) {
    // Create subtle floating particles for clear sunny weather
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = 'rgba(255, 255, 255, 0.6)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `cloudFloat ${Math.random() * 20 + 30}s linear infinite`;
        container.appendChild(particle);
    }
}

// Modern UI Enhancements
function addRippleEffect(button, event) {
    const ripple = button.querySelector('.btn-ripple');
    if (ripple) {
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        
        setTimeout(() => {
            ripple.style.animation = '';
        }, 600);
    }
}

// Enhanced button interactions
document.addEventListener('click', (e) => {
    if (e.target.closest('.modern-btn, .action-btn')) {
        addRippleEffect(e.target.closest('.modern-btn, .action-btn'), e);
    }
});

// Update current time display
function updateCurrentTime() {
    const currentTimeElement = document.getElementById('currentTime');
    if (currentTimeElement) {
        const now = new Date();
        currentTimeElement.textContent = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }
}

// Update progress bars based on weather data
function updateProgressBars(data) {
    // Update humidity progress
    const humidityCard = document.querySelector('[data-value]');
    if (humidityCard && data.main.humidity) {
        humidityCard.style.setProperty('--progress-width', data.main.humidity + '%');
    }
    
    // Update other progress bars based on data
    const progressBars = document.querySelectorAll('.mini-progress');
    progressBars.forEach((bar, index) => {
        let value = 50; // default
        switch(index) {
            case 0: // Wind speed (convert to percentage of max reasonable wind speed)
                value = Math.min((data.wind?.speed || 0) / 20 * 100, 100);
                break;
            case 1: // Humidity
                value = data.main.humidity || 50;
                break;
            case 2: // Visibility (convert km to percentage)
                value = Math.min((data.visibility || 10000) / 10000 * 100, 100);
                break;
            case 3: // Pressure (normalize around 1013 hPa)
                value = Math.min(((data.main.pressure || 1013) - 950) / 100 * 100, 100);
                break;
        }
        bar.style.setProperty('--progress-width', value + '%');
    });
}

// Enhanced weather display function
function enhancedDisplayWeather(data) {
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000); // Update every minute
    
    // Update progress bars
    updateProgressBars(data);
    
    // Add smooth transitions
    weatherCard.style.opacity = '0';
    setTimeout(() => {
        weatherCard.style.opacity = '1';
    }, 100);
}

// Existing utility functions
function checkWeatherAlerts(weatherData) {
    const description = weatherData.weather[0].description.toLowerCase();
    const temp = weatherData.main.temp;
    
    if (temp > 35) {
        showWeatherAlert('🔥 Extreme Heat Warning!', 'Temperature is very high. Stay hydrated and avoid outdoor activities.');
    } else if (temp < -10) {
        showWeatherAlert('🧊 Extreme Cold Warning!', 'Temperature is very low. Dress warmly and be cautious of ice.');
    }
    
    for (const [severity, conditions] of Object.entries(WEATHER_ALERTS)) {
        if (conditions.some(condition => description.includes(condition))) {
            if (severity === 'extreme') {
                showWeatherAlert('⚠️ Extreme Weather Alert!', `${weatherData.weather[0].description} detected. Take immediate precautions.`);
            } else if (severity === 'severe') {
                showWeatherAlert('🌧️ Severe Weather Notice', `${weatherData.weather[0].description} expected. Plan accordingly.`);
            }
            break;
        }
    }
}

function showWeatherAlert(title, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'weather-alert';
    alertDiv.innerHTML = `
        <div class="alert-content">
            <h4>${title}</h4>
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    document.body.prepend(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 10000);
}

function updateBackgroundByWeather(weatherData) {
    const body = document.body;
    const weatherMain = weatherData.weather[0].main.toLowerCase();
    const hour = new Date().getHours();
    
    switch (weatherMain) {
        case 'rain':
            body.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            break;
        case 'snow':
            body.style.background = 'linear-gradient(135deg, #e6ddd4 0%, #d5def5 100%)';
            break;
        case 'thunderstorm':
            body.style.background = 'linear-gradient(135deg, #434343 0%, #000000 100%)';
            break;
        case 'clouds':
            body.style.background = 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)';
            break;
        case 'clear':
            if (hour >= 6 && hour < 18) {
                body.style.background = 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
            } else {
                body.style.background = 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)';
            }
            break;
        default:
            updateBackground();
    }
}

// ===== UTILITY FUNCTIONS =====

/**
 * UI state management functions for loading, error, and success states
 * Provide consistent user feedback throughout the application
 */

/**
 * Show loading spinner and hide other UI elements
 * Called when starting any asynchronous operation (API calls, geolocation)
 */
function showLoading() {
    loading.classList.remove('hidden');    // Show spinning loader
    weatherCard.classList.add('hidden');   // Hide weather data
    error.classList.add('hidden');         // Hide any error messages
}

/**
 * Hide loading spinner
 * Called when asynchronous operations complete (success or failure)
 */
function hideLoading() {
    loading.classList.add('hidden');
}

/**
 * Display error message to user
 * Provides user-friendly feedback when operations fail
 * 
 * @param {string} message - Error message to display to user
 */
function showError(message) {
    error.querySelector('p').textContent = `❌ ${message}`;  // Set error text with emoji
    error.classList.remove('hidden');                        // Make error visible
    weatherCard.classList.add('hidden');                     // Hide weather data
}

/**
 * Hide error message
 * Called when showing new content or clearing errors
 */
function hideError() {
    error.classList.add('hidden');
}

/**
 * Format Unix timestamp to human-readable time
 * Converts API timestamps to local time format for sunrise/sunset display
 * 
 * @param {number} timestamp - Unix timestamp from API
 * @returns {string} - Formatted time string (HH:MM format)
 */
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);  // Convert Unix timestamp to Date
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Update app background based on time of day
 * Creates dynamic visual atmosphere that changes throughout the day
 * Applied when no specific weather background is active
 */
function updateBackground() {
    const hour = new Date().getHours();
    const body = document.body;
    
    // === TIME-BASED BACKGROUND GRADIENTS ===
    if (hour >= 6 && hour < 12) {
        // Morning: Blue sky gradient
        body.style.background = 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
    } else if (hour >= 12 && hour < 17) {
        // Afternoon: Warm pink gradient
        body.style.background = 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)';
    } else if (hour >= 17 && hour < 20) {
        // Evening: Orange sunset gradient
        body.style.background = 'linear-gradient(135deg, #fd7e14 0%, #e17055 100%)';
    } else {
        // Night: Dark gradient
        body.style.background = 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)';
    }
}

// ===== ENHANCED FEATURES =====

/**
 * Toggle between Celsius and Fahrenheit temperature units
 * Converts displayed temperatures and updates unit indicators
 * Maintains user preference for temperature display
 */
function toggleTemperatureUnit() {
    isMetric = !isMetric;  // Toggle global unit preference
    const tempElement = document.getElementById('temperature');
    const feelsLikeElement = document.getElementById('feelsLike');
    
    // Only convert if temperature data is currently displayed
    if (tempElement.textContent) {
        const currentTemp = parseInt(tempElement.textContent);
        const currentFeelsLike = parseInt(feelsLikeElement.textContent);
        
        if (isMetric) {
            const newTemp = Math.round((currentTemp - 32) * 5/9);
            const newFeelsLike = Math.round((currentFeelsLike - 32) * 5/9);
            tempElement.textContent = newTemp;
            feelsLikeElement.textContent = newFeelsLike;
            document.querySelector('.unit').textContent = '°C';
        } else {
            const newTemp = Math.round(currentTemp * 9/5 + 32);
            const newFeelsLike = Math.round(currentFeelsLike * 9/5 + 32);
            tempElement.textContent = newTemp;
            feelsLikeElement.textContent = newFeelsLike;
            document.querySelector('.unit').textContent = '°F';
        }
    }
}

function shareWeather() {
    const cityText = document.getElementById('cityName').textContent;
    const tempText = document.getElementById('temperature').textContent;
    const descText = document.getElementById('description').textContent;
    
    const shareText = `Weather in ${cityText}: ${tempText}°C, ${descText} 🌤️`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Weather Update',
            text: shareText,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Weather info copied to clipboard!');
        });
    }
}

function addToFavorites(cityName) {
    let favorites = JSON.parse(localStorage.getItem('favoriteCities') || '[]');
    if (!favorites.includes(cityName)) {
        favorites.push(cityName);
        localStorage.setItem('favoriteCities', JSON.stringify(favorites));
        updateFavoritesUI();
        alert(`${cityName} added to favorites!`);
    } else {
        alert(`${cityName} is already in favorites!`);
    }
}

function updateFavoritesUI() {
    const favorites = JSON.parse(localStorage.getItem('favoriteCities') || '[]');
    const favoritesSection = document.getElementById('favoritesSection');
    const favoriteCities = document.getElementById('favoriteCities');
    
    if (favorites.length > 0) {
        favoritesSection.classList.remove('hidden');
        favoriteCities.innerHTML = favorites.map(city => 
            `<div class="favorite-city">
                <span onclick="searchFavoriteCity('${city}')" class="city-name">${city}</span>
                <button onclick="removeFavoriteCity('${city}')" class="delete-btn" title="Remove from favorites">✕</button>
            </div>`
        ).join('');
    } else {
        favoritesSection.classList.add('hidden');
    }
}

function searchFavoriteCity(city) {
    cityInput.value = city;
    searchWeather();
}

function removeFavoriteCity(cityName) {
    let favorites = JSON.parse(localStorage.getItem('favoriteCities') || '[]');
    favorites = favorites.filter(city => city !== cityName);
    localStorage.setItem('favoriteCities', JSON.stringify(favorites));
    updateFavoritesUI();
    
    // Show confirmation message
    const message = document.createElement('div');
    message.className = 'temp-message';
    message.textContent = `${cityName} removed from favorites`;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 2000);
}

// Initialize favorites on load
updateFavoritesUI();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        getCurrentLocationWeather();
    }
    if (e.key === 'Escape') {
        cityInput.blur();
    }
});

// Auto-refresh weather every 10 minutes
setInterval(() => {
    if (currentWeatherData) {
        fetchWeatherByCoords(currentWeatherData.coord.lat, currentWeatherData.coord.lon);
    }
}, 600000);

updateBackground();

// ===== NEW FEATURE: WEATHER-BASED ACTIVITY SUGGESTIONS =====
function toggleActivities() {
    const activitiesSection = document.getElementById('activitiesSection');
    if (activitiesSection.classList.contains('hidden')) {
        if (currentWeatherData) {
            displayActivitySuggestions(currentWeatherData);
            activitiesSection.classList.remove('hidden');
            updateActiveTab('activities');
        } else {
            showError('No weather data available. Please search for a location first.');
        }
    } else {
        activitiesSection.classList.add('hidden');
    }
}

function displayActivitySuggestions(weatherData) {
    const container = document.getElementById('activitiesContainer');
    container.innerHTML = '';
    
    const activities = generateActivitySuggestions(weatherData);
    
    activities.forEach(activity => {
        const card = createActivityCard(activity);
        container.appendChild(card);
    });
}

function generateActivitySuggestions(data) {
    const temp = data.main.temp;
    const weather = data.weather[0].main.toLowerCase();
    const windSpeed = data.wind.speed;
    const humidity = data.main.humidity;
    const visibility = data.visibility / 1000; // Convert to km
    
    const activities = [];
    
    // Temperature-based activities
    if (temp >= 25) {
        activities.push({
            title: 'Beach Day',
            icon: '🏖️',
            description: 'Perfect weather for swimming, sunbathing, and beach volleyball!',
            rating: 5,
            conditions: ['Sunny', 'Warm', `${Math.round(temp)}°C`],
            gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
        });
        
        activities.push({
            title: 'Outdoor BBQ',
            icon: '🍖',
            description: 'Great temperature for grilling and outdoor dining with friends.',
            rating: 5,
            conditions: ['Perfect Weather', `${Math.round(temp)}°C`],
            gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
        });
    }
    
    if (temp >= 15 && temp <= 25 && weather !== 'rain') {
        activities.push({
            title: 'Hiking & Nature Walk',
            icon: '🥾',
            description: 'Ideal conditions for exploring trails and enjoying nature.',
            rating: 4,
            conditions: ['Comfortable', 'Clear Skies', `${Math.round(temp)}°C`],
            gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        });
        
        activities.push({
            title: 'Cycling Adventure',
            icon: '🚴',
            description: 'Perfect temperature and conditions for a bike ride.',
            rating: 4,
            conditions: ['Mild Weather', `Wind: ${windSpeed}m/s`],
            gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
        });
    }
    
    if (temp >= 10 && temp <= 20) {
        activities.push({
            title: 'Photography Walk',
            icon: '📸',
            description: 'Great lighting and comfortable temperature for outdoor photography.',
            rating: 4,
            conditions: ['Good Visibility', `${visibility.toFixed(1)}km`],
            gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
        });
    }
    
    // Weather-specific activities
    if (weather.includes('rain')) {
        activities.push({
            title: 'Museum Visit',
            icon: '🏛️',
            description: 'Perfect indoor activity to stay dry and learn something new.',
            rating: 4,
            conditions: ['Rainy Day', 'Indoor Activity'],
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        });
        
        activities.push({
            title: 'Cozy Reading',
            icon: '📚',
            description: 'Ideal weather for staying in with a good book and hot tea.',
            rating: 5,
            conditions: ['Relaxing', 'Indoor'],
            gradient: 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)'
        });
    }
    
    if (weather.includes('snow')) {
        activities.push({
            title: 'Winter Sports',
            icon: '⛷️',
            description: 'Perfect conditions for skiing, snowboarding, or building snowmen!',
            rating: 5,
            conditions: ['Snowy', 'Winter Fun', `${Math.round(temp)}°C`],
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        });
    }
    
    // Wind-based activities
    if (windSpeed > 5 && windSpeed < 15) {
        activities.push({
            title: 'Kite Flying',
            icon: '🪁',
            description: 'Excellent wind conditions for flying kites in the park.',
            rating: 4,
            conditions: ['Good Wind', `${windSpeed}m/s`],
            gradient: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)'
        });
    }
    
    // Always suggest some indoor alternatives
    activities.push({
        title: 'Cooking Workshop',
        icon: '👨‍🍳',
        description: 'Learn new recipes and cooking techniques indoors.',
        rating: 3,
        conditions: ['Indoor Activity', 'Any Weather'],
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    });
    
    return activities.slice(0, 6); // Return max 6 activities
}

function createActivityCard(activity) {
    const card = document.createElement('div');
    card.className = 'activity-card';
    card.style.background = activity.gradient;
    
    card.innerHTML = `
        <div class="activity-header">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-title">${activity.title}</div>
        </div>
        <div class="activity-description">${activity.description}</div>
        <div class="activity-rating">
            <div class="rating-stars">
                ${'★'.repeat(activity.rating)}${'☆'.repeat(5 - activity.rating)}
            </div>
            <span class="rating-text">${activity.rating}/5</span>
        </div>
        <div class="activity-conditions">
            ${activity.conditions.map(condition => `<span class="condition-tag">${condition}</span>`).join('')}
        </div>
    `;
    
    return card;
}

// ===== NEW FEATURE: AIR QUALITY & POLLEN INDEX =====
function toggleAirQuality() {
    const airQualitySection = document.getElementById('airQualitySection');
    if (airQualitySection.classList.contains('hidden')) {
        if (currentWeatherData) {
            displayAirQuality(currentWeatherData);
            airQualitySection.classList.remove('hidden');
            updateActiveTab('airQuality');
        } else {
            showError('No weather data available. Please search for a location first.');
        }
    } else {
        airQualitySection.classList.add('hidden');
    }
}

function displayAirQuality(weatherData) {
    const mainContainer = document.getElementById('airQualityMain');
    const detailsContainer = document.getElementById('airQualityDetails');
    const pollenContainer = document.getElementById('pollenInfo');
    
    // Generate mock air quality data (in real app, fetch from air quality API)
    const aqiData = generateAirQualityData(weatherData);
    
    // Main AQI Display
    mainContainer.innerHTML = `
        <div class="aqi-display">
            <div class="aqi-circle">
                <div class="aqi-value">${aqiData.aqi}</div>
                <div class="aqi-label">AQI</div>
            </div>
            <div class="aqi-info">
                <div class="aqi-description">${aqiData.description}</div>
                <p style="color: rgba(255,255,255,0.8); margin-top: 1rem;">${aqiData.advice}</p>
            </div>
        </div>
    `;
    
    // Air Quality Details
    detailsContainer.innerHTML = aqiData.metrics.map(metric => `
        <div class="air-metric">
            <div class="metric-icon">${metric.icon}</div>
            <div class="metric-value">${metric.value}</div>
            <div class="metric-label">${metric.label}</div>
        </div>
    `).join('');
    
    // Pollen Information
    pollenContainer.innerHTML = `
        <div class="pollen-title">
            <span class="material-icons">eco</span>
            Pollen Forecast
        </div>
        <div class="pollen-grid">
            ${aqiData.pollen.map(item => `
                <div class="pollen-item">
                    <div class="pollen-type">
                        <span>${item.icon}</span>
                        <span>${item.type}</span>
                    </div>
                    <div class="pollen-level pollen-${item.level.toLowerCase()}">${item.level}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function generateAirQualityData(weatherData) {
    // Generate realistic but mock data
    const baseAqi = Math.floor(Math.random() * 150) + 50; // 50-200 range
    
    let description, advice;
    if (baseAqi <= 50) {
        description = "Good";
        advice = "Air quality is satisfactory. Ideal for outdoor activities.";
    } else if (baseAqi <= 100) {
        description = "Moderate";
        advice = "Air quality is acceptable for most people. Sensitive individuals should consider limiting outdoor activities.";
    } else if (baseAqi <= 150) {
        description = "Unhealthy for Sensitive Groups";
        advice = "Members of sensitive groups may experience health effects. Consider reducing outdoor activities.";
    } else {
        description = "Unhealthy";
        advice = "Everyone may begin to experience health effects. Limit outdoor activities.";
    }
    
    return {
        aqi: baseAqi,
        description,
        advice,
        metrics: [
            { icon: '🌫️', value: Math.floor(Math.random() * 50) + 10, label: 'PM2.5 μg/m³' },
            { icon: '💨', value: Math.floor(Math.random() * 100) + 20, label: 'PM10 μg/m³' },
            { icon: '⚠️', value: Math.floor(Math.random() * 200) + 50, label: 'NO₂ μg/m³' },
            { icon: '🏭', value: Math.floor(Math.random() * 300) + 100, label: 'CO μg/m³' },
            { icon: '☀️', value: Math.floor(Math.random() * 100) + 50, label: 'O₃ μg/m³' },
            { icon: '🌬️', value: Math.floor(Math.random() * 50) + 5, label: 'SO₂ μg/m³' }
        ],
        pollen: [
            { type: 'Tree Pollen', level: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)], icon: '🌳' },
            { type: 'Grass Pollen', level: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)], icon: '🌱' },
            { type: 'Weed Pollen', level: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)], icon: '🌿' },
            { type: 'Mold Spores', level: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)], icon: '🍄' }
        ]
    };
}

// ===== NEW FEATURE: CLOTHING RECOMMENDATIONS =====
function toggleClothing() {
    const clothingSection = document.getElementById('clothingSection');
    if (clothingSection.classList.contains('hidden')) {
        if (currentWeatherData) {
            displayClothingRecommendations(currentWeatherData);
            clothingSection.classList.remove('hidden');
            updateActiveTab('clothing');
        } else {
            showError('No weather data available. Please search for a location first.');
        }
    } else {
        clothingSection.classList.add('hidden');
    }
}

function displayClothingRecommendations(weatherData) {
    const outfitDisplay = document.getElementById('outfitDisplay');
    const clothingDetails = document.getElementById('clothingDetails');
    const accessoriesContainer = document.getElementById('accessoriesSuggestions');
    
    const recommendations = generateClothingRecommendations(weatherData);
    
    // Main Outfit Display
    outfitDisplay.innerHTML = `
        <div class="outfit-character">${recommendations.character}</div>
        <div class="outfit-temp-range">Perfect for ${Math.round(weatherData.main.temp)}°C</div>
        <div class="outfit-description">${recommendations.description}</div>
    `;
    
    // Clothing Categories
    clothingDetails.innerHTML = recommendations.categories.map(category => `
        <div class="clothing-category">
            <div class="category-title">
                <span class="material-icons">${category.icon}</span>
                ${category.name}
            </div>
            <div class="clothing-items">
                ${category.items.map(item => `<span class="clothing-item">${item}</span>`).join('')}
            </div>
        </div>
    `).join('');
    
    // Accessories
    accessoriesContainer.innerHTML = `
        <div class="accessories-title">
            <span class="material-icons">style</span>
            Recommended Accessories
        </div>
        <div class="accessories-grid">
            ${recommendations.accessories.map(accessory => `
                <div class="accessory-item">
                    <div class="accessory-icon">${accessory.icon}</div>
                    <div class="accessory-name">${accessory.name}</div>
                    <div class="accessory-reason">${accessory.reason}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function generateClothingRecommendations(data) {
    const temp = data.main.temp;
    const weather = data.weather[0].main.toLowerCase();
    const windSpeed = data.wind.speed;
    const humidity = data.main.humidity;
    
    let character, description, categories, accessories;
    
    if (temp >= 30) {
        character = '🏖️';
        description = 'Very hot weather calls for minimal, breathable clothing to stay cool and comfortable.';
        categories = [
            {
                name: 'Tops',
                icon: 'sports_bar',
                items: ['Tank Top', 'Light T-Shirt', 'Crop Top', 'Sleeveless Blouse']
            },
            {
                name: 'Bottoms',
                icon: 'sports_handball',
                items: ['Shorts', 'Lightweight Skirt', 'Linen Pants', 'Capris']
            },
            {
                name: 'Footwear',
                icon: 'sports_tennis',
                items: ['Sandals', 'Flip Flops', 'Canvas Sneakers', 'Breathable Shoes']
            }
        ];
        accessories = [
            { icon: '🕶️', name: 'Sunglasses', reason: 'UV protection' },
            { icon: '🧴', name: 'Sunscreen', reason: 'Skin protection' },
            { icon: '🧢', name: 'Light Hat', reason: 'Sun protection' },
            { icon: '💧', name: 'Water Bottle', reason: 'Stay hydrated' }
        ];
    } else if (temp >= 20) {
        character = '👕';
        description = 'Warm and pleasant weather perfect for light, comfortable clothing.';
        categories = [
            {
                name: 'Tops',
                icon: 'sports_bar',
                items: ['T-Shirt', 'Light Blouse', 'Polo Shirt', 'Short Sleeve Shirt']
            },
            {
                name: 'Bottoms',
                icon: 'sports_handball',
                items: ['Jeans', 'Chinos', 'Light Dress', 'Casual Pants']
            },
            {
                name: 'Footwear',
                icon: 'sports_tennis',
                items: ['Sneakers', 'Loafers', 'Canvas Shoes', 'Light Boots']
            }
        ];
        accessories = [
            { icon: '🕶️', name: 'Sunglasses', reason: 'Bright weather' },
            { icon: '🎒', name: 'Light Bag', reason: 'Carry essentials' },
            { icon: '⌚', name: 'Watch', reason: 'Style accent' }
        ];
    } else if (temp >= 10) {
        character = '🧥';
        description = 'Cool weather requires layering for comfort throughout the day.';
        categories = [
            {
                name: 'Tops',
                icon: 'sports_bar',
                items: ['Long Sleeve Shirt', 'Light Sweater', 'Cardigan', 'Hoodie']
            },
            {
                name: 'Bottoms',
                icon: 'sports_handball',
                items: ['Jeans', 'Trousers', 'Leggings', 'Long Pants']
            },
            {
                name: 'Outerwear',
                icon: 'checkroom',
                items: ['Light Jacket', 'Windbreaker', 'Denim Jacket', 'Vest']
            }
        ];
        accessories = [
            { icon: '🧣', name: 'Light Scarf', reason: 'Extra warmth' },
            { icon: '☂️', name: 'Umbrella', reason: 'Weather protection' },
            { icon: '👜', name: 'Crossbody Bag', reason: 'Hands-free carrying' }
        ];
    } else {
        character = '🧥❄️';
        description = 'Cold weather demands warm, layered clothing to stay comfortable outdoors.';
        categories = [
            {
                name: 'Base Layer',
                icon: 'sports_bar',
                items: ['Thermal Shirt', 'Long Underwear', 'Wool Base Layer']
            },
            {
                name: 'Outerwear',
                icon: 'checkroom',
                items: ['Winter Coat', 'Heavy Jacket', 'Puffer Jacket', 'Wool Coat']
            },
            {
                name: 'Accessories',
                icon: 'style',
                items: ['Warm Hat', 'Gloves', 'Scarf', 'Warm Socks']
            }
        ];
        accessories = [
            { icon: '🧤', name: 'Warm Gloves', reason: 'Hand protection' },
            { icon: '🧣', name: 'Thick Scarf', reason: 'Neck warmth' },
            { icon: '👢', name: 'Winter Boots', reason: 'Foot warmth' },
            { icon: '🧢', name: 'Warm Hat', reason: 'Head protection' }
        ];
    }
    
    // Add weather-specific accessories
    if (weather.includes('rain')) {
        accessories.unshift({ icon: '☂️', name: 'Umbrella', reason: 'Rain protection' });
        accessories.push({ icon: '🥾', name: 'Waterproof Shoes', reason: 'Dry feet' });
    }
    
    if (windSpeed > 8) {
        accessories.push({ icon: '🧥', name: 'Windproof Jacket', reason: 'Wind protection' });
    }
    
    return { character, description, categories, accessories: accessories.slice(0, 6) };
}

// Helper function to update active tab
function updateActiveTab(activeTab) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active class to the corresponding tab
    const tabMap = {
        'forecast': 0,
        'charts': 1,
        'map': 2,
        'activities': 3,
        'airQuality': 4,
        'clothing': 5
    };
    
    if (tabs[tabMap[activeTab]]) {
        tabs[tabMap[activeTab]].classList.add('active');
    }
}

// ===== AI-POWERED CHATBOT FUNCTIONALITY =====

/**
 * Advanced chatbot system powered by Google Gemini AI
 * Features:
 * - Natural language processing for weather queries
 * - Context-aware responses using current weather data
 * - Fallback to local responses if API fails
 * - Modern chat UI with typing indicators and animations
 * - Quick action buttons for common queries
 * - Personality injection for engaging conversations
 */

// ===== CHATBOT STATE MANAGEMENT =====

/**
 * Global state variables for chatbot functionality
 */
let chatbotOpen = false;        // Track if chatbot window is currently open
let messageCounter = 0;         // Count total messages for conversation tracking

// ===== CHATBOT DOM ELEMENTS =====

/**
 * DOM element references for chatbot interface
 * Cached for performance and easier access
 */
const chatButton = document.getElementById('chatButton');           // Floating chat trigger button
const chatbotContainer = document.getElementById('chatbotContainer'); // Main chatbot window
const chatbotClose = document.getElementById('chatbotClose');       // Close button in chat header
const chatOverlay = document.getElementById('chatOverlay');         // Background overlay for mobile
const chatInput = document.getElementById('chatInput');             // User message input field
const sendButton = document.getElementById('sendButton');           // Send message button
const chatMessages = document.getElementById('chatbotMessages');    // Messages container
const typingIndicator = document.getElementById('typingIndicator'); // AI typing animation

// ===== CHATBOT RESPONSE DATABASE =====

/**
 * Pre-defined response templates for different conversation categories
 * Used as fallbacks when Gemini API is unavailable or for quick responses
 * Organized by topic for intelligent response selection
 */
const chatbotResponses = {
    // === GREETING RESPONSES ===
    greetings: [
        "Hello! 👋 I'm here to help you with all your weather needs. What would you like to know?",
        "Hi there! 🌤️ Ready to explore the weather together? How can I assist you today?",
        "Welcome! ☀️ I'm your personal weather assistant. What can I help you discover?"
    ],
    
    // === GENERAL WEATHER RESPONSES ===
    weather: [
        "🌡️ The current weather looks great! Based on the data, you can expect comfortable conditions. Would you like specific details about temperature, humidity, or wind?",
        "🌤️ Today's weather is quite pleasant! The temperature is moderate and perfect for most activities. Need suggestions for what to do?",
        "☀️ Beautiful weather today! The conditions are ideal for outdoor activities. Shall I recommend some fun things to do?"
    ],
    
    // === CLOTHING RECOMMENDATION RESPONSES ===
    clothing: [
        "👕 Based on the current temperature, I'd recommend layering! Light clothing with an option to add a jacket would be perfect.",
        "🧥 For today's weather, you'll want to dress comfortably. Think breathable fabrics and maybe bring a light sweater just in case!",
        "👗 Perfect weather for your favorite outfit! The temperature is just right - not too hot, not too cold. You'll be comfortable in most clothing choices."
    ],
    
    // === ACTIVITY SUGGESTION RESPONSES ===
    activities: [
        "🏃‍♀️ Great weather for outdoor activities! How about a nice walk in the park, cycling, or maybe some outdoor sports?",
        "🏖️ The conditions are perfect for beach activities, hiking, or just enjoying time outdoors. What sounds fun to you?",
        "🚴‍♂️ With this lovely weather, you could try jogging, picnicking, outdoor photography, or visiting a local market!"
    ],
    
    // === AIR QUALITY RESPONSES ===
    airQuality: [
        "🌿 The air quality today is looking good! It's safe for outdoor activities and exercise. Perfect day to get some fresh air!",
        "💨 Air quality levels are moderate today. Generally fine for most people, but sensitive individuals might want to limit prolonged outdoor exposure.",
        "🍃 Excellent air quality today! Perfect conditions for outdoor workouts, running, or spending extended time outside."
    ],
    
    // === THANK YOU RESPONSES ===
    thanks: [
        "You're very welcome! 😊 I'm always here to help with weather questions. Stay safe and enjoy your day!",
        "Happy to help! 🌟 Feel free to ask me anything else about weather, activities, or outfit suggestions anytime!",
        "My pleasure! ☀️ Hope you have a wonderful day ahead. Don't forget to check back for weather updates!"
    ],
    
    // === UNKNOWN TOPIC RESPONSES ===
    unknown: [
        "🤔 That's an interesting question! While I specialize in weather-related topics, I'd be happy to help with forecasts, activity suggestions, or clothing recommendations.",
        "💭 I'm not sure about that specific topic, but I'm great with weather advice! Ask me about today's conditions, what to wear, or fun activities to try!",
        "🌤️ I focus on weather and related topics. Would you like to know about current conditions, air quality, clothing suggestions, or activity recommendations?"
    ],
    
    // === FORECAST RESPONSES ===
    forecast: [
        "📅 The 5-day forecast shows some interesting changes ahead! Expect a mix of sunny and partly cloudy days. Perfect for planning outdoor activities!",
        "🗓️ Looking at the upcoming days, you'll see stable weather patterns. Great for making weekend plans or outdoor events!",
        "📊 The extended forecast is looking quite pleasant! Temperatures will remain comfortable with minimal precipitation expected."
    ],
    
    // === HELP AND CAPABILITIES RESPONSES ===
    help: [
        "🆘 I'm here to help! I can assist with:\n\n🌡️ Current weather conditions\n👕 Clothing recommendations\n🏃‍♀️ Activity suggestions\n🌿 Air quality information\n📅 Weather forecasts\n\nWhat would you like to explore?",
        "💡 Here's what I can help you with:\n\n• Check current weather\n• Suggest appropriate clothing\n• Recommend activities\n• Provide air quality info\n• Show weather charts and maps\n\nJust ask me anything weather-related!",
        "🌟 I'm your weather companion! I can provide:\n\n✓ Real-time weather updates\n✓ Smart outfit suggestions\n✓ Fun activity recommendations\n✓ Air quality monitoring\n✓ Weather forecasts\n\nWhat interests you most?"
    ]
};

// Initialize chatbot
function initializeChatbot() {
    // Event listeners
    chatButton.addEventListener('click', toggleChatbot);
    chatbotClose.addEventListener('click', closeChatbot);
    chatOverlay.addEventListener('click', closeChatbot);
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize input
    chatInput.addEventListener('input', () => {
        if (chatInput.value.length > 0) {
            sendButton.disabled = false;
        } else {
            sendButton.disabled = true;
        }
    });
    
    // Initial state
    sendButton.disabled = true;
}

function toggleChatbot() {
    if (chatbotOpen) {
        closeChatbot();
    } else {
        openChatbot();
    }
}

function openChatbot() {
    chatbotOpen = true;
    chatbotContainer.classList.remove('hidden');
    chatOverlay.classList.remove('hidden');
    
    // Trigger animations
    setTimeout(() => {
        chatbotContainer.classList.add('show');
        chatOverlay.classList.add('show');
    }, 10);
    
    // Focus input
    setTimeout(() => {
        chatInput.focus();
    }, 400);
    
    // Hide chat badge
    const chatBadge = document.getElementById('chatBadge');
    if (chatBadge) {
        chatBadge.style.display = 'none';
    }
    
    // Show welcome message if this is the first time
    if (messageCounter === 0) {
        setTimeout(() => {
            const welcomeMessage = "Hi there! 👋 I'm your AI weather assistant powered by Gemini AI. I can help you with:\n\n• Weather insights and forecasts\n• Clothing recommendations\n• Activity suggestions\n• Air quality information\n• And much more!\n\nWhat would you like to know about the weather today?";
            addMessage(welcomeMessage, 'bot');
        }, 600);
    }
}

function closeChatbot() {
    chatbotOpen = false;
    chatbotContainer.classList.remove('show');
    chatOverlay.classList.remove('show');
    
    setTimeout(() => {
        chatbotContainer.classList.add('hidden');
        chatOverlay.classList.add('hidden');
    }, 300);
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    
    // Clear input
    chatInput.value = '';
    sendButton.disabled = true;
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Call Gemini API
        const response = await callGeminiAPI(message);
        hideTypingIndicator();
        addMessage(response, 'bot');
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        hideTypingIndicator();
        
        // Show user-friendly error message with fallback
        const fallbackResponse = "I'm having trouble connecting to my AI brain right now 🤖 But I can still help with basic weather questions! " + generateBotResponse(message);
        addMessage(fallbackResponse, 'bot');
    }
    
    sendButton.disabled = false;
}

/**
 * Call Google Gemini AI API for intelligent weather-related responses
 * Integrates current weather data as context for more accurate responses
 * Handles API errors gracefully with fallback mechanisms
 * 
 * @param {string} userMessage - User's question or message
 * @returns {Promise<string>} - AI-generated response text
 * @throws {Error} - When API call fails or returns invalid data
 */
async function callGeminiAPI(userMessage) {
    // === WEATHER CONTEXT PREPARATION ===
    // Prepare current weather information to provide context for AI responses
    const weatherContext = currentWeatherData ? 
        `Current weather: ${currentWeatherData.weather[0].description}, 
         Temperature: ${Math.round(currentWeatherData.main.temp)}°${isMetric ? 'C' : 'F'}, 
         Location: ${currentWeatherData.name}` : 
        'No current weather data available';
    
    // === AI PROMPT CONSTRUCTION ===
    // Create a detailed prompt that includes weather context and user query
    const prompt = `You are a helpful weather assistant chatbot. Here's the current weather context: ${weatherContext}. 
    User question: ${userMessage}
    
    Please provide a helpful, friendly response about weather or general assistance. Keep responses concise (under 100 words) and conversational.`;

    // === API REQUEST CONFIGURATION ===
    // Configure request body with content and generation parameters
    const requestBody = {
        contents: [{
            parts: [{
                text: prompt  // The complete prompt with context
            }]
        }],
        generationConfig: {
            temperature: 0.7,      // Creativity level (0.0 = deterministic, 1.0 = creative)
            maxOutputTokens: 200,  // Maximum response length
            topP: 0.8,            // Nucleus sampling parameter
            topK: 40              // Top-k sampling parameter
        }
    };

    try {
        // === API REQUEST EXECUTION ===
        // Make HTTP POST request to Gemini API endpoint
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        // Check if the HTTP request was successful
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        // === RESPONSE PROCESSING ===
        // Parse JSON response and extract generated text
        const data = await response.json();
        
        // Validate response structure and extract generated text
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('No valid response from API');
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

function sendQuickMessage(message) {
    chatInput.value = message;
    sendMessage();
}

function addMessage(content, sender) {
    messageCounter++;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const avatarContent = sender === 'bot' ? 
        '<span class="material-icons">smart_toy</span>' : 
        'You';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatarContent}</div>
        <div class="message-content">
            <div class="message-bubble">${content}</div>
            <div class="message-time">${currentTime}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    typingIndicator.classList.remove('hidden');
    scrollToBottom();
}

function hideTypingIndicator() {
    typingIndicator.classList.add('hidden');
}

function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function generateBotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Check for weather-specific responses first
    if ((message.includes('wear') || message.includes('clothing') || message.includes('outfit') || message.includes('dress')) ||
        (message.includes('activity') || message.includes('activities') || message.includes('do') || message.includes('outdoor'))) {
        const weatherResponse = generateWeatherSpecificResponse(userMessage);
        if (weatherResponse) return addPersonalityToResponse(weatherResponse);
    }
    
    // Determine response category based on keywords
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        return getRandomResponse('greetings');
    }
    
    if (message.includes('weather') || message.includes('temperature') || message.includes('forecast')) {
        return getRandomResponse('weather');
    }
    
    if (message.includes('wear') || message.includes('clothing') || message.includes('outfit') || message.includes('dress')) {
        return getRandomResponse('clothing');
    }
    
    if (message.includes('activity') || message.includes('activities') || message.includes('do') || message.includes('outdoor')) {
        return getRandomResponse('activities');
    }
    
    if (message.includes('air quality') || message.includes('pollution') || message.includes('air')) {
        return getRandomResponse('airQuality');
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
        return getRandomResponse('thanks');
    }
    
    if (message.includes('forecast') || message.includes('5 day') || message.includes('future')) {
        return getRandomResponse('forecast');
    }
    
    if (message.includes('help') || message.includes('what can you do') || message.includes('assist')) {
        return getRandomResponse('help');
    }
    
    // Weather-specific responses
    if (currentWeatherData) {
        const temp = currentWeatherData.main.temp;
        const weather = currentWeatherData.weather[0].main.toLowerCase();
        
        if (message.includes('hot') || message.includes('cold') || message.includes('warm')) {
            return `🌡️ Currently it's ${Math.round(temp)}°C outside! ${temp > 25 ? "It's quite warm" : temp < 10 ? "It's quite cool" : "The temperature is comfortable"}. ${getRandomResponse('clothing')}`;
        }
        
        if (message.includes('rain') || message.includes('sunny') || message.includes('cloudy')) {
            return `🌤️ The current weather is ${weather}. ${getRandomResponse('weather')}`;
        }
    }
    
    // Default responses
    return addPersonalityToResponse(getRandomResponse('unknown'));
}

function getRandomResponse(category) {
    const responses = chatbotResponses[category];
    if (!responses) return chatbotResponses.unknown[0];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Advanced response features
function generateWeatherSpecificResponse(userMessage) {
    if (!currentWeatherData) {
        return "🔍 I'd love to give you specific weather advice! Please search for a location first so I can provide accurate recommendations.";
    }
    
    const temp = currentWeatherData.main.temp;
    const weather = currentWeatherData.weather[0].main.toLowerCase();
    const humidity = currentWeatherData.main.humidity;
    const windSpeed = currentWeatherData.wind.speed;
    
    if (userMessage.includes('outfit') || userMessage.includes('clothing')) {
        if (temp > 30) {
            return `🌡️ It's ${Math.round(temp)}°C - quite hot! I'd recommend light, breathable clothing like cotton t-shirts, shorts, and sandals. Don't forget sunglasses and sunscreen! ☀️`;
        } else if (temp > 20) {
            return `🌤️ Pleasant ${Math.round(temp)}°C weather! Perfect for jeans and a t-shirt or light sweater. Comfortable and stylish! 👕`;
        } else if (temp > 10) {
            return `🧥 At ${Math.round(temp)}°C, layering is key! Try a long-sleeve shirt with a light jacket you can remove if it warms up. `;
        } else {
            return `❄️ It's quite cold at ${Math.round(temp)}°C! Bundle up with warm layers, a heavy coat, hat, and gloves to stay cozy! 🧣`;
        }
    }
    
    if (userMessage.includes('activity') || userMessage.includes('do')) {
        if (weather.includes('rain')) {
            return `🌧️ It's rainy outside! Perfect time for indoor activities like visiting a museum, reading a book, or trying a new recipe. Stay dry and cozy! 📚`;
        } else if (temp > 25) {
            return `🏖️ Beautiful ${Math.round(temp)}°C weather! Perfect for beach activities, swimming, outdoor sports, or a picnic in the park! `;
        } else if (temp > 15) {
            return `🚶‍♀️ Great ${Math.round(temp)}°C weather for hiking, cycling, outdoor photography, or exploring local attractions! 🚴‍♂️`;
        }
    }
    
    return getRandomResponse('weather');
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeChatbot();
});

// ===== CHATBOT PERSONALITY ENHANCEMENT =====

/**
 * Personality injection system for more engaging conversations
 * Adds random conversational elements to make the bot feel more human
 */
const personalityResponses = [
    "That's a great question! 🤔",
    "Interesting! Let me think about that... 💭",
    "I love talking about weather! 🌤️",
    "Weather can be so fascinating! ⛅",
    "You're asking all the right questions! 🌟"
];

/**
 * Add personality elements to chatbot responses
 * Randomly injects conversational phrases to make interactions more natural
 * 
 * @param {string} response - Base response text
 * @returns {string} - Response with optional personality addition
 */
function addPersonalityToResponse(response) {
    if (Math.random() < 0.3) { // 30% chance to add personality
        const personality = personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
        return personality + " " + response;
    }
    return response;
}

/**
 * ===== WEATHER APP - FEATURE SUMMARY =====
 * 
 * This comprehensive weather application includes the following features:
 * 
 * 🌍 CORE WEATHER FUNCTIONALITY:
 * • Real-time weather data from OpenWeatherMap API
 * • GPS-based location detection with fallback to manual search
 * • Current conditions: temperature, humidity, wind, pressure, visibility
 * • Sunrise/sunset times with local timezone support
 * • Weather alerts for extreme conditions
 * • Celsius/Fahrenheit temperature unit toggle
 * 
 * 📊 ADVANCED FEATURES:
 * • 5-day weather forecast with daily cards
 * • Interactive weather charts (temperature trends, humidity/pressure)
 * • Weather maps with multiple overlay options (precipitation, wind, clouds)
 * • Weather-based activity suggestions
 * • Air quality index and pollen information
 * • Smart clothing recommendations based on conditions
 * 
 * 🤖 AI-POWERED CHATBOT:
 * • Google Gemini AI integration for natural language processing
 * • Context-aware responses using current weather data
 * • Fallback response system for offline functionality
 * • Quick action buttons for common queries
 * • Typing indicators and modern chat UI
 * • Personality injection for engaging conversations
 * 
 * 🎨 USER EXPERIENCE:
 * • Modern glassmorphism design with smooth animations
 * • Responsive layout for desktop and mobile devices
 * • Dynamic backgrounds that change with weather and time
 * • Animated weather particles (rain, snow, clouds)
 * • Favorite cities management with CRUD operations
 * • Social sharing functionality
 * • Keyboard shortcuts and accessibility features
 * 
 * 🔧 TECHNICAL IMPLEMENTATION:
 * • Modular JavaScript architecture with clear separation of concerns
 * • Async/await pattern for all API calls
 * • Error handling with user-friendly fallback messages
 * • Local storage for user preferences and favorites
 * • Progressive enhancement with graceful degradation
 * • Performance optimizations with efficient DOM manipulation
 * 
 * 📱 SUPPORTED BROWSERS:
 * • Modern browsers with ES6+ support
 * • Geolocation API support recommended
 * • WebGL support for advanced visualizations
 * 
 * 🚀 GETTING STARTED:
 * 1. Replace API keys with your own (OpenWeatherMap & Gemini)
 * 2. Serve files from a web server (required for API calls)
 * 3. Allow location access for GPS-based weather detection
 * 4. Explore all features through the intuitive tab-based interface
 * 
 * Built with ❤️ using vanilla JavaScript, Chart.js, Leaflet.js, and modern CSS
 */
