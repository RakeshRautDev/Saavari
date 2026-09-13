const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/CaptainHome.jsx', 'utf8');

const replacement = `  return (
    <div className='h-[100dvh] flex flex-col bg-gray-50'>
      
      {/* Top Bar for Captain */}
      <div className='absolute p-4 top-0 flex items-center justify-between w-full z-[500] pointer-events-none'>
        <div className='flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-2xl shadow-md pointer-events-auto'>
          <div className='w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center'>
            <svg width='16' height='16' viewBox='0 0 22 22' fill='none'>
                <path d='M4 11L11 4L18 11' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                <path d='M11 4V19' stroke='white' strokeWidth='2' strokeLinecap='round'/>
            </svg>
          </div>
          <span className='font-black text-[#0f172a] text-lg tracking-tight'>Sawari</span>
        </div>
        
        {/* Status Toggle UI */}
        <div 
            onClick={toggleStatus}
            className={\`pointer-events-auto cursor-pointer flex items-center justify-center px-4 py-2.5 rounded-full shadow-lg font-bold text-sm transition-all duration-300 \${captain?.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 border border-gray-200'}\`}
        >
            <div className={\`w-2.5 h-2.5 rounded-full mr-2 shadow-sm \${captain?.status === 'active' ? 'bg-white' : 'bg-red-500'}\`}></div>
            {captain?.status === 'active' ? 'Online' : 'Offline'}
        </div>
      </div>

      {rateRide && (
          <div className='fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center pointer-events-auto'>
              <RatingPopUp 
                  ride={rateRide} 
                  userType="captain" 
                  onClose={() => setRateRide(null)} 
              />
          </div>
      )}

      {/* Map Section */}
      <div className='flex-1 min-h-0 relative'>
        <LiveTracking 
            location={location} 
            mapCenter={location} 
            route={route} 
            captainLocation={{lat: location[0], lng: location[1]}}
            pickupLocation={pickupCoordinates}
        />
        {captain?.status !== 'active' && (
            <div className='absolute inset-0 bg-[#0f172a]/20 backdrop-blur-[2px] z-[400] flex items-center justify-center'>
                <div className='bg-white px-8 py-6 rounded-2xl shadow-2xl text-center max-w-[80%] border border-gray-100'>
                    <div className='w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <i className="ri-moon-fill text-3xl text-gray-400"></i>
                    </div>
                    <h3 className='text-xl font-bold text-[#0f172a]'>You are Offline</h3>
                    <p className='text-sm text-gray-500 mt-2 leading-relaxed'>Go online to start receiving ride requests and earning.</p>
                    <button onClick={toggleStatus} className='mt-5 bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold w-full hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30'>Go Online</button>
                </div>
            </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className='bg-white w-full shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-3xl z-10 flex flex-col relative shrink-0'>
        
        {/* Ride Dashboard */}
        <div style={{ display: activeTab === 'ride' ? 'block' : 'none' }}>
            <div className='p-6'>
                <CaptainDetails />
            </div>

            <div ref={ridePopUpPanelRef} className="fixed w-full z-[600] translate-y-full bottom-[70px] left-0 rounded-t-3xl overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.15)] bg-white">
                <RidePopUp ride={ride} setRidePopUpPanel={setRidePopUpPanel} setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} confirmRide={confirmRide} distanceETA={distanceETA} fetchRoute={fetchRoute} />
            </div>
            
            <div ref={confirmRidePopUpPanelRef} className="fixed w-full h-[calc(100dvh-70px)] z-[700] translate-y-full bottom-[70px] left-0 bg-white overflow-hidden">
                <ConfirmRidePopUp setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} setRidePopUpPanel={setRidePopUpPanel} ride={ride} setRide={setRide} distanceETA={distanceETA} cancelRide={cancelRide}/>
            </div>
        </div>

        {/* AI Assistant Full Panel */}
        {activeTab === 'ai' && (
            <div className='h-[400px] w-full'>
                <CaptainAIAssistant />
            </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className='bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-[800]'>
        
        <button 
            onClick={() => setActiveTab('ride')} 
            className={\`flex flex-col items-center gap-1 w-16 transition-colors \${activeTab === 'ride' ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'}\`}
        >
            <i className={\`text-2xl \${activeTab === 'ride' ? 'ri-dashboard-fill' : 'ri-dashboard-line'}\`}></i>
            <span className='text-[10px] font-semibold'>Dashboard</span>
        </button>
        
        <button 
            onClick={() => setActiveTab('ai')} 
            className={\`flex flex-col items-center gap-1 w-16 transition-colors \${activeTab === 'ai' ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'}\`}
        >
            <i className={\`text-2xl \${activeTab === 'ai' ? 'ri-robot-2-fill' : 'ri-robot-2-line'}\`}></i>
            <span className='text-[10px] font-semibold'>Copilot</span>
        </button>

        <Link to='/captain/history' className='flex flex-col items-center gap-1 w-16 text-gray-400 hover:text-gray-600 transition-colors'>
            <i className='text-2xl ri-history-line'></i>
            <span className='text-[10px] font-semibold'>Earnings</span>
        </Link>

        <Link to='/captain/logout' className='flex flex-col items-center gap-1 w-16 text-gray-400 hover:text-red-500 transition-colors'>
            <i className='text-2xl ri-logout-circle-line'></i>
            <span className='text-[10px] font-semibold'>Logout</span>
        </Link>
      </div>

    </div>
  )
}

export default CaptainHome
`;

const newContent = content.substring(0, content.indexOf('  return (')) + replacement;
fs.writeFileSync('frontend/src/pages/CaptainHome.jsx', newContent);
console.log('CaptainHome.jsx updated successfully.');
