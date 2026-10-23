
import { Construction } from 'lucide-react'

function PlaceholderPage({ title, description }) {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Construction size={27} />
                </div>
                <h1 className="mt-5 text-2xl font-bold text-slate-900">{title}</h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
                <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-400">
                    Halaman ini akan dikembangkan pada tahap berikutnya.
                </p>
            </div>
        </div>
    )
}

export default PlaceholderPage
