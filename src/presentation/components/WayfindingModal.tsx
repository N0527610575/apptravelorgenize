/**
 * @file WayfindingModal.tsx
 * @description
 * רכיב התמצאות ביעד וניווט (Wayfinding & Navigation) עבור Web.
 * מופיע לאחר הנחיתה (LANDED_AT_DESTINATION) ומציע עזרה בהגעה למלון או חברת השכרת רכב.
 */

import React, { useState } from 'react';
import { NavigationService } from '../../services/external/NavigationService';
import { TravelPhase } from '../../core/types/ContextState';
import { MapPin, Navigation, X, Building2, Car, Train, ExternalLink } from 'lucide-react';

export interface WayfindingTarget {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  type: 'hotel' | 'car_rental' | 'train';
}

interface WayfindingModalProps {
  currentPhase: TravelPhase;
  target?: WayfindingTarget;
  forceShowButton?: boolean;
}

export const WayfindingModal: React.FC<WayfindingModalProps> = ({
  currentPhase,
  target = {
    type: 'hotel',
    name: 'Rome Marriott Hotel',
    address: 'Via Veneto 125, Rome, Italy',
    latitude: 41.9069,
    longitude: 12.4916,
  },
  forceShowButton = false,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const isEligibleToShow =
    forceShowButton || currentPhase === 'LANDED_AT_DESTINATION' || currentPhase === 'POST_TRIP';

  if (!isEligibleToShow || !target) {
    return null;
  }

  const handleNavigatePress = async () => {
    if (target.latitude && target.longitude) {
      await NavigationService.navigateToCoordinates(target.latitude, target.longitude, target.name);
    } else if (target.address) {
      await NavigationService.navigateToAddress(target.address);
    }
  };

  const getTargetIcon = () => {
    switch (target.type) {
      case 'car_rental':
        return <Car className="w-6 h-6 text-amber-600" />;
      case 'train':
        return <Train className="w-6 h-6 text-purple-600" />;
      case 'hotel':
      default:
        return <Building2 className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-3 text-center">
      {/* כפתור הגישה הראשי */}
      <button
        onClick={() => setModalVisible(true)}
        className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Navigation className="w-5 h-5 animate-pulse" />
        <span>איך להגיע ליעד שלך? (ניווט והתמצאות)</span>
      </button>

      {/* חלון המודאל */}
      {isModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-right shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-bold text-gray-900">ניווט והתמצאות ביעד</h3>
              </div>
              <button
                onClick={() => setModalVisible(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-xl shadow-xs border border-gray-100 mt-0.5">
                  {getTargetIcon()}
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    היעד הבא שלך
                  </span>
                  <h4 className="text-lg font-bold text-gray-900 mt-0.5">{target.name}</h4>
                  {target.address && (
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{target.address}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleNavigatePress}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-5 h-5" />
                <span>הפעל ניווט עכשיו (Google Maps)</span>
              </button>

              <button
                onClick={() => setModalVisible(false)}
                className="w-full py-2.5 px-4 rounded-xl text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors cursor-pointer"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};