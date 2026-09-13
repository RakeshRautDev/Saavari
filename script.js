const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Home.jsx', 'utf8');

code = code.replace(
  /const \[pickup, setPickup\] = useState\(""\)/,
  \const [activeTab, setActiveTab] = useState('ride');\n  const [pickup, setPickup] = useState("")\
);

const returnRegex = /return \([\s\S]*?\n}\n\nexport default Home/m;

const newReturn = \eturn (
    <div className='h-[100dvh] flex flex-col bg-gray-50'>
      {/* Map section */}
      <div className='flex-1 min-h-0 relative'>
        {/* Sawari Logo Overlay */}
        <div className='absolute left-4 top-4 z-[500] flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-2xl shadow-md'>
          <div className='w-7 h-7 rounded-lg bg-[#0f172a] flex items-center justify-center'>
            <svg width='16' height='16' viewBox='0 0 22 22' fill='none'>
                <path d='M4 11L11 4L18 11' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                <path d='M11 4V19' stroke='white' strokeWidth='2' strokeLinecap='round'/>
            </svg>
          </div>
          <span className='font-black text-[#0f172a] text-lg tracking-tight'>Sawari</span>
        </div>

        {rateRide && (
            <div className='absolute inset-0 bg-black/60 z-[1000] flex items-center justify-center'>
                <RatingPopUp ride={rateRide} userType="user" onClose={() => setRateRide(null)} />
            </div>
        )}
        
        <LiveTracking location={location} mapCenter={mapCenter} route={route} captainLocation={captainLocation} pickupLocation={pickupCoordinates} destinationLocation={destinationCoordinates} />
      </div>

      {/* Main Content Area (Ride Panels OR AI) */}
      <div className='bg-white w-full shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-3xl z-10 overflow-hidden flex flex-col relative'>
        
        {/* Ride Flow */}
        <div style={{ display: activeTab === 'ride' ? 'block' : 'none' }}>
            {/* Search form */}
            <div ref={searchFormRef} style={{ maxHeight: 500, overflow: 'hidden' }}>
              <div className='px-5 pt-6 pb-4 relative'>
                <h5 ref={pannelCloseRef} onClick={() => setPannelOpen(false)} className='absolute opacity-0 right-5 top-6 text-2xl cursor-pointer z-10 text-gray-400'>
                  <i className="ri-arrow-down-s-line"></i>
                </h5>
                <h4 className='text-2xl font-bold text-[#0f172a] mb-4'>Where to?</h4>
                <form onSubmit={submitHandler}>
                  <div className="relative">
                    <div className="absolute left-5 top-[18px] bottom-[18px] w-[2px] bg-gray-300 rounded"></div>
                    <div className="absolute left-[17px] top-[14px] w-[10px] h-[10px] bg-blue-500 rounded-full border-2 border-white"></div>
                    <div className="absolute left-[17px] bottom-[14px] w-[10px] h-[10px] bg-[#0f172a] rounded-sm"></div>
                    
                    <div className="flex gap-2 mb-3">
                      <input className="bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 text-sm sm:text-base rounded-xl w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" type="text" placeholder="Current Location" value={pickup} onChange={(e) => { setPickup(e.target.value); setActive("pickup"); }} onClick={() => setPannelOpen(true)} />
                    </div>
                    <input className="bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 text-sm sm:text-base rounded-xl w-full focus:outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] transition-all" type="text" placeholder="Search destination" value={destination} onChange={(e) => { setDestination(e.target.value); setActive("destination"); }} onClick={() => setPannelOpen(true)} />
                  </div>
                </form>
              </div>
            </div>

            {/* Location suggestions */}
            <div ref={panelRef} style={{ maxHeight: 0, overflow: 'hidden' }}>
              <div className="px-4 pb-4">
                <LocationSearchPanel setPannelOpen={setPannelOpen} setvechiclePannel={setvechiclePannel} handleLocationSelect={handleLocationSelect} suggestion={suggestion} active={active} pickup={pickup} destination={destination} pickupCoordinates={pickupCoordinates} destinationCoordinates={destinationCoordinates} findTrip={findTrip} fetchRoute={fetchRoute} />
              </div>
            </div>

            {/* Vehicle selection */}
            <div ref={vechiclePannelRef} style={{ maxHeight: 0, overflow: 'hidden' }}>
              <div className="px-4 pt-2 pb-6">
                <VehiclePanel setConfirmRidePanel={setConfirmRidePanel} setvechiclePannel={setvechiclePannel} setPannelOpen={setPannelOpen} fare={fare} SetSelectedVehicle={SetSelectedVehicle} createRide={createRide} />
              </div>
            </div>

            {/* Confirm ride */}
            <div ref={confirmRidePanelRef} style={{ maxHeight: 0, overflow: 'hidden' }}>
              <div className="px-4 pt-4 pb-8">
                <ConfirmRide setConfirmRidePanel={setConfirmRidePanel} setvechiclePannel={setvechiclePannel} setVehicleFound={setVehicleFound} pickup={pickup} destination={destination} selectedVehicle={selectedVehicle} fare={fare} image={image} createRide={createRide} />
              </div>
            </div>

            {/* Looking for driver */}
            <div ref={vehicleFoundRef} style={{ maxHeight: 0, overflow: 'hidden' }}>
              <div className="px-4 pt-4 pb-8">
                <LookingForDriver setConfirmRidePanel={setConfirmRidePanel} setvechiclePannel={setvechiclePannel} active={active} pickup={pickup} destination={destination} selectedVehicle={selectedVehicle} fare={fare} image={image} setVehicleFound={setVehicleFound} rideData={rideData} cancelRide={cancelRide} />
              </div>
            </div>

            {/* Waiting for driver */}
            <div ref={waitingForDriverRef} style={{ maxHeight: 0, overflow: 'hidden' }}>
              <div className="px-4 pt-4 pb-8">
                <WaitingForDriver waitingForDriver={waitingForDriver} rideData={rideData} setWaitingForDriver={setWaitingForDriver} captainETA={captainETA} cancelRide={cancelRide} />
              </div>
            </div>
        </div>

        {/* AI Assistant Full Panel */}
        {activeTab === 'ai' && (
            <div className='h-[500px] w-full'>
                <AIAssistant role="passenger" />
            </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className='bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50'>
        <button onClick={() => setActiveTab('ride')} className={\lex flex-col items-center gap-1 w-16 \\}>
            <i className={\	ext-2xl \\}></i>
            <span className='text-[10px] font-semibold'>Ride</span>
        </button>
        
        <button onClick={() => setActiveTab('ai')} className={\lex flex-col items-center gap-1 w-16 \\}>
            <i className={\	ext-2xl \\}></i>
            <span className='text-[10px] font-semibold'>Ask AI</span>
        </button>

        <Link to='/user/history' className='flex flex-col items-center gap-1 w-16 text-gray-400 hover:text-gray-600'>
            <i className='text-2xl ri-history-line'></i>
            <span className='text-[10px] font-semibold'>History</span>
        </Link>

        <Link to='/user/logout' className='flex flex-col items-center gap-1 w-16 text-gray-400 hover:text-red-500'>
            <i className='text-2xl ri-user-line'></i>
            <span className='text-[10px] font-semibold'>Profile</span>
        </Link>
      </div>

    </div>
  )
}

export default Home\;

code = code.replace(returnRegex, newReturn);
fs.writeFileSync('frontend/src/pages/Home.jsx', code);
console.log('Done');
