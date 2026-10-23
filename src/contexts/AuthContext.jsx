
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true

        async function loadSession() {
            const { data, error } = await supabase.auth.getSession()

            if (active) {
                if (error) {
                    console.error('Gagal memuat sesi:', error.message)
                }

                setUser(data?.session?.user ?? null)
                setLoading(false)
            }
        }

        loadSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (active) {
                setUser(session?.user ?? null)
                setLoading(false)
            }
        })

        return () => {
            active = false
            subscription.unsubscribe()
        }
    }, [])

    async function register(email, password) {
        return await supabase.auth.signUp({
            email,
            password,
        })
    }

    async function login(email, password) {
        return await supabase.auth.signInWithPassword({
            email,
            password,
        })
    }

    async function logout() {
        return await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                register,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth harus digunakan di dalam AuthProvider')
    }

    return context
}
