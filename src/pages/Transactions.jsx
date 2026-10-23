
import { useEffect, useState } from 'react'
import {
    ArrowDownLeft,
    ArrowUpRight,
    Trash2,
    Plus,
    Wallet,
    ReceiptText,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const expenseCategories = [
    'Makan & minum',
    'Kos',
    'Transportasi',
    'Kuliah',
    'Belanja',
    'Kesehatan',
    'Lainnya',
]

const incomeCategories = [
    'Uang bulanan',
    'Gaji',
    'Beasiswa',
    'Usaha',
    'Lainnya',
]

const today = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

const rupiah = (amount) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount)

export default function Transactions() {
    const { user } = useAuth()

const [transactions, setTransactions] = useState([])
const [loading, setLoading] = useState(true)
const [saving, setSaving] = useState(false)
const [deletingId, setDeletingId] = useState(null)
const [error, setError] = useState('')

const [type, setType] = useState('expense')
const [name, setName] = useState('')
const [amount, setAmount] = useState('')
const [category, setCategory] = useState('Makan & minum')
const [date, setDate] = useState(today())
const [filter, setFilter] = useState('all')


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
            console.error('Gagal memuat transaksi:', error.message, error.details, error.hint, error)
            setError(`Gagal memuat transaksi: ${error.message || 'Error 400'}`)
        } else {
            setTransactions(
                data.map((item) => ({
                    ...item,
                    amount: Number(item.amount),
                })),
            )
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

const categories =
    type === 'income' ? incomeCategories : expenseCategories

const totalIncome = transactions
    .filter((item) => item.type === 'income')
    .reduce((total, item) => total + item.amount, 0)

const totalExpense = transactions
    .filter((item) => item.type === 'expense')
    .reduce((total, item) => total + item.amount, 0)

const filteredTransactions = transactions
    .filter((item) => filter === 'all' || item.type === filter)
    .sort((a, b) => b.date.localeCompare(a.date))

function handleTypeChange(newType) {
    setType(newType)
    setCategory(
        newType === 'income' ? incomeCategories[0] : expenseCategories[0],
    )
}

async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
        setError('Nama transaksi wajib diisi.')
        return
    }

    if (!amount || Number(amount) <= 0) {
        setError('Nominal harus lebih besar dari Rp0.')
        return
    }

    if (!user?.id) {
        setError('Sesi login tidak ditemukan. Silakan login kembali.')
        return
    }

    setSaving(true)

    const { data, error } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            name: name.trim(),
            amount: Number(amount),
            type,
            category,
            date,
        })
        .select()
        .single()

    setSaving(false)

    if (error) {
        console.error('Gagal menyimpan transaksi:', error)
        setError(`Gagal menyimpan transaksi: ${error.message}`)
        return
    }

    setTransactions((current) => [
        { ...data, amount: Number(data.amount) },
        ...current,
    ])

    setName('')
    setAmount('')
    setDate(today())
    setCategory(
        type === 'income' ? incomeCategories[0] : expenseCategories[0],
    )
}

async function handleDelete(id) {

    const confirmed = window.confirm(
        'Yakin ingin menghapus transaksi ini?',
    )

    if (!confirmed) return

    setError('')
    setDeletingId(id)

    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    setDeletingId(null)

    if (error) {
        console.error('Gagal menghapus transaksi:', error)
        setError(`Gagal menghapus transaksi: ${error.message}`)
        return
    }

    setTransactions((current) =>
        current.filter((item) => item.id !== id),
    )

}

