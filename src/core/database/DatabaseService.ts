import { TravelDocument } from '../types/Document';
import { Trip } from '../types/Trip';

export class DatabaseService {
  private static readonly VAULT_KEY = 'SmartTravelVault_Encrypted_Offline_Key_2026';
  private static readonly TRIPS_KEY = 'smart_travel_encrypted_trips';
  private static readonly DOCS_KEY = 'smart_travel_encrypted_docs';

  /**
   * הצפנה סימטרית מקומית להגנה על המידע הרגיש במסד הנתונים (Encryption at Rest)
   */
  private static encrypt(plainText: string): string {
    const encoded = encodeURIComponent(plainText);
    const codes: number[] = [];
    for (let i = 0; i < encoded.length; i++) {
      codes.push(encoded.charCodeAt(i) ^ this.VAULT_KEY.charCodeAt(i % this.VAULT_KEY.length));
    }
    return `enc_v1:${codes.join('.')}`;
  }

  /**
   * פענוח הנתונים המקומיים
   */
  private static decrypt(cipherText: string): string {
    if (!cipherText || !cipherText.startsWith('enc_v1:')) return cipherText;
    try {
      const parts = cipherText.substring(7).split('.');
      let decoded = '';
      for (let i = 0; i < parts.length; i++) {
        const code = parseInt(parts[i], 10);
        decoded += String.fromCharCode(code ^ this.VAULT_KEY.charCodeAt(i % this.VAULT_KEY.length));
      }
      return decodeURIComponent(decoded);
    } catch {
      return cipherText;
    }
  }

  public static async init(): Promise<void> {
    // LocalStorage ready check
    if (typeof window !== 'undefined' && !localStorage.getItem(this.TRIPS_KEY)) {
      localStorage.setItem(this.TRIPS_KEY, JSON.stringify([]));
    }
    if (typeof window !== 'undefined' && !localStorage.getItem(this.DOCS_KEY)) {
      localStorage.setItem(this.DOCS_KEY, JSON.stringify([]));
    }
  }

  public static async saveTrip(trip: Trip): Promise<void> {
    await this.init();
    const stored = this.getRawStoredTrips();
    const filtered = stored.filter(t => t.id !== trip.id);
    const encryptedData = this.encrypt(JSON.stringify(trip));
    filtered.push({ id: trip.id, data: encryptedData, isActive: trip.isActive ? 1 : 0 });
    localStorage.setItem(this.TRIPS_KEY, JSON.stringify(filtered));
  }

  private static getRawStoredTrips(): Array<{ id: string; data: string; isActive: number }> {
    try {
      const raw = localStorage.getItem(this.TRIPS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static async getActiveTrip(): Promise<Trip | null> {
    await this.init();
    const trips = this.getRawStoredTrips();
    const activeEntry = trips.find(t => t.isActive === 1) || trips[0];
    if (!activeEntry) return null;
    try {
      const decrypted = this.decrypt(activeEntry.data);
      return JSON.parse(decrypted) as Trip;
    } catch {
      return null;
    }
  }

  public static async getAllTrips(): Promise<Trip[]> {
    await this.init();
    const trips = this.getRawStoredTrips();
    return trips.map(t => {
      try {
        return JSON.parse(this.decrypt(t.data)) as Trip;
      } catch {
        return null as unknown as Trip;
      }
    }).filter(Boolean);
  }

  public static async deleteTrip(id: string): Promise<void> {
    await this.init();
    const trips = this.getRawStoredTrips().filter(t => t.id !== id);
    localStorage.setItem(this.TRIPS_KEY, JSON.stringify(trips));
    const docs = this.getRawStoredDocs().filter(d => d.tripId !== id);
    localStorage.setItem(this.DOCS_KEY, JSON.stringify(docs));
  }

  private static getRawStoredDocs(): Array<{ id: string; tripId: string; category: string; data: string }> {
    try {
      const raw = localStorage.getItem(this.DOCS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static async saveDocument(doc: TravelDocument): Promise<void> {
    await this.init();
    const docs = this.getRawStoredDocs();
    const filtered = docs.filter(d => d.id !== doc.id);
    const encryptedData = this.encrypt(JSON.stringify(doc));
    filtered.push({
      id: doc.id,
      tripId: doc.tripId,
      category: doc.category,
      data: encryptedData,
    });
    localStorage.setItem(this.DOCS_KEY, JSON.stringify(filtered));
  }

  public static async getDocumentsByTrip(tripId: string): Promise<TravelDocument[]> {
    await this.init();
    const docs = this.getRawStoredDocs().filter(d => d.tripId === tripId);
    return docs.map(d => {
      try {
        return JSON.parse(this.decrypt(d.data)) as TravelDocument;
      } catch {
        return null as unknown as TravelDocument;
      }
    }).filter(Boolean);
  }

  public static async getDocumentById(id: string): Promise<TravelDocument | null> {
    await this.init();
    const entry = this.getRawStoredDocs().find(d => d.id === id);
    if (!entry) return null;
    try {
      return JSON.parse(this.decrypt(entry.data)) as TravelDocument;
    } catch {
      return null;
    }
  }

  public static async deleteDocument(id: string): Promise<void> {
    await this.init();
    const docs = this.getRawStoredDocs().filter(d => d.id !== id);
    localStorage.setItem(this.DOCS_KEY, JSON.stringify(docs));
  }
}
