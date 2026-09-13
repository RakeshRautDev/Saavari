import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CaptainDataContext } from '../context/CaptainContext';

const CaptainLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { setCaptain } = useContext(CaptainDataContext);
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/captains/login`,
                { email, password },
                { withCredentials: true }
            );
            if (response.status === 200) {
                setCaptain(response.data.captain);
                localStorage.setItem('captain-token', response.data.token);
                navigate('/captain-home');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='h-screen bg-[#0f172a] flex flex-col'>
            <div className='px-6 pt-10 pb-6'>
                <div className='flex items-center gap-2 mb-2'>
                    <div className='w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center'>
                        <svg width='22' height='22' viewBox='0 0 22 22' fill='none'>
                            <path d='M4 11L11 4L18 11' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                            <path d='M11 4V19' stroke='white' strokeWidth='2' strokeLinecap='round'/>
                        </svg>
                    </div>
                    <span className='font-black text-white text-2xl'>Sawari</span>
                </div>
                <div className='inline-block bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 mt-2'>Captain Portal</div>
                <h2 className='text-2xl font-bold text-white mt-2 mb-1'>Captain Login</h2>
                <p className='text-slate-400 text-sm'>Sign in to start driving and earning</p>
            </div>

            <div className='flex-1 bg-white rounded-t-3xl overflow-y-auto px-6 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]'>
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
                            className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all'
                            type='email'
                            placeholder='captain@example.com'
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-semibold text-[#0f172a] mb-2'>Password</label>
                        <input
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all'
                            type='password'
                            placeholder='Enter your password'
                        />
                    </div>

                    <button
                        disabled={loading}
                        className='w-full bg-emerald-500 text-white font-semibold py-4 rounded-xl text-base hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-60 mt-2'
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className='text-center text-gray-500 text-sm mt-6'>
                    Want to join our fleet? <Link to='/captain-signup' className='text-emerald-600 font-semibold'>Register as a Captain</Link>
                </p>

                <div className='mt-8 pt-8 border-t border-gray-100'>
                    <Link
                        to='/login'
                        className='flex items-center justify-center gap-2 w-full bg-gray-50 text-gray-700 font-semibold py-4 rounded-xl border border-gray-200 text-base hover:bg-gray-100 transition-all'
                    >
                        <i className='ri-user-line text-lg' />
                        Sign in as Passenger
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CaptainLogin;