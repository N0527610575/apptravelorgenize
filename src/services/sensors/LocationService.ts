/**
 * @file LocationService.ts
 * @description
 * שירות המיקום והגידור הגיאוגרפי (Geofencing) מותאם לדפדפן/ווב.
 */

import { AirportLocation } from '../../core/types/Trip';

export class LocationService {
  private isGeofenceActive: boolean = false;
  private currentAirportZone: AirportLocation | null = null;
  private isUserInsideAirport: boolean = false;

  public async requestPermissions(): Promise<boolean> {
    console.log("[LocationService] שירות מיקום מוכן (Web Mode)");
    return true;
  }

  public async setupAirportGeofence(airport: AirportLocation): Promise<void> {
    this.currentAirportZone = airport;
    this.isGeofenceActive = true;
    console.log(`[LocationService] הוגדר Geofence עבור שדה ${airport.code} (${airport.name})`);
  }

  public setIsAtAirport(isInside: boolean): void {
    this.isUserInsideAirport = isInside;
  }

  public isAtAirport(): boolean {
    return this.isUserInsideAirport;
  }

  public stopGeofencing(): void {
    this.isGeofenceActive = false;
    this.currentAirportZone = null;
  }
}