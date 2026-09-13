import React, { useState } from 'react';
import axios from 'axios';

const RatingPopUp = ({ ride, userType, onClose }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const submitRating = async () => {
        if (rating === 0) return;
        setLoading(true);

        const endpoint = userType === 'user' ? '/rides/rate-captain' : '/rides/rate-user';
        
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}${endpoint}`, {
                rideId: ride._id,
                rating
            }, {
                headers: { Authorization: `Bearer ${userType === 'captain' ? localStorage.getItem('captain-token') : localStorage.getItem('user-token')}` },
                withCredentials: true
            });
            setSubmitted(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error("Error submitting rating:", error);
            // Even if it fails, close the modal to avoid blocking the user forever
            onClose();
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-2xl text-center w-80 relative">
                <i className="ri-checkbox-circle-fill text-6xl text-green-500 mb-2"></i>
                <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                <p className="text-gray-500">Your rating has been submitted.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-2xl text-center w-80 relative">
            <h3 className="text-2xl font-bold mb-2">Rate your Trip</h3>
            <p className="text-gray-500 mb-6">
                How was your experience with {userType === 'user' ? (ride?.captain?.fullname?.firstname || "the Captain") : (ride?.user?.fullname?.firstname || "the Passenger")}?
            </p>

            <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(rating)}
                        className={`text-4xl transition-colors duration-200 ${
                            star <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
                        }`}
                    >
                        ★
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={submitRating}
                    disabled={rating === 0 || loading}
                    className={`w-full py-3 rounded-lg font-semibold text-lg transition-colors ${
                        rating === 0 || loading ? "bg-gray-300 text-gray-500" : "bg-black text-white"
                    }`}
                >
                    {loading ? "Submitting..." : "Submit Rating"}
                </button>
                
                <button
                    onClick={onClose}
                    className="w-full py-2 rounded-lg font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                    Skip
                </button>
            </div>
        </div>
    );
};

export default RatingPopUp;