return (
    <div className="space-y-7">
        <section>
            <p className="text-sm text-slate-400">
                Catatan keuangan pribadi
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Transaksi
            </h1>
            <p className="mt-2 text-sm text-slate-500">
                Catat dan pantau pemasukan serta pengeluaranmu.
            </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Total pemasukan
                    </p>
                    <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                        <ArrowDownLeft size={21} />
                    </div>
                </div>
                <p className="mt-4 text-2xl font-bold text-emerald-700">
                    {rupiah(totalIncome)}
                </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Total pengeluaran
                    </p>
                    <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600">
                        <ArrowUpRight size={21} />
                    </div>
                </div>
                <p className="mt-4 text-2xl font-bold text-rose-600">
                    {rupiah(totalExpense)}
                </p>
            </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                    <Plus size={21} />
                </div>
                <div>
                    <h2 className="font-bold text-slate-900">
                        Tambah transaksi
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Isi detail transaksi di bawah ini.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Jenis transaksi
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleTypeChange('expense')}
                            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${type === 'expense'
                                ? 'border-rose-300 bg-rose-50 text-rose-700'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <ArrowUpRight size={18} />
                            Pengeluaran
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTypeChange('income')}
                            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${type === 'income'
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <ArrowDownLeft size={18} />
                            Pemasukan
                        </button>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="transaction-name" className="mb-2 block text-sm font-medium text-slate-700">
                            Nama transaksi
                        </label>
                        <input
                            id="transaction-name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Contoh: Makan siang"
                            maxLength={100}
                            required
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="transaction-amount" className="mb-2 block text-sm font-medium text-slate-700">
                            Nominal (Rupiah)
                        </label>
                        <input
                            id="transaction-amount"
                            type="number"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            placeholder="Contoh: 15000"
                            min="1"
                            step="1"
                            required
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="transaction-category" className="mb-2 block text-sm font-medium text-slate-700">
                            Kategori
                        </label>
                        <select
                            id="transaction-category"
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        >
                            {categories.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="transaction-date" className="mb-2 block text-sm font-medium text-slate-700">
                            Tanggal transaksi
                        </label>
                        <input
                            id="transaction-date"
                            type="date"
                            value={date}
                            onChange={(event) => setDate(event.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>
                </div>

                {error && (
                    <p role="alert" className="text-sm text-rose-600">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                    <Plus size={18} />
                    {saving ? 'Menyimpan...' : 'Simpan transaksi'}
                </button>
            </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
                <div>
                    <h2 className="font-bold text-slate-900">
                        Riwayat transaksi
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {filteredTransactions.length} transaksi tercatat
                    </p>
                </div>

                <select
                    aria-label="Filter transaksi"
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                >
                    <option value="all">Semua transaksi</option>
                    <option value="income">Pemasukan saja</option>
                    <option value="expense">Pengeluaran saja</option>
                </select>
            </div>

            {loading ? (
                <div className="px-5 py-12 text-center text-sm text-slate-500">
                    Memuat transaksi...
                </div>
            ) : filteredTransactions.length === 0 ? (
                <div className="px-5 py-14 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        {transactions.length === 0 ? (
                            <ReceiptText size={26} />
                        ) : (
                            <Wallet size={26} />
                        )}
                    </div>
                    <p className="mt-4 font-semibold text-slate-700">
                        {transactions.length === 0
                            ? 'Belum ada transaksi'
                            : 'Tidak ada transaksi pada filter ini'}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                        {transactions.length === 0
                            ? 'Tambahkan transaksi pertamamu melalui formulir di atas.'
                            : 'Pilih filter lain untuk melihat transaksi.'}
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {filteredTransactions.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 px-5 py-4 sm:px-6"
                        >
                            <div
                                className={`rounded-xl p-3 ${item.type === 'income'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-600'
                                    }`}
                            >
                                {item.type === 'income' ? (
                                    <ArrowDownLeft size={20} />
                                ) : (
                                    <ArrowUpRight size={20} />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                    {item.name}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    {item.category} ·{' '}
                                    {new Date(`${item.date}T12:00:00`).toLocaleDateString(
                                        'id-ID',
                                        {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        },
                                    )}
                                </p>
                            </div>

                            <div className="text-right">
                                <p
                                    className={`whitespace-nowrap text-sm font-semibold ${item.type === 'income'
                                        ? 'text-emerald-700'
                                        : 'text-slate-800'
                                        }`}
                                >
                                    {item.type === 'income' ? '+' : '-'}
                                    {rupiah(item.amount)}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deletingId === item.id}
                                    aria-label={`Hapus transaksi ${item.name}`}
                                    className="mt-2 inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700"
                                >
                                    <Trash2 size={13} />
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    </div>
    )
}

