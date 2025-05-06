import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. Import both providers
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import Gleap from 'gleap'

// 2. Initialize Gleap once, before you render
Gleap.init({
  apiKey: 'YOUR_GLEAP_PROJECT_API_KEY', 
  pingInterval: Number(import.meta.env.VITE_GLEAP_PING_INTERVAL)
})

// 3. Render your App wrapped in the ReCaptcha provider
ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_GLEAP_RECAPTCHA_KEY}>
    <App />
  </GoogleReCaptchaProvider>
)
