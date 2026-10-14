/**
 * @file BarometerService.ts
 * @description
 * שירות קריאת מד לחץ האוויר של המכשיר (Barometer) מותאם לסביבת Web עם סימולציה מובנית.
 */

import { AppConfig } from '../../core/constants/AppConfig';

export class BarometerService {
  private baseGroundPressure: number | null = 1013.25;
  private currentPressure: number = 1013.25;
  private isMonitoring: boolean = false;

  public async startMonitoring(): Promise<void> {
    this.isMonitoring = true;
    console.log("[BarometerService] ניטור לחץ ברומטרי הופעל (Web Mode)");
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
  }

  public setPressure(pressure: number): void {
    this.currentPressure = pressure;
    if (this.baseGroundPressure === null) {
      this.baseGroundPressure = pressure;
    }
  }

  public getCurrentPressure(): number {
    return this.currentPressure;
  }

  public isInFlightPressure(): boolean {
    if (this.baseGroundPressure === null) return false;
    const pressureDrop = this.baseGroundPressure - this.currentPressure;
    return pressureDrop >= AppConfig.barometer.takeoffPressureDropThreshold;
  }
}