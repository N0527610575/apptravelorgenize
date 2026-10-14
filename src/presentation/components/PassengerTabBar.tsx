/**
 * @file PassengerTabBar.tsx
 * @description
 * רכיב ניווט מהיר בין נוסעים (Web Tab Bar).
 * נועד למנוע לחץ בזמן סריקת הכרטיסים בשער העלייה למטוס.
 * הרכיב מציג סרגל אופקי עם השמות הקצרים של כל הנוסעים המקושרים לאותה נסיעה.
 * לחיצה על טאב מעדכנת את הנוסע הפעיל, ומשנה מיידית את הברקוד שמוצג במסך המרכזי.
 */

import React from 'react';
import { Passenger } from '../../core/types/Passenger';
import { User, UserPlus } from 'lucide-react';

interface PassengerTabBarProps {
  passengers: Passenger[];
  activePassengerId: string | undefined;
  onPassengerSelect: (passengerId: string) => void;
  onAddPassenger?: () => void;
}

export const PassengerTabBar: React.FC<PassengerTabBarProps> = ({
  passengers,
  activePassengerId,
  onPassengerSelect,
  onAddPassenger,
}) => {
  if (!passengers || passengers.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto my-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          מעבר מהיר בין כרטיסי נוסעים ({passengers.length})
        </span>
        {onAddPassenger && (
          <button
            onClick={onAddPassenger}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            הוסף נוסע
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
        {passengers.map((passenger) => {
          const isActive = passenger.id === activePassengerId;

          return (
            <button
              key={passenger.id}
              onClick={() => onPassengerSelect(passenger.id)}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm ${
                isActive
                  ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-600 scale-[1.02]'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex flex-col items-start text-right">
                <div className="flex items-center gap-1.5">
                  <span>{passenger.shortName}</span>
                  {passenger.isPrimaryUser && (
                    <span
                      title="נוסע ראשי"
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-emerald-300' : 'bg-emerald-500'
                      }`}
                    />
                  )}
                </div>
                {passenger.currentSeatNumber && (
                  <span
                    className={`text-[11px] font-mono font-medium ${
                      isActive ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    מושב {passenger.currentSeatNumber}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};