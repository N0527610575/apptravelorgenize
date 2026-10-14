/**
 * @file HeroDisplayCard.tsx
 * @description
 * הרכיב המרכזי של האפליקציה (Web) - מציג את המידע הקריטי ביותר בכל רגע נתון.
 * מתאים את עצמו אוטומטית למכונת המצבים: מקפיץ את הברקוד בשערי העלייה למטוס,
 * ומחליף אותו למספר המושב כשהמשתמש בשרוול או במטוס.
 */

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ContextState } from '../../core/types/ContextState';
import { TravelDocument } from '../../core/types/Document';
import { QrCode, Armchair, ShieldCheck, Plane, Sparkles } from 'lucide-react';

interface HeroDisplayCardProps {
  context: ContextState;
  activeDocument: TravelDocument | null;
  onToggleBarcodeView?: () => void;
}

export const HeroDisplayCard: React.FC<HeroDisplayCardProps> = ({
  context,
  activeDocument,
  onToggleBarcodeView
}) => {
  if (!activeDocument) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-200/80 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
          <Plane className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">אין מסמך פעיל כרגע</h3>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
          המסמכים שלך יקפצו כאן אוטומטית ברגע הנכון לפי חיישני המכשיר ושלבי הטיסה.
        </p>
      </div>
    );
  }

  const { isBarcodeHeroVisible, highlightedSeat } = context;

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-7 shadow-lg shadow-gray-200/60 border border-gray-100 transition-all duration-300">
      {/* כותרת הכרטיס המציגה למי שייך המסמך */}
      <div className="border-b border-gray-100 pb-4 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            {isBarcodeHeroVisible ? <QrCode className="w-4 h-4" /> : <Armchair className="w-4 h-4" />}
          </span>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            {activeDocument.title}
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          מאובטח Offline
        </span>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[280px]">
        {/* מצב 1: הצגת ברקוד ענק בבורדינג */}
        {isBarcodeHeroVisible && activeDocument.barcode ? (
          <div className="flex flex-col items-center w-full animate-in fade-in zoom-in-95 duration-200">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 bg-blue-50 px-3 py-1 rounded-full">
              הצג לסריקה בעמדת השער
            </span>

            <div className="relative p-5 bg-white rounded-2xl border-2 border-dashed border-blue-300 shadow-inner flex items-center justify-center group">
              <QRCodeSVG
                value={activeDocument.barcode.rawData || 'SMART-TRAVEL-BOARDING-PASS'}
                size={220}
                level="M"
                includeMargin={true}
              />
              <div className="absolute inset-0 rounded-2xl ring-4 ring-blue-500/10 pointer-events-none" />
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 font-mono">
              {activeDocument.barcode.flightNumber && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">
                  טיסה: <strong>{activeDocument.barcode.flightNumber}</strong>
                </span>
              )}
              {activeDocument.barcode.seatNumber && (
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                  מושב: {activeDocument.barcode.seatNumber}
                </span>
              )}
              <span className="text-gray-400">תקן IATA BCBP</span>
            </div>
          </div>
        ) : highlightedSeat ? (
          /* מצב 2: מושב ענק ובולט לתוך המטוס */
          <div className="flex flex-col items-center text-center animate-in fade-in duration-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              המושב שלך במטוס
            </span>
            <div className="my-2 py-2">
              <span className="text-8xl sm:text-9xl font-black text-blue-600 tracking-tight font-mono select-none drop-shadow-sm">
                {highlightedSeat}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-xl mt-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>תא עליון מעל השורה • גישה מהירה לשרוול</span>
            </div>
          </div>
        ) : (
          /* מצב 3: מידע כללי */
          <div className="flex flex-col items-center text-center text-gray-600 py-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-gray-800">המסמך שמור ומוכן לשימוש</p>
            <p className="text-xs text-gray-400 mt-1">מוצפן מקומית בכספת הנסיעות של המכשיר</p>
          </div>
        )}
      </div>

      {/* לחצן החלפה ידני לבדיקה או נוחות */}
      {onToggleBarcodeView && (
        <div className="mt-5 pt-3 border-t border-gray-100 flex justify-center">
          <button
            onClick={onToggleBarcodeView}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium py-1 px-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
          >
            {isBarcodeHeroVisible ? '⇄ הצג מספר מושב' : '⇄ הצג ברקוד לסריקה'}
          </button>
        </div>
      )}
    </div>
  );
};