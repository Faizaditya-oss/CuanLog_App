
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Wallet, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function AuthPage() {
    const navigate = useNavigate()
    const { login, register } = useAuth()

    const [mode, setMode] = useState('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setMessage('')

        if (password.length < 6) {
            setError('Password minimal 6 karakter.')
            return
        }

        setLoading(true)

        try {
            if (mode === 'register') {
                const { data, error } = await register(
                    email.trim(),
                    password,
                )

                if (error) throw error

                if (!data.session) {
                    setMessage(
                        'Pendaftaran berhasil. Periksa email untuk konfirmasi akun sebelum login.',
                    )
                } else {
                    navigate('/dashboard', { replace: true })
                }
            } else {
                const { error } = await login(email.trim(), password)

                if (error) throw error

                navigate('/dashboard', { replace: true })
            }
        } catch (err) {
            setError(
                err.message || 'Terjadi kesalahan. Silakan coba kembali.',
            )
        } finally {
            setLoading(false)
        }
    }

    function changeMode(nextMode) {
        setMode(nextMode)
        setError('')
        setMessage('')
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <div className="w-full max-w-md">
                <Link
                    to="/dashboard"
                    className="mb-8 flex items-center justify-center gap-3"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                        <Wallet size={26} />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-slate-900">
                        CuanLog
                    </span>
                </Link>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <h1 className="text-2xl font-bold text-slate-900">
                        {mode === 'login' ? 'Selamat datang!' : 'Buat akun CuanLog'}
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {mode === 'login'
                            ? 'Masuk untuk mengelola keuangan kosmu.'
                            : 'Daftar untuk mulai mencatat keuanganmu.'}
                    </p>

                    <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                        <button
                            type="button"
                            onClick={() => changeMode('login')}
                            className={`rounded-lg py-2.5 text-sm font-semibold ${mode === 'login'
                                ? 'bg-white text-emerald-700 shadow-sm'
                                : 'text-slate-500'
                                }`}
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            onClick={() => changeMode('register')}
                            className={`rounded-lg py-2.5 text-sm font-semibold ${mode === 'register'
                                ? 'bg-white text-emerald-700 shadow-sm'
                                : 'text-slate-500'
                                }`}
                        >
                            Registrasi
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label
                                htmlFor="auth-email"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Email
                            </label>
                            <input
                                id="auth-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="nama@email.com"
                                required
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="auth-password"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="auth-password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete={
                                        mode === 'login' ? 'current-password' : 'new-password'
                                    }
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Minimal 6 karakter"
                                    minLength={6}
                                    required
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700"
                                >
                                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                                {error}
                            </p>
                        )}

                        {message && (
                            <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading && <LoaderCircle size={18} className="animate-spin" />}
                            {loading
                                ? 'Memproses...'
                                : mode === 'login'
                                    ? 'Masuk ke CuanLog'
                                    : 'Buat akun'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                        Data akun dikelola melalui layanan autentikasi Supabase.
                    </p>
                </section>
            </div>
        </main>
    )
}

export default AuthPage
