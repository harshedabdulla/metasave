import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import './styles/fonts.css'
import { MainContextProvider } from './context/MainContext.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { ClinicAuthContextProvider } from './context/ClinicAuthContext.jsx'
import { SignupProvider } from './pages/user/Signup.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainContextProvider>
      <AuthContextProvider>
        <ClinicAuthContextProvider>
          <SignupProvider>
            <App />
          </SignupProvider>
        </ClinicAuthContextProvider>
      </AuthContextProvider>
    </MainContextProvider>
  </React.StrictMode>
)
