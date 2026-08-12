import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/citizen/Home.jsx'
import ReportBin from './pages/citizen/ReportBin.jsx'
import TrackReport from './pages/citizen/TrackReport.jsx'
import ConfirmCollection from './pages/citizen/ConfirmCollection.jsx'
import BinsList from './pages/citizen/BinsList.jsx'
import Contact from './pages/citizen/Contact.jsx'

import Login from './pages/auth/Login.jsx'

import CollectorDashboard from './pages/collector/CollectorDashboard.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'

import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<ReportBin />} />
          <Route path="/track" element={<TrackReport />} />
          <Route path="/track/:code" element={<TrackReport />} />
          <Route path="/confirm" element={<ConfirmCollection />} />
          <Route path="/confirm/:code" element={<ConfirmCollection />} />
          <Route path="/bins" element={<BinsList />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/collector"
            element={
              <ProtectedRoute roles={['collector', 'admin']}>
                <CollectorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
