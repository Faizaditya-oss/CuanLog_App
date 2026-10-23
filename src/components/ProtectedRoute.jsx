
import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <p className="text-sm text-slate-500">
                    Memeriksa sesi akun...
                </p>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/auth" replace />
    }

    return <Outlet />
}

export default ProtectedRoute
