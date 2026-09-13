const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Home.jsx', 'utf8');

const new_return = `  return (
    <div className='h-[100dvh] flex flex-col bg-gray-50'>
      
      {/* Top Bar */}
      <div className='absolute p-4 top-0 flex items-center justify-between w-full z-[500] pointer-events-none'>
        <div className='flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-2xl shadow-md pointer-events-auto'>
          <div className='w-7 h-7 rounded-lg bg-[#0f172a] flex items-center justify-center'>
            <svg width='16' height='16' viewBox='0 0 22 22' fill='none'>
                <path d='M4 11L11 4L18 11' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                <path d='M11 4V19' stroke='white' strokeWidth='2' strokeLinecap='round'/>
            </svg>
          </div>
          <span className='font-black text-[#0f172a] text-lg tracking-tight'>Sawari</span>
        </div>
        
        <div className='flex items-center gap-2 pointer-events-auto'>
            <button className='w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-[#0f172a] hover:bg-gray-50 transition-colors'>
                <i className="ri-notification-3-line text-lg"></i>
            </button>
        </div>
      </div>

      {/* Map Section */}
      <div className='flex-1 min-h-0 relative'>
        <LiveTracking location={location} mapCenter={mapCenter} route={route} captainLocation={captainLocation} 
          pickupLocation={pickupCoordinates} destinationLocation={destinationCoordinates}
        />
        
        {/* Quick actions over map */}
        <div className='absolute right-4 bottom-6 z-[400] flex flex-col gap-3 pointer-events-auto'>
            <button 
                onClick={async () => {
                  if (navigator.geolocation) {
                    setIsFetchingLocation(true);
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        try {
                          const res = await axios.get(\`\${import.meta.env.VITE_BASE_URL}/maps/get-address?lat=\${lat}&lng=\${lng}\`, { 
                            headers: { Authorization: \`Bearer \${localStorage.getItem('user-token')}\` },
                            withCredentials: true 
                          });
                          if (res.data.address) {
                            setPickup(res.data.address);
                            setPickupCoordinates({ lat, lng });
                            setMapCenter([lat, lng]);
                            setActive("destination");
                          }
                        } catch (error) {
                          console.error("Error fetching address:", error);
                        } finally {
                          setIsFetchingLocation(false);
                        }
                      },
                      (error) => {
                        console.error("Geolocation error:", error);
                        setIsFetchingLocation(false);
                      }
                    );
                  }
                }}
                className='w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-[#0f172a] hover:bg-gray-50 transition-colors'
            >
                {isFetchingLocation ? <i className="ri-loader-4-line text-lg animate-spin"></i> : <i className="ri-focus-3-line text-lg"></i>}
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='bg-white w-full shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-3xl z-10 flex flex-col relative shrink-0'>
        
        {/* Ride Flow Panels */}
        <div style={{ display: activeTab === 'ride' ? 'block' : 'none' }}>
            
            {/* Loading Overlay for route & fare */}
            {isFindingTrip && (
              <div className='absolute inset-0 bg-white/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center rounded-t-3xl'>
                  <div className='w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4'></div>
                  <p className='text-[#0f172a] font-semibold animate-pulse'>Finding best routes & fares...</p>
              </div>
            )}

            {/* Search form */}
            <div ref={searchFormRef} style={{ maxHeight: 500, overflow: 'hidden' }}>
              <div className='px-6 pt-6 pb-4 relative'>
                <h5 ref={pannelCloseRef} onClick={() => setPannelOpen(false)} className='absolute opacity-0 right-6 top-6 text-2xl cursor-pointer z-10 text-gray-400 hover:text-[#0f172a] transition-colors'>
                  <i className="ri-arrow-down-s-line"></i>
                </h5>
                <h4 className='text-2xl font-bold text-[#0f172a] mb-5 tracking-tight'>Where to?</h4>
                <form onSubmit={submitHandler} className='space-y-3 relative'>
                  <div className="absolute left-[22px] top-[24px] bottom-[24px] w-0.5 bg-gray-200 z-10"></div>
                  
                  <div className='relative flex items-center'>
                      <div className='absolute left-4 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)] z-20'></div>
                      <input className="bg-gray-50 border border-gray-100 px-12 py-3.5 text-[15px] font-medium text-[#0f172a] rounded-2xl w-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 outline-none" type="text" placeholder="Current location" value={pickup} onChange={(e) => { setPickup(e.target.value); setActive("pickup"); }} onClick={() => setPannelOpen(true)} />
                  </div>
                  
                  <div className='relative flex items-center'>
                      <div className='absolute left-4 w-3 h-3 rounded-sm bg-[#0f172a] z-20'></div>
                      <input className="bg-gray-50 border border-gray-100 px-12 py-3.5 text-[15px] font-medium text-[#0f172a] rounded-2xl w-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 outline-none" type="text" placeholder="Enter destination" value={destination} onChange={(e) => { setDestination(e.target.value); setActive("destination"); }} onClick={() => setPannelOpen(true)} />
                  </div>
                </form>
              </div>
            </div>

            {/* Location suggestions */}
            <div ref={panelRef} style={{ maxHeight: 0, overflow: 'hidden' }}>
              <div className="px-4 pb-4 border-t border-gray-100">
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
                <LookingForDriver setConfirmRidePanel={setConfirmRidePanel} setvechiclePannel={setvechiclePannel} active={active} pickup={pickup} destination={destination} selectedVehicle={selectedVehicle} fare={fare} image={image} setVehicleFound={setVehicleFound} rideData={rideData} />
              </div>
            </div>

            {/* Waiting for driver */}
            <div ref={waitingForDriverRef} style={{ maxHeight: 0, overflow: 'hidden' }}>
              <div className="px-4 pt-4 pb-8">
                <WaitingForDriver waitingForDriver={waitingForDriver} rideData={rideData} setWaitingForDriver={setWaitingForDriver} />
              </div>
            </div>
        </div>

        {/* AI Assistant Full Panel */}
        {activeTab === 'ai' && (
            <div className='h-[400px] w-full'>
                <AIAssistant />
            </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className='bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-[800]'>
        
        <button 
            onClick={() => setActiveTab('ride')} 
            className={\`flex flex-col items-center gap-1 w-16 transition-colors \${activeTab === 'ride' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}\`}
        >
            <i className={\`text-2xl \${activeTab === 'ride' ? 'ri-car-fill' : 'ri-car-line'}\`}></i>
            <span className='text-[10px] font-semibold'>Ride</span>
        </button>
        
        <button 
            onClick={() => setActiveTab('ai')} 
            className={\`flex flex-col items-center gap-1 w-16 transition-colors \${activeTab === 'ai' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}\`}
        >
            <i className={\`text-2xl \${activeTab === 'ai' ? 'ri-robot-2-fill' : 'ri-robot-2-line'}\`}></i>
            <span className='text-[10px] font-semibold'>Ask AI</span>
        </button>

        <Link to='/user/history' className='flex flex-col items-center gap-1 w-16 text-gray-400 hover:text-gray-600 transition-colors'>
            <i className='text-2xl ri-history-line'></i>
            <span className='text-[10px] font-semibold'>History</span>
        </Link>

        <Link to='/user/profile' className='flex flex-col items-center gap-1 w-16 text-gray-400 hover:text-gray-600 transition-colors'>
            <i className='text-2xl ri-user-3-line'></i>
            <span className='text-[10px] font-semibold'>Profile</span>
        </Link>
      </div>

    </div>
  )
}

export default Home`;

