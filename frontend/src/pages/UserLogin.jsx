import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserDataContext } from '../context/UserContext'
import axios from "axios";

export const SawariLogo = () => (
    <div className='flex items-center gap-2 mb-2'>
        <div className='w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center'>
            <svg width='22' height='22' viewBox='0 0 22 22' fill='none'>
                <path d='M4 11L11 4L18 11' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                <path d='M11 4V19' stroke='white' strokeWidth='2' strokeLinecap='round'/>
            </svg>
        </div>
        <span className='font-black text-[#0f172a] text-2xl tracking-tight'>Sawari</span>
    </div>
);

const UserLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUser } = useContext(UserDataContext);
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const data = { email, password };
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/users/login`,
                data,
                { withCredentials: true }
            );

            if (response.status === 200 && response.data.user) {
                setUser(response.data.user);
                localStorage.setItem("user-token",response.data.token);
                navigate("/home");
            }

        } catch (error) {
            setError(error.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='h-screen bg-gray-50 flex flex-col'>
            <div className='bg-white px-6 pt-10 pb-4 shadow-sm'>
                <SawariLogo />
                <h2 className='text-2xl font-bold text-[#0f172a] mt-6 mb-1'>Welcome back</h2>
                <p className='text-gray-500 text-sm'>Sign in to book your next ride</p>
            </div>

            <div className='flex-1 overflow-y-auto px-6 py-8'>
                {error && (
                    <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm'>
                        {error}
                    </div>
                )}

                <form onSubmit={submitHandler} className='space-y-5'>
                    <div>
                        <label className='block text-sm font-semibold text-[#0f172a] mb-2'>Email address</label>
                        <input
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                            type='email'
                            placeholder='your@email.com'
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-semibold text-[#0f172a] mb-2'>Password</label>
                        <input
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all'
                            type='password'
                            placeholder='Enter your password'
                        />
                    </div>

                    <button
                        disabled={loading}
                        className='w-full bg-[#0f172a] text-white font-semibold py-4 rounded-xl text-base hover:bg-blue-600 transition-all shadow-lg disabled:opacity-60 mt-2'
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className='text-center text-gray-500 text-sm mt-6'>
                    New to Sawari? <Link to='/signup' className='text-blue-600 font-semibold'>Create an account</Link>
                </p>

                <div className='mt-8 pt-8 border-t border-gray-200'>
                    <Link
                        to='/captain-login'
                        className='flex items-center justify-center gap-2 w-full bg-emerald-50 text-emerald-700 font-semibold py-4 rounded-xl border border-emerald-100 text-base hover:bg-emerald-100 transition-all'
                    >
                        <i className='ri-steering-2-fill text-lg'></i>
                        Sign in as Captain
                    </Link>
                </div>
            </div>
        </div>
    )
}
export default UserLogin