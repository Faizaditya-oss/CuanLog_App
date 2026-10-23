
import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import PlaceholderPage from './pages/PlaceholderPage'
import AuthPage from './pages/AuthPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />

          <Route
            path="budgets"
            element={
              <PlaceholderPage
                title="Anggaran"
                description="Atur batas pengeluaran berdasarkan kategori dan periode."
              />
            }
          />

          <Route
            path="reports"
            element={
              <PlaceholderPage
                title="Laporan Keuangan"
                description="Pantau pola pemasukan dan pengeluaran melalui grafik."
              />
            }
          />

          <Route
            path="savings"
            element={
              <PlaceholderPage
                title="Target Tabungan"
                description="Buat target tabungan dan pantau progres pencapaiannya."
              />
            }
          />

          <Route
            path="settings"
            element={
              <PlaceholderPage
                title="Pengaturan"
                description="Kelola profil dan preferensi keuanganmu."
              />
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
