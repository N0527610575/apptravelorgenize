/**
 * @file MainCompanionScreen.tsx
 * @description
 * המסך הראשי של האפליקציה (Web Hub).
 * מאגד את כרטיס הגיבור (Hero Card), מעבר בין נוסעים (Passenger Tabs),
 * התמצאות ביעד (Wayfinding Modal), כספת מסמכים וסימולטור החיישנים.
 */

import React, { useState, useMemo } from 'react';
import { HeroDisplayCard } from '../components/HeroDisplayCard';
import { PassengerTabBar } from '../components/PassengerTabBar';
import { WayfindingModal, WayfindingTarget } from '../components/WayfindingModal';
import { FlightStatusBanner } from '../components/FlightStatusBanner';
import { ContextSimulator } from '../components/ContextSimulator';
import { DocumentVaultModal } from '../components/DocumentVaultModal';
import { useTravelContext } from '../state/TripContext';
import { TravelDocument, DocumentCategory } from '../../core/types/Document';
import {
  Plane,
  FolderLock,
  Sparkles,
  ShieldCheck,
  Bell,
  Search,
  CheckCircle2,
  X,
  Plus
} from 'lucide-react';

export const MainCompanionScreen: React.FC = () => {
  const {
    contextState,
    activeTrip,
    documents,
    setActivePassenger,
    updatePhase,
    addDocument,
    deleteDocument,
    scanFilesNow,
    simulateSensors,
    toggleBarcodeView,
    addNewPassenger,
    resetSimulation,
  } = useTravelContext();

  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isAddPassengerOpen, setIsAddPassengerOpen] = useState(false);
  const [newPassName, setNewPassName] = useState('');
  const [newPassShort, setNewPassShort] = useState('');
  const [newPassSeat, setNewPassSeat] = useState('');

  // Finding current passenger
  const currentPassenger = useMemo(() => {
    return (
      activeTrip?.passengers.find((p) => p.id === contextState.activePassengerId) ||
      activeTrip?.passengers[0]
    );
  }, [activeTrip?.passengers, contextState.activePassengerId]);

  // Finding current active document for this passenger or trip
  const activeDocument = useMemo<TravelDocument | null>(() => {
    if (!currentPassenger) return null;

    // Search in loaded documents for a boarding pass for this passenger
    const match = documents.find(
      (d) => d.category === 'flight' && d.passengerId === currentPassenger.id
    );

    if (match) return match;

    // Fallback document
    return {
      id: `doc_${currentPassenger.id}`,
      tripId: activeTrip?.id || 'trip_rome',
      passengerId: currentPassenger.id,
      title: `כרטיס עלייה למטוס - ${currentPassenger.shortName}`,
      category: 'flight',
      localFilePath: 'boarding_pass.pdf',
      mimeType: 'application/pdf',
      barcode: {
        format: 'PDF417',
        rawData: `M1${currentPassenger.fullName.toUpperCase().replace(/\s+/g, '/')}/EABC123 TLVFCOLY 0385 288Y0${currentPassenger.currentSeatNumber || '27E'}0048 100`,
        passengerName: currentPassenger.fullName,
        seatNumber: currentPassenger.currentSeatNumber || '27E',
        flightNumber: 'LY385',
      },
      trigger: { type: 'flight_phase', isActive: true },
      isArchived: false,
      createdAt: new Date().toISOString(),
      source: 'auto_file_scan',
    };
  }, [currentPassenger, documents, activeTrip?.id]);

  const hotelTarget: WayfindingTarget = useMemo(
    () => ({
      type: 'hotel',
      name: 'Rome Marriott Hotel',
      address: 'Via Veneto 125, Rome, Italy',
      latitude: 41.9069,
      longitude: 12.4916,
    }),
    []
  );

  const handleAddPassengerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassName.trim()) return;
    addNewPassenger(
      newPassName.trim(),
      newPassShort.trim() || newPassName.trim().split(' ')[0],
      newPassSeat.trim() || '27G'
    );
    setNewPassName('');
    setNewPassShort('');
    setNewPassSeat('');
    setIsAddPassengerOpen(false);
  };

  const handleManualUpload = (title: string, category: DocumentCategory, text: string) => {
    const docId = `doc_${Date.now()}`;
    const newDoc: TravelDocument = {
      id: docId,
      tripId: activeTrip?.id || 'trip_rome',
      title,
      category,
      localFilePath: `upload_${docId}.pdf`,
      mimeType: 'application/pdf',
      trigger: { type: 'time', isActive: true },
      isArchived: false,
      createdAt: new Date().toISOString(),
      source: 'manual_upload',
      extractedText: text,
      barcode:
        category === 'flight'
          ? {
              format: 'QR_CODE',
              rawData: `FLIGHT-TICKET-${docId}`,
              flightNumber: 'LY385',
              seatNumber: '28A',
            }
          : undefined,
    };
    addDocument(newDoc);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-gray-900 pb-16 font-sans">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base text-gray-900 leading-tight">
                  {activeTrip?.title || 'Smart Travel Companion'}
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  LY385
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                כספת מוצפנת מקומית • On-Device
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVaultOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FolderLock className="w-4 h-4 text-blue-600" />
              <span>כספת מסמכים</span>
              {documents.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {documents.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 pt-4">
        {/* Toast / Contextual Banner */}
        {contextState.toastMessage && (
          <div className="w-full max-w-md mx-auto mb-4 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="bg-gray-900 text-white text-xs sm:text-sm font-semibold py-3 px-4 rounded-2xl shadow-lg flex items-center justify-between gap-3 border border-gray-800">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400">
                  <Bell className="w-4 h-4" />
                </span>
                <span>{contextState.toastMessage}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono bg-white/10 px-2 py-0.5 rounded-full">
                {contextState.currentPhase}
              </span>
            </div>
          </div>
        )}

        {/* Live Flight Status */}
        <FlightStatusBanner
          flightNumber={activeTrip?.flights[0]?.flightNumber}
          departureDate={activeTrip?.anchor.departureDate}
        />

        {/* Hero Card */}
        <HeroDisplayCard
          context={{
            ...contextState,
            highlightedSeat: currentPassenger?.currentSeatNumber,
          }}
          activeDocument={activeDocument}
          onToggleBarcodeView={toggleBarcodeView}
        />

        {/* Passenger Tabs */}
        {activeTrip?.passengers && (
          <PassengerTabBar
            passengers={activeTrip.passengers}
            activePassengerId={contextState.activePassengerId}
            onPassengerSelect={setActivePassenger}
            onAddPassenger={() => setIsAddPassengerOpen(true)}
          />
        )}

        {/* Wayfinding Modal Trigger */}
        <WayfindingModal
          currentPhase={contextState.currentPhase}
          target={hotelTarget}
        />

        {/* Quick Actions (Vault Scan) */}
        <div className="w-full max-w-md mx-auto my-3 flex items-center justify-between bg-white/70 p-3 rounded-2xl border border-gray-200/60 text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>סריקה מקומית מאתרת מסמכים מחלון הטיסה</span>
          </div>
          <button
            onClick={scanFilesNow}
            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer hover:underline"
          >
            <Search className="w-3.5 h-3.5" />
            סרוק קבצים
          </button>
        </div>

        {/* State Machine Simulator */}
        <ContextSimulator
          currentPhase={contextState.currentPhase}
          contextState={contextState}
          onPhaseChange={updatePhase}
          onSimulateSensors={simulateSensors}
          onReset={resetSimulation}
        />
      </main>

      {/* Document Vault Modal */}
      <DocumentVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        documents={documents}
        onAddSampleDocs={scanFilesNow}
        onUploadDoc={handleManualUpload}
        onDeleteDoc={deleteDocument}
      />

      {/* Add Passenger Modal */}
      {isAddPassengerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-right shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-gray-900 text-base">הוספת נוסע לנסיעה</h3>
              <button
                onClick={() => setIsAddPassengerOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPassengerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">שם מלא באנגלית/עברית</label>
                <input
                  type="text"
                  value={newPassName}
                  onChange={(e) => setNewPassName(e.target.value)}
                  placeholder="למשל: דניאל חסון"
                  required
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">שם קצר בטאב</label>
                <input
                  type="text"
                  value={newPassShort}
                  onChange={(e) => setNewPassShort(e.target.value)}
                  placeholder="למשל: דניאל"
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">מספר מושב מוקצה</label>
                <input
                  type="text"
                  value={newPassSeat}
                  onChange={(e) => setNewPassSeat(e.target.value)}
                  placeholder="למשל: 27D"
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPassengerOpen(false)}
                  className="py-2 px-3 rounded-xl text-gray-600 hover:bg-gray-100"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
                >
                  הוסף נוסע
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};