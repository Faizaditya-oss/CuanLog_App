
import {
    ArrowDownLeft,
    ArrowUpRight,
    Wallet,
    TrendingUp,
    TrendingDown,
    Coffee,
    House,
    Bus,
    GraduationCap,
    ArrowRight,
    CalendarDays,
} from 'lucide-react'
import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const rupiah = (amount) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount)



const budgets = [
    { name: 'Makan & minum', spent: 350000, limit: 500000, color: 'bg-emerald-500', icon: Coffee },
    { name: 'Kos', spent: 0, limit: 400000, color: 'bg-blue-500', icon: House },
    { name: 'Transportasi', spent: 100000, limit: 200000, color: 'bg-amber-500', icon: Bus },
    { name: 'Kuliah', spent: 150000, limit: 200000, color: 'bg-violet-500', icon: GraduationCap },
]



function Dashboard() {
    const { user } = useAuth()

    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true

        async function loadTransactions() {
            setLoading(true)
            setError('')

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })

            if (!active) return

            if (error) {
                console.error('Gagal memuat transaksi:', error)
                setError('Gagal memuat transaksi: ' + error.message)
            } else {
                setTransactions(data || [])
            }

            setLoading(false)
        }

        if (user?.id) {
            loadTransactions()
        } else {
            setTransactions([])
            setLoading(false)
        }

        return () => {
            active = false
        }
    }, [user?.id])
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

    const remainingDays = 15
    const dailyLimit = Math.floor(900000 / remainingDays)
    const totalBudget = budgets.reduce((sum, item) => sum + item.limit, 0)
    const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0)

    // Perhitungan Keuangan Otomatis
    const totalIncome = transactions
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + Number(item.amount), 0)

    const totalExpense = transactions
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + Number(item.amount), 0)

    const balance = totalIncome - totalExpense

    const stats = [
        {
            title: 'Total Pemasukan',
            amount: totalIncome,
            icon: ArrowDownLeft,
            color: 'bg-emerald-50 text-emerald-700',
            note: 'Total pemasukan tercatat',
        },
        {
            title: 'Total Pengeluaran',
            amount: totalExpense,
            icon: ArrowUpRight,
            color: 'bg-rose-50 text-rose-600',
            note: 'Total pengeluaran tercatat',
        },
        {
            title: 'Sisa Saldo',
            amount: balance,
            icon: Wallet,
            color: 'bg-blue-50 text-blue-700',
            note: 'Pemasukan dikurangi pengeluaran',
        },
    ]

    return (
        <div className="space-y-7">
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="mb-2 text-sm text-slate-400">{today}</p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Dashboard
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Yuk, cek kondisi keuanganmu hari ini!
                    </p>
                </div>

                <Link
                    to="/transactions"
                    className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:self-auto"
                >
                    <ArrowDownLeft size={18} />
                    Catat transaksi
                </Link>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map(({ title, amount, icon: Icon, color, note }) => (
                    <div
                        key={title}
                        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
                    >
                        <div className="flex items-start justify-between">
                            <p className="text-sm font-medium text-slate-500">{title}</p>
                            <div className={`rounded-xl p-2.5 ${color}`}>
                                <Icon size={21} />
                            </div>
                        </div>
                        <p className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                            {rupiah(amount)}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">{note}</p>
                    </div>
                ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-slate-900">Anggaran bulanan</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Pantau pemakaian uangmu
                            </p>
                        </div>
                        <Link
                            to="/budgets"
                            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                            Lihat semua <ArrowRight size={15} />
                        </Link>
                    </div>

                    <div className="mt-6 rounded-xl bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm text-slate-500">Total anggaran terpakai</p>
                                <p className="mt-1 text-xl font-bold text-slate-900">
                                    {rupiah(totalSpent)}
                                </p>
                            </div>
                            <p className="text-sm font-semibold text-emerald-700">
                                {Math.round((totalSpent / totalBudget) * 100)}%
                            </p>
                        </div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${(totalSpent / totalBudget) * 100}%` }}
                            />
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                            Dari total anggaran {rupiah(totalBudget)}
                        </p>
                    </div>

                    <div className="mt-5 space-y-5">
                        {budgets.map(({ name, spent, limit, color, icon: Icon }) => (
                            <div key={name}>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                                            <Icon size={17} />
                                        </div>
                                        <span className="truncate text-sm font-medium text-slate-700">
                                            {name}
                                        </span>
                                    </div>
                                    <span className="shrink-0 text-xs text-slate-500">
                                        {rupiah(spent)} / {rupiah(limit)}
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={`h-full rounded-full ${color}`}
                                        style={{
                                            width: `${Math.min((spent / limit) * 100, 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="rounded-2xl bg-emerald-700 p-6 text-white shadow-sm">
                        <div className="flex items-center gap-2 text-emerald-100">
                            <CalendarDays size={19} />
                            <p className="text-sm font-medium">Batas pengeluaran harian</p>
                        </div>
                        <p className="mt-4 text-3xl font-bold">{rupiah(dailyLimit)}</p>
                        <p className="mt-2 text-sm leading-6 text-emerald-100">
                            Estimasi batas harian untuk sisa {remainingDays} hari, berdasarkan
                            saldo contoh yang tersedia.
                        </p>
                        <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/10 p-3 text-xs leading-5 text-emerald-50">
                            <TrendingUp size={17} className="shrink-0" />
                            Usahakan pengeluaran tetap dalam batas harianmu.
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-slate-900">Ringkasan saldo</h2>
                            <Wallet size={19} className="text-slate-400" />
                        </div>
                        <div className="mt-5 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm text-slate-500">Saldo tersisa</p>
                                <p className="mt-1 text-lg font-bold text-slate-900">
                                    {/* Saldo sesuai database */}
                                    {rupiah(balance)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                                <TrendingUp size={21} />
                            </div>
                        </div>
                        <div className="mt-4 border-t border-slate-100 pt-4">
                            <p className="text-xs leading-5 text-slate-500">
                                Angka ini masih menggunakan data contoh. Saldo aktual akan
                                dihitung dari transaksi setelah database terhubung.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 p-5 sm:p-6">
                    <div>
                        <h2 className="font-bold text-slate-900">Transaksi terbaru</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Catatan pemasukan dan pengeluaranmu
                        </p>
                    </div>
                    <Link
                        to="/transactions"
                        className="flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-700"
                    >
                        Lihat semua <ArrowRight size={15} />
                    </Link>
                </div>

                <div className="divide-y divide-slate-100">
                    {/* Daftar Transaksi Terbaru */}
                    {loading ? (
                        <p className="px-5 py-8 text-center text-sm text-slate-500">
                            Memuat transaksi...
                        </p>
                    ) : error ? (
                        <p className="px-5 py-8 text-center text-sm text-rose-600">
                            {error}
                        </p>
                    ) : transactions.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-slate-500">
                            Belum ada transaksi. Yuk, catat transaksi pertamamu!
                        </p>
                    ) : (
                        transactions.slice(0, 5).map((item) => {
                            const isIncome = item.type === 'income'
                            const Icon = isIncome ? ArrowDownLeft : ArrowUpRight
                            const color = isIncome
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-600'

                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 px-5 py-4 sm:px-6"
                                >
                                    <div className={`rounded-xl p-3 ${color}`}>
                                        <Icon size={20} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-800">
                                            {item.name}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {item.category} · {item.date}
                                        </p>
                                    </div>

                                    <p
                                        className={`shrink-0 text-right text-sm font-semibold ${isIncome ? 'text-emerald-700' : 'text-slate-800'
                                            }`}
                                    >
                                        {isIncome ? '+' : '-'}
                                        {rupiah(Number(item.amount))}
                                    </p>
                                </div>
                            )
                        })
                    )}
                </div>
            </section>
        </div>
    )
}

export default Dashboard
