import './styles/App.css'
import './init.js'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom' // Import Navigate for redirection
import Login from './pages/user/Login.jsx'
import Dashboard from './pages/user/Dashboard.jsx'
import Signup from './pages/user/Signup.jsx'
import React from 'react'
import { useAuthContext } from './context/AuthContext.jsx'
import PleaseLogin from './pages/user/PleaseLogin.jsx'
import AddClinic from './pages/user/AddClinic.jsx'
import AddDevice from './pages/user/AddDevice.jsx'
import CheckUser from './pages/user/CheckUser.jsx'
import NewIdentity from './pages/user/NewIdentity.jsx'
import ClinicLogin from './pages/clinic/ClinicLogin.jsx'
import ClinicRegister from './pages/clinic/ClinicRegister.jsx'
import CDash from './pages/clinic/CDash.jsx'

import ClinicDash from './pages/clinic/ClinicDash.jsx'
import ClinicProfile from './pages/clinic/ClinicProfile.jsx'
import PatientDetails from './pages/clinic/PatientDetails.jsx'
import RecentAppointments from './pages/clinic/RecentAppointment.jsx'
import ClinicStatistics from './pages/clinic/ClinicStatistics.jsx'
import CreateNotification from './pages/clinic/CreateNotification.jsx'
function App() {
  const { loggedIn, web3auth, initWeb3Auth } = useAuthContext()
  React.useEffect(() => {
    initWeb3Auth()
  }, [])
  return (
    <>
      {web3auth && (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CheckUser />} />{' '}
            {/* redirect to checkuser */}
            <Route
              path="/login"
              element={loggedIn ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route path="/signup" element={<CheckUser />} />
            <Route path="/register" element={<CheckUser />} />
            {/* type of user from local storage */}
            {/* localStorage.getItem('type') === 'clinic' or 'user' */}
            {/* on login success or register success, redirect to `/${localStorage.getItem('type')}/dashboard` */}
            <Route
              path="/user/dashboard"
              element={loggedIn ? <Dashboard /> : <Login />}
            />
            <Route
              path="/user/dashboard/*"
              element={loggedIn ? <Dashboard /> : <Login />}
            />
            <Route
              path="/user/newclinic/"
              element={loggedIn ? <AddClinic /> : <Login />}
            />
            <Route
              path="/user/newdevice/"
              element={loggedIn ? <AddDevice /> : <Login />}
            />
            <Route path="/clinic/*" element={<ClinicLogin />} />
            <Route path="/clinic/dashboard" element={<CDash />} />
            <Route
              path="/clinic/profile/"
              element={loggedIn ? <ClinicProfile /> : <Login />}
            />
            <Route path="/clinic/sigin/" element={<ClinicLogin />} />
            <Route
              path="/clinic/signup/"
              element={loggedIn ? <ClinicRegister /> : <Login />}
            />
            <Route
              path="/clinic/patientdetails"
              element={loggedIn ? <PatientDetails /> : <Login />}
            />
            <Route
              path="/clinic/recentappointments"
              element={loggedIn ? <RecentAppointments /> : <Login />}
            />
            <Route
              path="/clinic/clinicstatistics"
              element={loggedIn ? <ClinicStatistics /> : <Login />}
            />
            <Route
              path="/clinic/createnotification"
              element={loggedIn ? <CreateNotification /> : <Login />}
            />
          </Routes>
        </BrowserRouter>
      )}
    </>
  )
}

export default App
