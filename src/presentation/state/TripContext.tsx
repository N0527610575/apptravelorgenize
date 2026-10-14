import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ContextState, TravelPhase } from '../../core/types/ContextState';
import { Trip } from '../../core/types/Trip';
import { TravelDocument, DocumentCategory } from '../../core/types/Document';
import { DatabaseService } from '../../core/database/DatabaseService';
import { ContextStateMachine, SensorDataInput } from '../../services/sensors/ContextStateMachine';
import { BarometerService } from '../../services/sensors/BarometerService';
import { MotionService } from '../../services/sensors/MotionService';
import { LocationService } from '../../services/sensors/LocationService';
import { DeepFileScanner } from '../../services/ingestion/DeepFileScanner';

interface TripContextType {
  contextState: ContextState;
  activeTrip: Trip | null;
  documents: TravelDocument[];
  setActivePassenger: (passengerId: string) => void;
  updatePhase: (phase: TravelPhase) => void;
  addDocument: (doc: TravelDocument) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  scanFilesNow: () => Promise<void>;
  simulateSensors: (input: SensorDataInput) => void;
  toggleBarcodeView: () => void;
  addNewPassenger: (fullName: string, shortName: string, seat: string) => void;
  resetSimulation: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contextState, setContextState] = useState<ContextState>({
    currentPhase: 'BOARDING_GATE',
    isBarcodeHeroVisible: true,
    activePassengerId: 'pass_1',
    toastMessage: 'שער העלייה נפתח. נא להכין דרכונים וכרטיסים פתוחים.',
    isMoving: false,
    highlightedSeat: '27E',
  });

  const [activeTrip, setActiveTrip] = useState<Trip | null>({
    id: 'trip_rome',
    title: 'חופשה ברומא',
    isActive: true,
    anchor: {
      departureDate: '2026-10-15T10:00:00Z',
      scanWindowStartDate: '2025-10-15T00:00:00Z',
      returnDate: '2026-10-22T20:00:00Z',
    },
    flights: [
      {
        flightNumber: 'LY385',
        airline: 'אל על (EL AL)',
        origin: {
          code: 'TLV',
          name: 'בן גוריון (טרמינל 3)',
          terminal: '3',
          coordinates: { latitude: 32.0055, longitude: 34.8854 },
        },
        destination: {
          code: 'FCO',
          name: 'פיומיצ׳ינו רומא',
          terminal: '1',
          coordinates: { latitude: 41.8003, longitude: 12.2389 },
        },
        scheduledDeparture: '2026-10-15T10:00:00Z',
        scheduledArrival: '2026-10-15T13:45:00Z',
        gate: 'B22',
        baggageBelt: 'מסוע 8',
      },
    ],
    passengers: [
      { id: 'pass_1', fullName: 'נחמן חסון', shortName: 'נחמן', isPrimaryUser: true, currentSeatNumber: '27E' },
      { id: 'pass_2', fullName: 'שולמית חיה', shortName: 'שולמית', isPrimaryUser: false, currentSeatNumber: '27F' },
    ],
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [documents, setDocuments] = useState<TravelDocument[]>([]);

  // Services
  const stateMachineRef = useRef(new ContextStateMachine('trip_rome'));
  const barometerRef = useRef(new BarometerService());
  const motionRef = useRef(new MotionService());
  const locationRef = useRef(new LocationService());

  useEffect(() => {
    const initDatabaseAndSensors = async () => {
      try {
        await DatabaseService.init();
        const storedTrip = await DatabaseService.getActiveTrip();
        if (storedTrip) {
          setActiveTrip(storedTrip);
          const storedDocs = await DatabaseService.getDocumentsByTrip(storedTrip.id);
          if (storedDocs && storedDocs.length > 0) {
            setDocuments(storedDocs);
          } else {
            // Seed initial demo documents
            await seedDemoDocuments(storedTrip.id);
          }
        } else if (activeTrip) {
          await DatabaseService.saveTrip(activeTrip);
          await seedDemoDocuments(activeTrip.id);
        }

        await barometerRef.current.startMonitoring();
        await motionRef.current.startMonitoring();
        await locationRef.current.requestPermissions();
      } catch (err) {
        console.warn('[TripContext] אתחול שירותים מקומיים הושלם עם הערות:', err);
      }
    };

    initDatabaseAndSensors();

    return () => {
      barometerRef.current.stopMonitoring();
      motionRef.current.stopMonitoring();
      locationRef.current.stopGeofencing();
    };
  }, []);

  const seedDemoDocuments = async (tripId: string) => {
    const defaultDocs: TravelDocument[] = [
      {
        id: 'doc_pass_1',
        tripId,
        passengerId: 'pass_1',
        title: 'כרטיס עלייה למטוס - נחמן',
        category: 'flight',
        localFilePath: 'boarding_pass_nachman.pdf',
        mimeType: 'application/pdf',
        barcode: {
          format: 'PDF417',
          rawData: 'M1HASSON/NACHMAN       EABC123 TLVFCOLY 0385 288Y027E0048 100',
          passengerName: 'Nachman Hasson',
          seatNumber: '27E',
          flightNumber: 'LY385',
        },
        trigger: { type: 'flight_phase', isActive: true, flightPhaseTrigger: 'boarding' },
        isArchived: false,
        createdAt: new Date().toISOString(),
        source: 'auto_file_scan',
      },
      {
        id: 'doc_pass_2',
        tripId,
        passengerId: 'pass_2',
        title: 'כרטיס עלייה למטוס - שולמית',
        category: 'flight',
        localFilePath: 'boarding_pass_shulamit.pdf',
        mimeType: 'application/pdf',
        barcode: {
          format: 'PDF417',
          rawData: 'M1HAYA/SHULAMIT       EABC123 TLVFCOLY 0385 288Y027F0049 100',
          passengerName: 'Shulamit Haya',
          seatNumber: '27F',
          flightNumber: 'LY385',
        },
        trigger: { type: 'flight_phase', isActive: true, flightPhaseTrigger: 'boarding' },
        isArchived: false,
        createdAt: new Date().toISOString(),
        source: 'auto_file_scan',
      },
      {
        id: 'doc_hotel_rome',
        tripId,
        title: 'אישור הזמנה - Rome Marriott Hotel',
        category: 'hotel',
        localFilePath: 'marriott_voucher.pdf',
        mimeType: 'application/pdf',
        trigger: {
          type: 'geofence',
          isActive: true,
          locationGeofence: { latitude: 41.9069, longitude: 12.4916, radiusMeters: 200, name: 'Rome Marriott Hotel' },
        },
        isArchived: false,
        createdAt: new Date().toISOString(),
        source: 'auto_file_scan',
      },
    ];

    for (const d of defaultDocs) {
      await DatabaseService.saveDocument(d);
    }
    setDocuments(defaultDocs);
  };

  const setActivePassenger = (passengerId: string) => {
    const passenger = activeTrip?.passengers.find((p) => p.id === passengerId);
    setContextState((prev) => ({
      ...prev,
      activePassengerId: passengerId,
      highlightedSeat: passenger?.currentSeatNumber || prev.highlightedSeat,
    }));
  };

  const updatePhase = (phase: TravelPhase) => {
    let isBarcodeHeroVisible = false;
    let toastMessage: string | undefined = undefined;

    switch (phase) {
      case 'IDLE_PRE_TRIP':
        toastMessage = 'הטיול הבא מתקרב. כל המסמכים שמורים בכספת.';
        break;
      case 'AT_DEPARTURE_AIRPORT':
        toastMessage = 'הגעת לנתב״ג. שער הטיסה הוא B22.';
        break;
      case 'BOARDING_GATE':
        isBarcodeHeroVisible = true;
        toastMessage = 'שער העלייה נפתח. נא להכין דרכונים וכרטיסים פתוחים.';
        break;
      case 'WALKING_JET_BRIDGE':
        toastMessage = 'הליכה בשרוול המטוס. מושבך ממתין בשורה 27.';
        break;
      case 'FINDING_SEAT':
        toastMessage = 'טיסה נעימה! מספר המושב שלך מוצג על המסך בגדול.';
        break;
      case 'IN_FLIGHT':
        toastMessage = 'מצב טיסה פעיל. נעדכן אותך בנחיתה בפיומיצ׳ינו.';
        break;
      case 'LANDED_AT_DESTINATION':
        toastMessage = 'ברוכים הבאים לרומא! שובר המלון והוראות הניווט מוכנים.';
        break;
      case 'POST_TRIP':
        toastMessage = 'סיום הנסיעה. מקווים שנהניתם בחופשה!';
        break;
    }

    setContextState((prev) => ({
      ...prev,
      currentPhase: phase,
      isBarcodeHeroVisible,
      toastMessage,
    }));
  };

  const simulateSensors = (input: SensorDataInput) => {
    if (!activeTrip) return;
    const newState = stateMachineRef.current.evaluateState(input, activeTrip);
    const passenger = activeTrip.passengers.find((p) => p.id === contextState.activePassengerId);

    setContextState((prev) => ({
      ...prev,
      ...newState,
      highlightedSeat: passenger?.currentSeatNumber,
    }));
  };

  const toggleBarcodeView = () => {
    setContextState((prev) => ({
      ...prev,
      isBarcodeHeroVisible: !prev.isBarcodeHeroVisible,
    }));
  };

  const addDocument = async (doc: TravelDocument) => {
    await DatabaseService.saveDocument(doc);
    setDocuments((prev) => [...prev.filter((d) => d.id !== doc.id), doc]);
  };

  const deleteDocument = async (id: string) => {
    await DatabaseService.deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const scanFilesNow = async () => {
    if (!activeTrip) return;
    try {
      const newDocs = await DeepFileScanner.processAndIngestFiles(activeTrip.id, activeTrip.anchor);
      if (newDocs.length > 0) {
        setDocuments((prev) => {
          const map = new Map(prev.map((d) => [d.id, d]));
          newDocs.forEach((d) => map.set(d.id, d));
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.error('[TripContext] שגיאה בסריקת קבצים:', err);
    }
  };

  const addNewPassenger = (fullName: string, shortName: string, seat: string) => {
    if (!activeTrip) return;
    const newPassId = `pass_${Date.now()}`;
    const newPassenger = {
      id: newPassId,
      fullName,
      shortName,
      isPrimaryUser: false,
      currentSeatNumber: seat,
    };
    const updatedTrip = {
      ...activeTrip,
      passengers: [...activeTrip.passengers, newPassenger],
    };
    setActiveTrip(updatedTrip);
    DatabaseService.saveTrip(updatedTrip);

    // Create a boarding pass doc for this passenger
    const newDoc: TravelDocument = {
      id: `doc_${newPassId}`,
      tripId: activeTrip.id,
      passengerId: newPassId,
      title: `כרטיס עלייה למטוס - ${shortName}`,
      category: 'flight',
      localFilePath: `ticket_${newPassId}.pdf`,
      mimeType: 'application/pdf',
      barcode: {
        format: 'PDF417',
        rawData: `M1${fullName.toUpperCase().replace(/\s+/g, '/')}/E...`,
        passengerName: fullName,
        seatNumber: seat,
        flightNumber: 'LY385',
      },
      trigger: { type: 'flight_phase', isActive: true, flightPhaseTrigger: 'boarding' },
      isArchived: false,
      createdAt: new Date().toISOString(),
      source: 'manual_upload',
    };
    addDocument(newDoc);
  };

  const resetSimulation = () => {
    updatePhase('BOARDING_GATE');
    setContextState((prev) => ({
      ...prev,
      currentPhase: 'BOARDING_GATE',
      isBarcodeHeroVisible: true,
      activePassengerId: activeTrip?.passengers[0]?.id || 'pass_1',
      toastMessage: 'שער העלייה נפתח. נא להכין דרכונים וכרטיסים פתוחים.',
      highlightedSeat: activeTrip?.passengers[0]?.currentSeatNumber || '27E',
    }));
  };

  return (
    <TripContext.Provider
      value={{
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
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTravelContext = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTravelContext must be used within a TripProvider');
  }
  return context;
};
