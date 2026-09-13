import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserDataContext } from '../context/UserContext';

import { IKContext, IKUpload } from 'imagekitio-react';

const SawariLogo = () => (
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

const authenticator = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/imagekit/auth`);
        return response.data;
    } catch (error) {
        throw new Error(`Authentication request failed: ${error.message}`);
    }
};

const UserSignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    
    const { setUser } = useContext(UserDataContext);
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const newUser = { fullname: { firstname: firstName, lastname: lastName }, email, password, avatarUrl };
        
        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`, newUser);
            if (response.status === 201) {
                setUser(response.data.user);
                localStorage.setItem('user-token', response.data.token);
                navigate('/home');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='h-screen bg-gray-50 flex flex-col'>
            <div className='bg-white px-6 pt-10 pb-4 shadow-sm'>
                <SawariLogo />
                <h2 className='text-2xl font-bold text-[#0f172a] mt-6 mb-1'>Join Sawari</h2>
                <p className='text-gray-500 text-sm'>Create your passenger account</p>
            </div>

            <div className='flex-1 overflow-y-auto px-6 py-6'>
                {error && (
                    <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm'>
                        {error}
                    </div>
                )}

                <form onSubmit={submitHandler} className='space-y-4'>
                    <div className='flex flex-col gap-2 mb-2'>
                        <label className='block text-sm font-semibold text-[#0f172a] mb-1'>Profile Picture (Optional)</label>
                        <IKContext 
                            publicKey={import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || "public_dummy"} 
                            urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/dummy"} 
                            authenticator={authenticator}
                        >
                            <div className='flex items-center gap-4'>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className='w-16 h-16 rounded-full object-cover border border-gray-200' />
                                ) : (
                                    <div className='w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-200'>
                                        <i className="ri-user-fill text-2xl"></i>
                                    </div>
                                )}
                                <div>
                                    <label className='cursor-pointer text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors inline-block'>
                                        {uploading ? 'Uploading...' : 'Upload Image'}
                                        <IKUpload 
                                            fileName="avatar.jpg"
                                            style={{display: 'none'}}
                                            onChange={() => setUploading(true)}
                                            onSuccess={(res) => {
                                                setAvatarUrl(res.url);
                                                setUploading(false);
                                            }}
                                            onError={(err) => {
                                                console.error("Upload error", err);
                                                setError("Failed to upload image");
                                                setUploading(false);
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </IKContext>
                    </div>

                    <div className='flex gap-3'>
                        <div className='w-1/2'>
                            <label className='block text-sm font-semibold text-[#0f172a] mb-1'>First name</label>
                            <input
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className='w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                type='text'
                                placeholder='John'
                            />
                        </div>
                        <div className='w-1/2'>
                            <label className='block text-sm font-semibold text-[#0f172a] mb-1'>Last name</label>
                            <input
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className='w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                type='text'
                                placeholder='Doe'
                            />
                        </div>
                    </div>

                    <div>
                        <label className='block text-sm font-semibold text-[#0f172a] mb-1'>Email address</label>
                        <input
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            type='email'
                            placeholder='your@email.com'
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-semibold text-[#0f172a] mb-1'>Password</label>
                        <input
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            type='password'
                            placeholder='Create a password'
                        />
                    </div>

                    <button
                        disabled={loading}
                        className='w-full bg-[#0f172a] text-white font-semibold py-4 rounded-xl text-base hover:bg-blue-600 transition-all shadow-lg disabled:opacity-60 mt-4'
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className='text-center text-gray-500 text-sm mt-5'>
                    Already have an account? <Link to='/login' className='text-blue-600 font-semibold'>Log in</Link>
                </p>
                
                <p className='text-[11px] leading-relaxed text-gray-400 mt-8 text-center px-4'>
                    By proceeding, you consent to get calls, WhatsApp or SMS messages, including by automated means, from Sawari and its affiliates to the number provided.
                </p>
            </div>
        </div>
    );
};

export default UserSignUp;