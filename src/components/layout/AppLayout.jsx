
import {
    Wallet,
    LayoutDashboard,
    ArrowLeftRight,
    ChartNoAxesCombined,
    PiggyBank,
    Settings,
    Bell,
    Plus,
    Menu,
    X,
    LogOut
} from 'lucide-react'
import { NavLink, Outlet, Link } from 'react-router'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'


const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transaksi', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Anggaran', path: '/budgets', icon: Wallet },
    { name: 'Laporan', path: '/reports', icon: ChartNoAxesCombined },
    { name: 'Tabungan', path: '/savings', icon: PiggyBank },
]

function AppLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { user, logout } = useAuth()

    async function handleLogout() {
        const { error } = await logout()

        if (error) {
            window.alert(`Gagal logout: ${error.message}`)
        }
    }

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive
            ? 'bg-emerald-50 text-emerald-700'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white px-5 py-6 md:flex md:flex-col">
                <Link to="/dashboard" className="mb-10 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                        <Wallet size={23} />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight">CuanLog</h1>
                        <p className="text-xs text-slate-400">Smart Log finance</p>
                    </div>
                </Link>

                <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Menu utama
                </p>

                <nav className="space-y-1">
                    {navigation.map(({ name, path, icon: Icon }) => (
                        <NavLink key={path} to={path} className={linkClass}>
                            <Icon size={19} />
                            <span>{name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto">
                    <div className="rounded-2xl bg-emerald-50 p-4">
                        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-700">
                            <PiggyBank size={20} />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                            Mulai menabung!
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            Atur keuanganmu sedikit demi sedikit untuk mencapai tujuan.
                        </p>
                        <Link
                            to="/savings"
                            className="mt-3 inline-block text-xs font-semibold text-emerald-700"
                        >
                            Lihat tabungan →
                        </Link>
                    </div>

                    <NavLink to="/settings" className={`${linkClass} mt-4`}>
                        <Settings size={19} />
                        <span>Pengaturan</span>
                    </NavLink>
                </div>
            </aside>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 md:hidden">
                    <div className="h-full w-72 bg-white p-5 shadow-xl">
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Wallet className="text-emerald-600" size={25} />
                                <span className="text-xl font-bold">CuanLog</span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                aria-label="Tutup menu"
                                className="rounded-lg p-2 hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <nav className="space-y-1">
                            {navigation.map(({ name, path, icon: Icon }) => (
                                <NavLink
                                    key={path}
                                    to={path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={linkClass}
                                >
                                    <Icon size={19} />
                                    {name}
                                </NavLink>
                            ))}
                            <NavLink
                                to="/settings"
                                onClick={() => setMobileMenuOpen(false)}
                                className={linkClass}
                            >
                                <Settings size={19} />
                                Pengaturan
                            </NavLink>
                        </nav>
                    </div>
                </div>
            )}

            <div className="min-h-screen md:ml-64">
                <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                    <div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-8">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                aria-label="Buka menu"
                                className="rounded-xl p-2 hover:bg-slate-100 md:hidden"
                            >
                                <Menu size={22} />
                            </button>
                            <div>
                                <p className="text-xs text-slate-400">Personal finance</p>
                                <p className="text-sm font-semibold sm:text-base">
                                    Keuangan saya
                                </p>
                            </div>
                        </div>

                        <div className="hidden min-w-0 sm:block">
                            <p className="max-w-40 truncate text-sm font-medium">
                                {user?.email}
                            </p>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="mt-1 flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700"
                            >
                                <LogOut size={13} />
                                Keluar
                            </button>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-[1440px] px-4 py-6 pb-24 sm:px-8 sm:py-8 md:pb-8">
                    <Outlet />
                </main>

                <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-slate-200 bg-white px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 md:hidden">
                    {[
                        navigation[0],
                        navigation[1],
                        navigation[2],
                        navigation[4],
                    ].map(({ name, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 py-2 text-[11px] ${isActive ? 'font-semibold text-emerald-700' : 'text-slate-400'
                                }`
                            }
                        >
                            <Icon size={20} />
                            {name}
                        </NavLink>
                    ))}
                </nav>

                <Link
                    to="/transactions"
                    aria-label="Tambah transaksi"
                    className="fixed bottom-20 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 md:bottom-8 md:right-8"
                >
                    <Plus size={25} />
                </Link>
            </div>
        </div>
    )
}

export default AppLayout
