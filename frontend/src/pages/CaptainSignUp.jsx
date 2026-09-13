import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CaptainDataContext } from '../context/CaptainContext';
import { IKContext, IKUpload } from 'imagekitio-react';

const authenticator = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/imagekit/auth`);
        return response.data;
    } catch (error) {
        throw new Error(`Authentication request failed: ${error.message}`);
    }
};

const CaptainSignUp = () => {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [vehicleColor, setVehicleColor] = useState('');
    const [vehiclePlate, setVehiclePlate] = useState('');
    const [vehicleCapacity, setVehicleCapacity] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    const { setCaptain } = useContext(CaptainDataContext);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const captainData = {
            fullname: { firstname: firstName, lastname: lastName },
            email,
            password,
            avatarUrl,
            vehicle: {
                color: vehicleColor,
                plate: vehiclePlate,
                capacity: vehicleCapacity,
                vehicleType: vehicleType
            }
        };

        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`, captainData, { withCredentials: true });
            if (res.status === 201) {
                setCaptain(res.data.captain);
                localStorage.setItem('captain-token', res.data.token);
                navigate("/captain-home");
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-[#0f172a] flex flex-col'>
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
                <h2 className='text-2xl font-bold text-white mt-2 mb-1'>Join the Fleet</h2>
                <p className='text-slate-400 text-sm'>Create your captain account</p>
            </div>

            <div className='flex-1 bg-white rounded-t-3xl overflow-y-auto px-6 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]'>
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
                                className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                                type='text'
                                placeholder='First'
                            />
                        </div>
                        <div className='w-1/2'>
                            <label className='block text-sm font-semibold text-[#0f172a] mb-1'>Last name</label>
                            <input
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                                type='text'
                                placeholder='Last'
                            />
                        </div>
                    </div>

                    <div>
                        <label className='block text-sm font-semibold text-[#0f172a] mb-1'>Email</label>
                        <input
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                            type='email'
                            placeholder='email@example.com'
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-semibold text-[#0f172a] mb-1'>Password</label>
                        <input
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                            type='password'
                            placeholder='Password'
                        />
                    </div>

                    <div className='pt-4 pb-2'>
                        <h3 className='text-base font-bold text-[#0f172a] border-b pb-2'>Vehicle Information</h3>
                    </div>

                    <div className='flex gap-3'>
                        <div className='w-1/2'>
                            <label className='block text-sm font-semibold text-[#0f172a] mb-1'>Color</label>
                            <input
                                required
                                value={vehicleColor}
                                onChange={(e) => setVehicleColor(e.target.value)}
                                className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                                type='text'
                                placeholder='White'
                            />
                        </div>
                        <div className='w-1/2'>
                            <label className='block text-sm font-semibold text-[#0f172a] mb-1'>Plate</label>
                            <input
                                required
                                value={vehiclePlate}
                                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                                className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                                type='text'
                                placeholder='ABC-1234'
                            />
                        </div>
                    </div>

                    <div className='flex gap-3'>
                        <div className='w-1/2'>
                            <label className='block text-sm font-semibold text-[#0f172a] mb-1'>Capacity</label>
                            <input
                                required
                                value={vehicleCapacity}
                                onChange={(e) => setVehicleCapacity(e.target.value)}
                                className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                                type='number'
                                min='1'
                                placeholder='4'
                            />
                        </div>
                        <div className='w-1/2'>
                            <label className='block text-sm font-semibold text-[#0f172a] mb-1'>Type</label>
                            <select
                                required
                                value={vehicleType}
                                onChange={(e) => setVehicleType(e.target.value)}
                                className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                            >
                                <option value="" disabled>Select</option>
                                <option value="car">Car</option>
                                <option value="motorcycle">Motorcycle</option>
                                <option value="auto">Auto</option>
                            </select>
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className='w-full bg-emerald-500 text-white font-semibold py-4 rounded-xl text-base hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-60 mt-6'
                    >
                        {loading ? 'Creating account...' : 'Register as Captain'}
                    </button>
                </form>

                <p className='text-center text-gray-500 text-sm mt-5'>
                    Already have an account? <Link to='/captain-login' className='text-emerald-600 font-semibold'>Log in</Link>
                </p>
                
                <p className='text-[11px] leading-relaxed text-gray-400 mt-8 text-center px-4'>
                    By proceeding, you consent to background checks and agree to the Sawari Captain terms of service.
                </p>
            </div>
        </div>
    );
};

export default CaptainSignUp;