// Inject state declarations
if (!code.includes('activeTab')) {
  code = code.replace(
    /const \[pannelOpen, setPannelOpen\] = useState\(false\);/,
    `const [activeTab, setActiveTab] = useState('ride');
  const [isFindingTrip, setIsFindingTrip] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [pannelOpen, setPannelOpen] = useState(false);`
  );
}

// Ensure AIAssistant is imported
if (!code.includes('AIAssistant')) {
  code = code.replace(/import \{ useGSAP \} from '@gsap\/react';/, `import { useGSAP } from '@gsap/react';\nimport AIAssistant from '../components/AIAssistant';`);
}

// Replace the return block
const returnRegex = /return \(\s*<div className='h-\[100dvh\] flex flex-col'>[\s\S]*$/;
code = code.replace(returnRegex, new_return);


// Also let's reapply the findTrip and fetchRoute fixes because they got reverted too!
code = code.replace(
  /const findTrip = async \(\) => \{[\s\S]*?setFare\(res\.data\.fare\);\n      console\.log\(res\)\n    \} catch \(error\) \{\n\n    \}\n  \}/,
  `const findTrip = async () => {
    if (!destinationCoordinates && !pickupCoordinates) {
      return
    }
    setIsFindingTrip(true);
    try {
      const res = await axios.get(\`\${import.meta.env.VITE_BASE_URL}/rides/get-fare\`, {
        params: {
          pickup: pickup,
          destination: destination
        },
        headers: {
          Authorization: \`Bearer \${localStorage.getItem('user-token')}\`
        },
        withCredentials: true
      })
      setFare(res.data.fare);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFindingTrip(false);
    }
  }`
);

code = code.replace(
  /const fetchRoute = async \(\) => \{[\s\S]*?console\.log\(\"Fetching Route\"\);[\s\S]*?setRoute\(leafletRoute\);\n    \} catch \(error\) \{\n      console\.error\(\"Error fetching route\", error\);\n    \}\n  \};/,
  `const fetchRoute = async () => {
    try {
      if (!pickupCoordinates || !destinationCoordinates) {
        return;
      }
      setIsFindingTrip(true);
      const response = await axios.get(
        \`\${import.meta.env.VITE_BASE_URL}/maps/get-route\`,
        {
          params: {
            pickup: \`\${pickupCoordinates.lat},\${pickupCoordinates.lng}\`,
            destination: \`\${destinationCoordinates.lat},\${destinationCoordinates.lng}\`,
          },
          headers: {
            Authorization: \`Bearer \${localStorage.getItem('user-token')}\`
          },
          withCredentials: true
        }
      );
      if (response.data && response.data.route) {
        const leafletRoute = response.data.route.coordinates;
        setRoute(leafletRoute);
      }
    } catch (error) {
      console.error('Error fetching route', error);
    } finally {
      setIsFindingTrip(false);
    }
  };`
);

fs.writeFileSync('frontend/src/pages/Home.jsx', code);
console.log('Home.jsx fully redesigned and loaded with loading states!');
