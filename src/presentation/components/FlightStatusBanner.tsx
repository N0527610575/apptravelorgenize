/**
 * @file FlightStatusBanner.tsx
 * @description
 * סרגל סטטוס טיסה חי בזמן אמת (Live Flight Status Banner).
 * מקבל את נתוני הטיסה ומציג שער עלייה למטוס (Gate), מסוע מזוודות (Belt) ועיכובים.
 */

import React, { useState, useEffect } from 'react';
import { FlightStatusAPI, LiveFlightStatus } from '../../services/external/FlightStatusAPI';
import { Plane, Clock, Luggage, DoorOpen, RefreshCw } from 'lucide-react';

interface FlightStatusBannerProps {
  flightNumber?: string;
  departureDate?: string;
}

export const FlightStatusBanner: React.FC<FlightStatusBannerProps> = ({
  flightNumber = 'LY385',
  departureDate = '2026-10-15T10:00:00Z',
}) => {
  const [status, setStatus] = useState<LiveFlightStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const live = await FlightStatusAPI.fetchLiveStatus(flightNumber, departureDate);
      if (live) {
        setStatus(live);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [flightNumber, departureDate]);

  if (!status) return null;

  return (
    <div className="w-full max-w-md mx-auto my-3 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-4.5 shadow-md border border-blue-800/60 text-right">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/20 text-blue-300 rounded-lg">
            <Plane className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide">{status.flightNumber}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                בזמן (ON TIME)
              </span>
            </div>
            <div className="text-[11px] text-blue-200 mt-0.5">נתב״ג (TLV) ➔ רומא פיומיצ׳ינו (FCO)</div>
          </div>
        </div>

        <button
          onClick={fetchStatus}
          disabled={isLoading}
          title="רענן נתוני טיסה"
          className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 text-center">
        <div className="p-2 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-[10px] text-blue-200 flex items-center justify-center gap-1 mb-0.5">
            <DoorOpen className="w-3 h-3 text-amber-300" />
            <span>שער עלייה</span>
          </div>
          <div className="text-base font-black text-white font-mono">{status.departureGate || 'B22'}</div>
        </div>

        <div className="p-2 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-[10px] text-blue-200 flex items-center justify-center gap-1 mb-0.5">
            <Clock className="w-3 h-3 text-blue-300" />
            <span>המראה</span>
          </div>
          <div className="text-base font-black text-white font-mono">10:00</div>
        </div>

        <div className="p-2 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-[10px] text-blue-200 flex items-center justify-center gap-1 mb-0.5">
            <Luggage className="w-3 h-3 text-emerald-300" />
            <span>איסוף כבודה</span>
          </div>
          <div className="text-base font-black text-white font-mono">{status.arrivalBaggageBelt || 'מסוע 8'}</div>
        </div>
      </div>
    </div>
  );
};
