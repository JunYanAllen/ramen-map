'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

// 定義樣式
const containerStyle = {
    width: '100%',
    height: '100vh'
};

// 預設中心點 (台北車站)，若定位失敗會用到
const defaultCenter = {
    lat: 25.0478,
    lng: 121.5170
};

// Google Places 的 Library 需要在載入時宣告
// const libraries: ("places")[] = ["places"]; // Moved to page.tsx

interface MapProps {
    keyword: string;
    places: google.maps.places.PlaceResult[];
    onPlacesFound: (places: google.maps.places.PlaceResult[]) => void;
    customLocation?: { lat: number; lng: number } | null;
    radius?: number;
}

export default function RamenMap({ keyword, places, onPlacesFound, customLocation, radius = 500 }: MapProps) {
    // API Loader moved to page.tsx
    // const { isLoaded } = useJsApiLoader({ ... });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [currentLocation, setCurrentLocation] = useState(defaultCenter);
    const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);

    // 1. 取得使用者位置 (若無自訂位置)
    useEffect(() => {
        if (customLocation) {
            setCurrentLocation(customLocation);
            map?.panTo(customLocation);
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCurrentLocation(pos);
                    // 如果地圖已經載入，移動鏡頭到使用者位置
                    map?.panTo(pos);
                },
                () => {
                    console.error("Error: The Geolocation service failed.");
                }
            );
        }
    }, [map, customLocation]);

    // 2. 地圖載入後的 callback
    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    // 3. 搜尋附近的店家 (當 location, map 或 keyword 準備好時)
    useEffect(() => {
        if (map && currentLocation && keyword) {
            const service = new google.maps.places.PlacesService(map);

            const request: google.maps.places.PlaceSearchRequest = {
                location: currentLocation,
                radius: radius, // 使用傳入的半徑
                keyword: keyword, // 使用傳入的關鍵字
                type: 'restaurant'
            };

            service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    onPlacesFound(results);
                } else {
                    onPlacesFound([]); // 沒找到或錯誤時清空
                }
            });
        }
    }, [map, currentLocation, keyword, onPlacesFound, radius]);

    // if (!isLoaded) return <div>Loading Map...</div>; // Handled by parent

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentLocation}
            zoom={15}
            onLoad={onLoad}
            onUnmount={onUnmount}
        >
            {/* 顯示使用者當前位置 (藍色標記示意) */}
            <Marker
                position={currentLocation}
                label="我"
                icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 7,
                    fillColor: "#4285F4",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "white",
                }}
            />

            {/* 顯示店家標記 */}
            {places.map((place) => (
                <Marker
                    key={place.place_id}
                    position={place.geometry?.location || defaultCenter}
                    title={place.name}
                    onClick={() => setSelectedPlace(place)}
                />
            ))}

            {/* 點擊標記顯示資訊視窗 */}
            {selectedPlace && (
                <InfoWindow
                    position={selectedPlace.geometry?.location || defaultCenter}
                    onCloseClick={() => setSelectedPlace(null)}
                >
                    <div className="p-2 text-black">
                        <h2 className="font-bold text-lg">{selectedPlace.name}</h2>
                        <p>⭐ {selectedPlace.rating} ({selectedPlace.user_ratings_total})</p>
                        <p className="text-sm text-gray-600">{selectedPlace.vicinity}</p>
                        <p className={`text-sm font-bold ${selectedPlace.opening_hours?.isOpen() ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedPlace.opening_hours?.isOpen() ? '營業中' : '休息中'}
                        </p>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
}