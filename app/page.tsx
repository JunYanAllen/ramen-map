'use client';

import { useState, useEffect, useRef } from 'react';
import RamenMap from "@/components/Map";
import RestaurantList from "@/components/RestaurantList";
import { FOOD_OPTIONS, FoodOption } from "./data/foodOptions";
import { useJsApiLoader, Autocomplete, GoogleMap, Marker } from '@react-google-maps/api';
import Cookies from 'js-cookie';

const libraries: ("places")[] = ["places"];

interface UserLocation {
  lat: number;
  lng: number;
  address: string;
}

export default function Home() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries,
    language: "zh-TW",
  });

  const [displayFood, setDisplayFood] = useState<FoodOption | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodOption | null>(null);
  const [places, setPlaces] = useState<google.maps.places.PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Location State
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [searchRadius, setSearchRadius] = useState(500); // Default 0.5km
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Load location from cookie
  useEffect(() => {
    const savedLocation = Cookies.get('user_location');
    if (savedLocation) {
      try {
        setUserLocation(JSON.parse(savedLocation));
      } catch (e) {
        console.error("Failed to parse location cookie", e);
        setIsLocationModalOpen(true);
      }
    } else {
      setIsLocationModalOpen(true);
    }
  }, []);

  const handleRandomSelect = () => {
    if (!userLocation) {
      setIsLocationModalOpen(true);
      return;
    }
    setIsSearching(true);
    // 簡單的隨機效果動畫
    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * FOOD_OPTIONS.length);
      const randomFood = FOOD_OPTIONS[randomIndex];
      setDisplayFood(randomFood);
      count++;
      if (count > 10) {
        clearInterval(interval);
        setSelectedFood(randomFood); // 只有最後一次才設定搜尋關鍵字
        setIsSearching(false);
      }
    }, 100);
  };

  const updateLocation = (lat: number, lng: number, address?: string) => {
    const newLocation = { lat, lng, address: address || "地圖選定位置" };
    setUserLocation(newLocation);
    Cookies.set('user_location', JSON.stringify(newLocation), { expires: 365 });

    // Pan map if it exists
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
    }
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        updateLocation(
          place.geometry.location.lat(),
          place.geometry.location.lng(),
          place.formatted_address || place.name
        );
      }
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      // Reverse Geocoding
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          updateLocation(lat, lng, results[0].formatted_address);
        } else {
          updateLocation(lat, lng);
        }
      });
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        updateLocation(
          position.coords.latitude,
          position.coords.longitude,
          "目前位置"
        );
      });
    }
  };

  if (!isLoaded) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <main className="relative h-dvh w-full overflow-hidden flex flex-col md:flex-row">
      {/* 列表區 - 佔滿全螢幕 */}
      <div className="w-full h-full flex flex-col bg-white shadow-xl">
        {/* 控制區 */}
        <div className="p-6 bg-white z-20 shadow-sm">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <img src="/icon.png" alt="Logo" className="w-10 h-10 rounded-full shadow-sm object-cover" />
              <h1 className="text-2xl font-bold text-gray-800">今天吃什麼？</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="appearance-none bg-gray-100 border border-gray-200 text-gray-700 text-sm rounded-full py-2 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <option value={500}>500m</option>
                  <option value={1000}>1km</option>
                  <option value={1500}>1.5km</option>
                  <option value={3000}>3km</option>
                  <option value={5000}>5km</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>

              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full py-2 px-4 text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <span>📍</span>
                <span className="truncate max-w-[150px] md:max-w-[200px]">{userLocation ? userLocation.address : "設定位置"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRandomSelect}
              disabled={isSearching}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1 border border-blue-800"
            >
              {isSearching ? "選擇中..." : "🎲 隨機選擇"}
            </button>
            <div className="flex-1 text-center border-b-2 border-blue-500 pb-1 min-w-[150px]">
              <div className="text-xl font-bold text-gray-700">
                {displayFood ? displayFood.query : "請選擇"}
              </div>
              {displayFood && (
                <div className="text-sm text-gray-600 mt-1 font-medium">
                  {displayFood.category}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 列表區 */}
        <div className="flex-1 overflow-hidden relative">
          <RestaurantList places={places} userLocation={userLocation} />
        </div>
      </div>

      {/* 隱藏的地圖元件 (保留搜尋功能) */}
      <div className="hidden">
        <RamenMap
          keyword={selectedFood?.query || ""}
          places={places}
          onPlacesFound={setPlaces}
          customLocation={userLocation}
          radius={searchRadius}
        />
      </div>

      {/* 位置設定 Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl flex flex-col h-[85vh] relative">
            <button
              onClick={() => setIsLocationModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">設定您的位置</h2>
            <p className="text-gray-700 text-center mb-6">請選擇一種方式來設定搜尋中心</p>

            <div className="space-y-6 flex-1 flex flex-col overflow-y-auto px-2">

              {/* 選項 1: 系統定位 */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors">
                <div className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  使用系統定位
                </div>
                <button
                  onClick={handleUseCurrentLocation}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  📍 取得目前位置
                </button>
              </div>

              {/* 選項 2: 輸入地址 */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
                <div className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="bg-gray-200 text-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  輸入地址搜尋
                </div>
                <Autocomplete
                  onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                  onPlaceChanged={handlePlaceChanged}
                >
                  <input
                    type="text"
                    placeholder="例如：台北 101、信義區..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </Autocomplete>
              </div>

              {/* 選項 3: 地圖選點 */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors flex-1 flex flex-col min-h-[300px]">
                <div className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="bg-gray-200 text-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                  在地圖上選擇
                </div>
                <div className="flex-1 rounded-lg overflow-hidden border-2 border-gray-300 relative">
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={userLocation || { lat: 25.0330, lng: 121.5654 }} // Default to Taipei 101
                    zoom={15}
                    onClick={handleMapClick}
                    onLoad={map => { mapRef.current = map; }}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                    }}
                  >
                    {userLocation && (
                      <Marker position={userLocation} />
                    )}
                  </GoogleMap>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg text-sm font-bold text-gray-900 border border-gray-200 pointer-events-none whitespace-nowrap">
                    {userLocation ? "點擊地圖可更改位置" : "請點擊地圖選擇位置"}
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-4 border-t flex justify-between items-center mt-4">
              <div className="text-sm text-gray-700 truncate max-w-[60%]">
                <div>目前選擇：<span className="font-bold text-gray-900">{userLocation?.address || "尚未選擇"}</span></div>
                {userLocation && (
                  <div className="text-xs text-gray-500 mt-1 font-mono">
                    ({userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)})
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {userLocation && (
                  <button
                    onClick={() => setIsLocationModalOpen(false)}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow border border-blue-800"
                  >
                    確認使用此位置
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}