import { useState, useContext } from 'react'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext'
import axios from 'axios'
const CaptainSignUp = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')

    const [color, setColor] = useState('')
    const [plate, setPlate] = useState('')
    const [capacity, setCapacity] = useState('')
    const [vehicleType, setVehicleType] = useState('')
    const { setCaptain } = useContext(CaptainDataContext);
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault()

        const captainData = {
            fullname: {
                firstname: firstName,
                lastname: lastName
            },
            email,
            password,
            vehicle: {
                color,
                plate,
                capacity: Number(capacity),
                vehicleType
            }
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`, captainData, { withCredentials: true });
            console.log(res.data);
            if (res.status === 201) {
                setCaptain(res.data.captain);
                localStorage.setItem('captain-token', res.data.token);
                navigate("/captain-home")
            }

        } catch (error) {
            console.log("Error occured at Captain SignUp", error);
            console.log("Response:",error?.response)
        }
        console.log(captainData)



        // Later:
        // axios.post('/captains/register', captainData)

        setEmail('')
        setFirstName('')
        setLastName('')
        setPassword('')
        setColor('')
        setPlate('')
        setCapacity('')
        setVehicleType('')
    }

    return (
        <div>
            <div className='p-7 min-h-screen flex flex-col justify-between'>

                <div>

                    <img
                        className='w-16 mb-10'
                        src="https://www.svgrepo.com/show/505031/uber-driver.svg"
                        alt="Uber Driver"
                    />

                    <form onSubmit={submitHandler}>

                        {/* Name */}
                        <h3 className='text-lg w-1/2 font-medium mb-2'>
                            What's your name
                        </h3>

                        <div className='flex gap-4 mb-7'>

                            <input
                                required
                                className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base'
                                type="text"
                                placeholder='First name'
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />

                            <input
                                required
                                className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base'
                                type="text"
                                placeholder='Last name'
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />

                        </div>

                        {/* Email */}
                        <h3 className='text-lg font-medium mb-2'>
                            What's your email
                        </h3>

                        <input
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'
                            type="email"
                            placeholder='email@example.com'
                        />

                        {/* Password */}
                        <h3 className='text-lg font-medium mb-2'>
                            Enter Password
                        </h3>

                        <input
                            className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            type="password"
                            placeholder='password'
                        />

                        {/* Vehicle Color */}
                        <h3 className='text-lg font-medium mb-2'>
                            Vehicle Color
                        </h3>

                        <input
                            required
                            className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'
                            type="text"
                            placeholder='e.g. White'
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                        />

                        {/* Vehicle Plate */}
                        <h3 className='text-lg font-medium mb-2'>
                            Vehicle Plate
                        </h3>

                        <input
                            required
                            className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'
                            type="text"
                            placeholder='e.g. OD02AB1234'
                            value={plate}
                            onChange={(e) => setPlate(e.target.value.toUpperCase())}
                        />

                        {/* Vehicle Capacity */}
                        <h3 className='text-lg font-medium mb-2'>
                            Vehicle Capacity
                        </h3>

                        <input
                            required
                            min="1"
                            className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base'
                            type="number"
                            placeholder='e.g. 4'
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                        />

                        {/* Vehicle Type */}
                        <h3 className='text-lg font-medium mb-2'>
                            Vehicle Type
                        </h3>

                        <select
                            required
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value)}
                            className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg'
                        >
                            <option value="" disabled>
                                Select vehicle type
                            </option>

                            <option value="car">
                                Car
                            </option>

                            <option value="motorcycle">
                                Motorcycle
                            </option>

                            <option value="auto">
                                Auto
                            </option>
                        </select>

                        {/* Submit */}
                        <button
                            className='bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg'
                        >
                            Create Captain Account
                        </button>

                    </form>

                    <p className='text-center'>
                        Already have an account?{' '}
                        <Link
                            to='/captain-login'
                            className='text-blue-600'
                        >
                            Login here
                        </Link>
                    </p>

                </div>

                <div>
                    <p className='text-[10px] leading-tight'>
                        This site is protected by reCAPTCHA and the{' '}
                        <span className='underline'>
                            Google Privacy Policy
                        </span>{' '}
                        and{' '}
                        <span className='underline'>
                            Terms of Service apply
                        </span>.
                    </p>
                </div>

            </div>
        </div>
    )
}

export default CaptainSignUp