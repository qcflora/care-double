import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Layout from './components/Layout/Layout'
import Onboarding from './pages/Onboarding/Onboarding'
import Today from './pages/Today/Today'
import Guide from './pages/Guide/Guide'
import Breathe from './pages/Breathe/Breathe'
import Circle from './pages/Circle/Circle'
import HandoffDetail from './pages/Circle/HandoffDetail'
import Emergency from './pages/Emergency/Emergency'
import EmergencyGuide from './pages/Emergency/EmergencyGuide'
import Health from './pages/Health/Health'
import Assessment from './pages/Health/Assessment'
import Profile from './pages/Profile/Profile'
import Multimodal from './pages/Multimodal/Multimodal'
import Flow from './pages/Flow/Flow'

function App() {
  const { isOnboarded } = useApp()

  return (
    <div className="h-full w-full bg-warm-bg flex justify-center">
      <div className="w-full max-w-md h-full bg-warm-bg relative overflow-hidden">
        <Routes>
          <Route path="/onboarding" element={
            isOnboarded ? <Navigate to="/today" replace /> : <Onboarding />
          } />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/today" replace />} />
            <Route path="today" element={<Today />} />
            <Route path="guide/:taskId" element={<Guide />} />
            <Route path="breathe" element={<Breathe />} />
            <Route path="circle" element={<Circle />} />
            <Route path="handoff/:id" element={<HandoffDetail />} />
            <Route path="emergency" element={<Emergency />} />
            <Route path="emergency/:type" element={<EmergencyGuide />} />
            <Route path="health" element={<Health />} />
            <Route path="assessment" element={<Assessment />} />
            <Route path="profile" element={<Profile />} />
            <Route path="multimodal" element={<Multimodal />} />
            <Route path="flow" element={<Flow />} />
          </Route>
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
