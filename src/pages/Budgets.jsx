
import { useEffect, useState } from 'react'

import {
    Plus,
    Trash2,
    Wallet,
    LoaderCircle,
    PiggyBank,
    AlertCircle,
    Pencil,
    Save,
    X,
} from 'lucide-react'

import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const categories = [
    'Makan & minum',
    'Kos',
    'Transportasi',
    'Kuliah',
    'Belanja',
    'Kesehatan',
    'Lainnya',
]

const rupiah = (amount) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount)

const getMonthStart = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}-01`
}

const formatMonth = (date) =>
    new Intl.DateTimeFormat('id-ID', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${date}T00:00:00Z`))

export default function Budgets() {
    const { user } = useAuth()

    const [budgets, setBudgets] = useState([])
    const [transactions, setTransactions] = useState([])
    const [category, setCategory] = useState(categories[0])
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    // Menyimpan Anggaran Yang Sedang di Edit
    const [editingId, setEditingId] = useState(null)
    const [editAmount, setEditAmount] = useState('')
    const [updating, setUpdating] = useState(false)

    const monthStart = getMonthStart()
    const nextMonth = (() => {
        const date = new Date(`${monthStart}T00:00:00`)
        date.setMonth(date.getMonth() + 1)
        return `${date.getFullYear()}-${String(
            date.getMonth() + 1,
        ).padStart(2, '0')}-01`
    })()

    useEffect(() => {
        let active = true

        async function loadData() {
            setLoading(true)
            setError('')

            const [budgetResult, transactionResult] = await Promise.all([
                supabase
                    .from('budgets')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('month_start', monthStart)
                    .order('category'),

                supabase
                    .from('transactions')
                    .select('id, category, amount, type, date')
                    .eq('user_id', user.id)
                    .eq('type', 'expense')
                    .gte('date', monthStart)
                    .lt('date', nextMonth),
            ])

            if (!active) return

            if (budgetResult.error || transactionResult.error) {
                const message =
                    budgetResult.error?.message ||
                    transactionResult.error?.message

                console.error('Gagal memuat anggaran:', message)
                setError(`Gagal memuat data: ${message}`)
            } else {
                setBudgets(budgetResult.data || [])
                setTransactions(transactionResult.data || [])
            }

            setLoading(false)
        }

        if (user?.id) {
            loadData()
        } else {
            setBudgets([])
            setTransactions([])
            setLoading(false)
        }

        return () => {
            active = false
        }
    }, [user?.id, monthStart, nextMonth])

    const getSpent = (budgetCategory) =>
        transactions
            .filter((item) => item.category === budgetCategory)
            .reduce((sum, item) => sum + Number(item.amount), 0)

    const totalBudget = budgets.reduce(
        (sum, item) => sum + Number(item.amount),
        0,
    )

    const totalSpent = budgets.reduce(
        (sum, item) => sum + getSpent(item.category),
        0,
    )

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setSuccess('')

        const numericAmount = Number(amount)

        if (!user?.id) {
            setError('Sesi login tidak ditemukan. Silakan login kembali.')
            return
        }

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            setError('Batas anggaran harus lebih besar dari Rp0.')
            return
        }

        if (
            budgets.some((item) => item.category === category)
        ) {
            setError(
                'Anggaran kategori ini sudah ada untuk bulan ini.',
            )
            return
        }

        setSaving(true)

        const { data, error } = await supabase
            .from('budgets')
            .insert({
                user_id: user.id,
                category,
                amount: numericAmount,
                month_start: monthStart,
            })
            .select()
            .single()

        setSaving(false)

        if (error) {
            console.error('Gagal menyimpan anggaran:', error)
            setError(
                error.code === '23505'
                    ? 'Anggaran kategori ini sudah ada untuk bulan ini.'
                    : `Gagal menyimpan anggaran: ${error.message}`,
            )
            return
        }

        setBudgets((current) =>
            [...current, data].sort((a, b) =>
                a.category.localeCompare(b.category),
            ),
        )
        setAmount('')
        setSuccess('Anggaran berhasil disimpan.')
    }


    function handleEditStart(budget) {
        setEditingId(budget.id)
        setEditAmount(String(budget.amount))
        setError('')
        setSuccess('')
    }

    function handleEditCancel() {
        setEditingId(null)
        setEditAmount('')
    }

    async function handleUpdate(id) {
        const numericAmount = Number(editAmount)

        setError('')
        setSuccess('')

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            setError('Batas anggaran harus lebih besar dari Rp0.')
            return
        }

        setUpdating(true)

        const { data, error } = await supabase
            .from('budgets')
            .update({ amount: numericAmount })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        setUpdating(false)

        if (error) {
            console.error('Gagal memperbarui anggaran:', error)
            setError(`Gagal memperbarui anggaran: ${error.message}`)
            return
        }

        setBudgets((current) =>
            current.map((item) => item.id === id ? data : item)
        )

        setEditingId(null)
        setEditAmount('')
        setSuccess('Anggaran berhasil diperbarui.')
    }

    async function handleDelete(id) {
        const confirmed = window.confirm(
            'Yakin ingin menghapus anggaran ini?',
        )

        if (!confirmed) return

        setError('')
        setSuccess('')
        setDeletingId(id)

        const { error } = await supabase
            .from('budgets')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        setDeletingId(null)

        if (error) {
            console.error('Gagal menghapus anggaran:', error)
            setError(`Gagal menghapus anggaran: ${error.message}`)
            return
        }

        setBudgets((current) =>
            current.filter((item) => item.id !== id),
        )
        setSuccess('Anggaran berhasil dihapus.')
    }

    return (
        <div className="space-y-7">
            <section>
                <p className="mb-2 text-sm text-slate-400">
                    {formatMonth(monthStart)}
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Anggaran Bulanan
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Atur batas pengeluaran agar keuanganmu tetap terkendali.
                </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                            <Wallet size={21} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">
                                Total Anggaran
                            </p>
                            <p className="mt-1 text-xl font-bold text-slate-900">
                                {rupiah(totalBudget)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                            <PiggyBank size={21} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">
                                Total Terpakai
                            </p>
                            <p className="mt-1 text-xl font-bold text-slate-900">
                                {rupiah(totalSpent)}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="font-bold text-slate-900">
                    Tambah Anggaran
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Tetapkan batas untuk setiap kategori pengeluaran.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-5 grid gap-4 sm:grid-cols-2"
                >
                    <div>
                        <label
                            htmlFor="budget-category"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Kategori
                        </label>
                        <select
                            id="budget-category"
                            value={category}
                            onChange={(event) =>
                                setCategory(event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        >
                            {categories
                                .filter(
                                    (item) =>
                                        !budgets.some(
                                            (budget) =>
                                                budget.category === item,
                                        ),
                                )
                                .map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            {budgets.some(
                                (item) => item.category === category,
                            ) && (
                                    <option value={category} disabled>
                                        {category} (sudah dibuat)
                                    </option>
                                )}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="budget-amount"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Batas Anggaran (Rp)
                        </label>
                        <input
                            id="budget-amount"
                            type="number"
                            min="1"
                            step="1"
                            value={amount}
                            onChange={(event) =>
                                setAmount(event.target.value)
                            }
                            placeholder="Contoh: 500000"
                            required
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving || loading || categories.every(
                            (item) =>
                                budgets.some(
                                    (budget) => budget.category === item,
                                ),
                        )}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                    >
                        {saving ? (
                            <LoaderCircle size={18} className="animate-spin" />
                        ) : (
                            <Plus size={18} />
                        )}
                        {saving ? 'Menyimpan...' : 'Simpan Anggaran'}
                    </button>
                </form>

                {error && (
                    <p className="mt-4 flex items-start gap-2 text-sm text-rose-600">
                        <AlertCircle size={18} className="shrink-0" />
                        {error}
                    </p>
                )}

                {success && (
                    <p className="mt-4 text-sm text-emerald-700">
                        {success}
                    </p>
                )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5 sm:p-6">
                    <h2 className="font-bold text-slate-900">
                        Daftar Anggaran
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Progres pengeluaran untuk bulan ini.
                    </p>
                </div>

                {loading ? (
                    <p className="px-5 py-10 text-center text-sm text-slate-500">
                        Memuat data anggaran...
                    </p>
                ) : error && budgets.length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-rose-600">
                        {error}
                    </p>
                ) : budgets.length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-slate-500">
                        Belum ada anggaran bulan ini. Tambahkan anggaran pertamamu di atas.
                    </p>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {budgets.map((budget) => {
                            const spent = getSpent(budget.category)
                            const limit = Number(budget.amount)
                            const percentage = (spent / limit) * 100
                            const exceeded = spent > limit
                            const warning = percentage >= 80

                            return (
                                <div key={budget.id} className="p-5 sm:p-6">
                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                                        <div>
                                            <h3 className="font-semibold text-slate-800">
                                                {budget.category}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                Terpakai {rupiah(spent)} dari
                                            </p>

                                            {editingId === budget.id ? (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={editAmount}
                                                    onChange={(event) =>
                                                        setEditAmount(event.target.value)
                                                    }
                                                    aria-label={`Batas anggaran ${budget.category}`}
                                                    className="mt-2 w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                />
                                            ) : (
                                                <p className="mt-1 font-semibold text-slate-800">
                                                    {rupiah(limit)}
                                                </p>
                                            )}
                                        </div>


                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`text-sm font-semibold ${exceeded
                                                    ? 'text-rose-600'
                                                    : warning
                                                        ? 'text-amber-600'
                                                        : 'text-emerald-700'
                                                    }`}
                                            >
                                                {Math.round(percentage)}%
                                            </span>

                                            {/* Tombol Edit */}
                                            <button
                                                type="button"
                                                onClick={() => handleEditStart(budget)}
                                                disabled={updating || deletingId === budget.id}
                                                aria-label={`Edit anggaran ${budget.category}`}
                                                className="rounded-lg p-2 text-blue-500 transition hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                                            >
                                                <Pencil size={18} />
                                            </button>

                                            {/* Tombol Hapus */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(budget.id)
                                                }
                                                disabled={
                                                    deletingId === budget.id
                                                }
                                                aria-label={`Hapus anggaran ${budget.category}`}
                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                                            >
                                                {deletingId === budget.id ? (
                                                    <LoaderCircle
                                                        size={18}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className={`h-full rounded-full transition-all ${exceeded
                                                ? 'bg-rose-500'
                                                : warning
                                                    ? 'bg-amber-500'
                                                    : 'bg-emerald-500'
                                                }`}
                                            style={{
                                                width: `${Math.min(percentage, 100)}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="mt-2 flex flex-col justify-between gap-1 text-xs sm:flex-row">
                                        <span
                                            className={
                                                exceeded
                                                    ? 'font-medium text-rose-600'
                                                    : warning
                                                        ? 'font-medium text-amber-600'
                                                        : 'text-slate-400'
                                            }
                                        >
                                            {exceeded
                                                ? `Melebihi batas sebesar ${rupiah(spent - limit)}`
                                                : warning
                                                    ? 'Perhatian: anggaran hampir habis'
                                                    : `Sisa anggaran ${rupiah(limit - spent)}`}
                                        </span>
                                        <span className="text-slate-400">
                                            {formatMonth(monthStart)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}
