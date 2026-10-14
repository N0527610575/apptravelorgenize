/**
 * @file DeepFileScanner.ts
 * @description
 * מנוע סריקת קבצים מקומית (On-Device File Scanner) מותאם לדפדפן/ווב.
 */

import { TripAnchor } from '../../core/types/Trip';
import { TravelDocument } from '../../core/types/Document';
import { LocalOCREngine } from '../processing/LocalOCREngine';
import { DatabaseService } from '../../core/database/DatabaseService';

export class DeepFileScanner {
  public static async processAndIngestFiles(tripId: string, anchor: TripAnchor): Promise<TravelDocument[]> {
    console.log(`[DeepFileScanner] סריקת מסמכים מקומית עבור טיול ${tripId}...`);
    // Sample discovered documents matching trip window
    const demoFiles = [
      {
        name: 'rome_marriott_hotel_confirmation.pdf',
        text: 'HOTEL RESERVATION CONFIRMATION\nRome Marriott Hotel\nCheck-in: 15/10/2026 Check-out: 22/10/2026\nGuest: Nachman Hasson\nAddress: Via Veneto 125, Rome'
      },
      {
        name: 'avis_car_rental_rome.pdf',
        text: 'CAR RENTAL AGREEMENT\nAVIS RENT A CAR\nPick-up: FCO Airport 15/10/2026\nDrop-off: 22/10/2026\nDriver: Nachman Hasson'
      },
      {
        name: 'passportcard_medical_travel_policy.pdf',
        text: 'TRAVEL INSURANCE POLICY\nPassportCard Medical Coverage\nValid: 15/10/2026 - 25/10/2026\nInsured: Nachman Hasson'
      }
    ];

    const ingested: TravelDocument[] = [];
    for (const f of demoFiles) {
      const ocr = await LocalOCREngine.recognizeTextLocally(f.name, f.text);
      const doc = LocalOCREngine.createDocumentFromOCR(tripId, f.name, ocr, f.name);
      await DatabaseService.saveDocument(doc);
      ingested.push(doc);
    }

    return ingested;
  }
}
