/**
 * @file ContextSimulator.tsx
 * @description
 * פאנל סימולטור חיישנים ומכונת מצבים אינטראקטיבי.
 * מאפשר בדיקה והמחשה של יכולות המערכת: שינוי לחץ ברומטרי (דיחוס תא נוסעים),
 * כניסה ויציאה מגידור שדה התעופה (GPS Geofence), זיהוי הליכה בשרוול, וטיימר בורדינג.
 */

import React from 'react';
import { TravelPhase, ContextState } from '../../core/types/ContextState';
import { Gauge, Navigation, Activity, Clock, Play, RotateCcw, Compass } from 'lucide-react';

interface ContextSimulatorProps {
  currentPhase: TravelPhase;
  contextState: ContextState;
  onPhaseChange: (phase: TravelPhase) => void;
  onSimulateSensors: (input: {
    isAtAirport: boolean;
    minutesToDeparture: number;
    isPressureDropped: boolean;
    isWalking: boolean;
  }) => void;
  onReset: () => void;
}

const PHASES: Array<{ id: TravelPhase; label: string; desc: string; icon: string }> = [
  { id: 'IDLE_PRE_TRIP', label: '1. בבית / שגרה', desc: 'לפני הגעה לשדה', icon: '🏠' },
  { id: 'AT_DEPARTURE_AIRPORT', label: '2. בשדה התעופה', desc: 'הגעה לטרמינל (GPS)', icon: '🏢' },
  { id: 'BOARDING_GATE', label: '3. שער עלייה למטוס', desc: 'ברקוד ענק והתראת דרכון', icon: '🎫' },
  { id: 'WALKING_JET_BRIDGE', label: '4. הליכה בשרוול', desc: 'תנועת מד תאוצה', icon: '🚶' },
  { id: 'FINDING_SEAT', label: '5. איתור מושב', desc: 'מספר מושב ענק (27E)', icon: '💺' },
  { id: 'IN_FLIGHT', label: '6. באוויר (טיסה)', desc: 'ירידת לחץ ברומטרי', icon: '✈️' },
  { id: 'LANDED_AT_DESTINATION', label: '7. נחיתה ביעד', desc: 'הקפצת ניווט למלון/רכב', icon: '🛬' },
  { id: 'POST_TRIP', label: '8. סיום המסע', desc: 'חזרה לשגרה', icon: '🎒' },
];

export const ContextSimulator: React.FC<ContextSimulatorProps> = ({
  currentPhase,
  contextState,
  onPhaseChange,
  onSimulateSensors,
  onReset,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-6 shadow-md border border-gray-200 mt-6 text-right">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <Compass className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-bold text-gray-900 text-base">סימולטור חיישנים ומצבי מסע (Live State Machine)</h3>
            <p className="text-xs text-gray-500">בדוק כיצד האפליקציה מגיבה בזמן אמת לשינויים פיזיים</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          איפוס
        </button>
      </div>

      {/* בחירה מהירה לפי שלב טיסה */}
      <div className="mb-5">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2.5">
          שלבי מסע מובנים (לחץ למעבר מיידי):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PHASES.map((p) => {
            const isCurrent = p.id === currentPhase;
            return (
              <button
                key={p.id}
                onClick={() => onPhaseChange(p.id)}
                className={`p-3 rounded-2xl text-right transition-all flex flex-col justify-between cursor-pointer border ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-gray-50 border-gray-200/80 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-lg">{p.icon}</span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  )}
                </div>
                <div className="font-bold text-xs">{p.label}</div>
                <div className="text-[10px] text-gray-500 truncate mt-0.5">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* הדמיית אותות מחיישנים פיזיים */}
      <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-purple-600" />
          הפעלת טריגרים של חיישני המכשיר (Sensors Automation)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <button
            onClick={() =>
              onSimulateSensors({
                isAtAirport: true,
                minutesToDeparture: 30,
                isPressureDropped: false,
                isWalking: false,
              })
            }
            className="p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-xs transition-all text-right flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="font-bold text-gray-800">הגעה לשער (30 דק׳ לטיסה)</div>
              <div className="text-gray-500 text-[11px]">GPS בשדה + טיימר בורדינג ➔ מקפיץ ברקוד</div>
            </div>
            <Play className="w-4 h-4 text-blue-600 shrink-0 mr-2" />
          </button>

          <button
            onClick={() =>
              onSimulateSensors({
                isAtAirport: true,
                minutesToDeparture: -5,
                isPressureDropped: false,
                isWalking: false,
              })
            }
            className="p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-xs transition-all text-right flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="font-bold text-gray-800">ישיבה במטוס (חוסר תנועה)</div>
              <div className="text-gray-500 text-[11px]">עבר זמן המראה + עצירה ➔ מקפיץ מושב ענק</div>
            </div>
            <Play className="w-4 h-4 text-blue-600 shrink-0 mr-2" />
          </button>

          <button
            onClick={() =>
              onSimulateSensors({
                isAtAirport: false,
                minutesToDeparture: -60,
                isPressureDropped: true,
                isWalking: false,
              })
            }
            className="p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-xs transition-all text-right flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="font-bold text-gray-800">המראה (צניחת לחץ ברומטרי)</div>
              <div className="text-gray-500 text-[11px]">ירידה של 35 hPa בתא הנוסעים ➔ מצב טיסה</div>
            </div>
            <Play className="w-4 h-4 text-blue-600 shrink-0 mr-2" />
          </button>

          <button
            onClick={() =>
              onSimulateSensors({
                isAtAirport: false,
                minutesToDeparture: -240,
                isPressureDropped: false,
                isWalking: true,
              })
            }
            className="p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-xs transition-all text-right flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="font-bold text-gray-800">נחיתה ביעד (חזרת לחץ רגיל)</div>
              <div className="text-gray-500 text-[11px]">הלחץ התייצב ➔ הקפצת שובר מלון וניווט</div>
            </div>
            <Play className="w-4 h-4 text-blue-600 shrink-0 mr-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
