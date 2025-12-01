'use client';

import React from 'react';

interface RestaurantListProps {
    places: google.maps.places.PlaceResult[];
    userLocation: { lat: number; lng: number } | null;
}

// Haversine formula to calculate distance in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

export default function RestaurantList({ places, userLocation }: RestaurantListProps) {
    const [expandedPlaceId, setExpandedPlaceId] = React.useState<string | null>(null);
    const [placeDetails, setPlaceDetails] = React.useState<Record<string, google.maps.places.PlaceResult>>({});
    const [isLoadingDetails, setIsLoadingDetails] = React.useState(false);

    const sortedPlaces = React.useMemo(() => {
        if (!places) return [];
        if (!userLocation) return places;

        return [...places].map(place => {
            const lat = place.geometry?.location?.lat();
            const lng = place.geometry?.location?.lng();
            let distance = 0;

            if (lat && lng) {
                distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
            }
            return { ...place, distance };
        }).sort((a, b) => a.distance - b.distance);
    }, [places, userLocation]);

    const handlePlaceClick = (placeId: string) => {
        if (expandedPlaceId === placeId) {
            setExpandedPlaceId(null);
            return;
        }

        setExpandedPlaceId(placeId);

        if (!placeDetails[placeId]) {
            setIsLoadingDetails(true);
            const service = new google.maps.places.PlacesService(document.createElement('div'));
            service.getDetails({
                placeId: placeId,
                fields: ['reviews', 'photos', 'formatted_phone_number', 'website', 'opening_hours']
            }, (place, status) => {
                setIsLoadingDetails(false);
                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                    // Sort reviews to prioritize Traditional Chinese
                    if (place.reviews) {
                        place.reviews.sort((a: any, b: any) => {
                            const aIsZh = a.language === 'zh-TW' || a.language === 'zh';
                            const bIsZh = b.language === 'zh-TW' || b.language === 'zh';
                            if (aIsZh && !bIsZh) return -1;
                            if (!aIsZh && bIsZh) return 1;
                            return 0;
                        });
                    }
                    setPlaceDetails(prev => ({ ...prev, [placeId]: place }));
                }
            });
        }
    };

    if (!userLocation) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center text-gray-600">
                <div className="text-6xl mb-4">📍</div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">歡迎使用！</h3>
                <p className="font-medium">請先設定您的位置，讓我們為您尋找附近的美食。</p>
            </div>
        );
    }

    if (!places || places.length === 0) {
        return (
            <div className="p-4 text-center text-gray-600 font-medium">
                尚未搜尋到店家，請先選擇食物類型。
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto bg-white p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">附近店家 ({places.length})</h2>
            <div className="space-y-4">
                {sortedPlaces.map((place: any) => {
                    const isExpanded = expandedPlaceId === place.place_id;
                    const details = placeDetails[place.place_id];

                    return (
                        <div
                            key={place.place_id}
                            className={`border border-gray-300 rounded-lg p-3 transition-all cursor-pointer ${isExpanded ? 'bg-blue-50 ring-2 ring-blue-600' : 'hover:bg-gray-50 hover:border-gray-400'}`}
                            onClick={() => handlePlaceClick(place.place_id)}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-900">{place.name}</h3>
                                <div className="flex flex-col items-end">
                                    {place.rating && (
                                        <span className="text-yellow-500 font-medium flex items-center">
                                            ★ {place.rating}
                                        </span>
                                    )}
                                    {place.price_level !== undefined && (
                                        <span className="text-gray-700 font-medium text-sm mt-1">
                                            {Array(place.price_level).fill('$').join('')}
                                        </span>
                                    )}
                                    {place.distance > 0 && (
                                        <span className="text-xs text-blue-700 font-bold mt-1">
                                            {place.distance < 1000
                                                ? `${Math.round(place.distance)}m`
                                                : `${(place.distance / 1000).toFixed(1)}km`}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{place.vicinity}</p>
                            <div className="mt-2 flex items-center justify-between">
                                {(() => {
                                    // 判斷營業狀態的邏輯
                                    const detail = placeDetails[place.place_id];
                                    let isOpen: boolean | null = null;
                                    let statusText = "營業時間未知";
                                    let statusColor = "text-gray-400";

                                    // 1. 優先使用詳細資料 (最準確)
                                    if (detail?.opening_hours) {
                                        const result = detail.opening_hours.isOpen ? detail.opening_hours.isOpen() : undefined;
                                        if (result !== undefined) {
                                            isOpen = result;
                                        }
                                    }

                                    // 2. 如果尚未確定 (null)，回退使用列表資料 (nearbySearch)
                                    if (isOpen === null && place.opening_hours) {
                                        // 先嘗試使用 isOpen() (Google 建議的新方法)
                                        if (place.opening_hours.isOpen) {
                                            try {
                                                const result = place.opening_hours.isOpen();
                                                if (result !== undefined) {
                                                    isOpen = result;
                                                }
                                            } catch (e) {
                                                // isOpen() 有時會報錯，忽略並繼續嘗試 open_now
                                            }
                                        }

                                        // 如果 isOpen() 失敗或未定義，才使用 open_now (會產生 Console 警告，但作為最後手段)
                                        // @ts-ignore: open_now is deprecated
                                        if (isOpen === null && place.opening_hours.open_now !== undefined) {
                                            // @ts-ignore
                                            isOpen = place.opening_hours.open_now;
                                        }
                                    }

                                    if (isOpen === true) {
                                        statusText = "營業中";
                                        statusColor = "text-green-600";
                                    } else if (isOpen === false) {
                                        statusText = "休息中";
                                        statusColor = "text-red-600";
                                    }

                                    return (
                                        <span className={`text-sm font-bold ${statusColor}`}>
                                            {statusText}
                                        </span>
                                    );
                                })()}

                                {place.user_ratings_total && (
                                    <span className="text-xs text-gray-500 font-medium">
                                        ({place.user_ratings_total} 則評論)
                                    </span>
                                )}
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-gray-300" onClick={(e) => e.stopPropagation()}>
                                    {isLoadingDetails && !details ? (
                                        <div className="text-center text-gray-600 py-4 font-medium">載入詳細資訊中...</div>
                                    ) : details ? (
                                        <div className="space-y-4">
                                            {/* Photos */}
                                            {details.photos && details.photos.length > 0 && (
                                                <div className="flex gap-2 overflow-x-auto pb-2">
                                                    {details.photos.slice(0, 5).map((photo: any, index: number) => (
                                                        <img
                                                            key={index}
                                                            src={photo.getUrl({ maxWidth: 200, maxHeight: 200 })}
                                                            alt={`Store photo ${index + 1}`}
                                                            className="h-32 w-32 object-cover rounded-lg flex-shrink-0"
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* Info */}
                                            <div className="text-sm text-gray-800 space-y-1 font-medium">
                                                {details.formatted_phone_number && (
                                                    <p>📞 {details.formatted_phone_number}</p>
                                                )}
                                                {details.website && (
                                                    <a href={details.website} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline block">
                                                        🌐 官方網站
                                                    </a>
                                                )}
                                            </div>

                                            {/* Reviews */}
                                            {details.reviews && details.reviews.length > 0 && (
                                                <div>
                                                    <h4 className="font-bold text-gray-900 mb-2">最新評論</h4>
                                                    <div className="space-y-3">
                                                        {details.reviews.slice(0, 3).map((review: any, index: number) => (
                                                            <div key={index} className="bg-white p-3 rounded border border-gray-200 text-sm">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <img src={review.profile_photo_url} alt={review.author_name} className="w-6 h-6 rounded-full" />
                                                                    <span className="font-bold">{review.author_name}</span>
                                                                    <span className="text-yellow-500">★ {review.rating}</span>
                                                                </div>
                                                                <p className="text-gray-800 line-clamp-3">{review.text}</p>
                                                                <span className="text-xs text-gray-500 mt-1 block">{review.relative_time_description}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="pt-2">
                                                <button
                                                    onClick={() => {
                                                        if (place.name) {
                                                            const query = encodeURIComponent(place.name);
                                                            const placeId = place.place_id ? `&query_place_id=${place.place_id}` : '';
                                                            window.open(`https://www.google.com/maps/search/?api=1&query=${query}${placeId}`, '_blank');
                                                        }
                                                    }}
                                                    className="w-full bg-blue-700 text-white py-2 rounded-lg font-bold hover:bg-blue-800 transition-colors border border-blue-800"
                                                >
                                                    在 Google Maps 開啟
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-rose-600 py-2 font-bold">無法載入詳細資訊</div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
