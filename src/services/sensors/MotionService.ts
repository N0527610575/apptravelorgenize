/**
 * @file MotionService.ts
 * @description
 * שירות זיהוי תנועה באמצעות מד התאוצה (Accelerometer) מותאם לדפדפן/ווב.
 */

import { AppConfig } from '../../core/constants/AppConfig';

export class MotionService {
  private isMonitoring: boolean = false;
  private isCurrentlyWalking: boolean = false;
  private motionlessStartTime: number | null = null;

  public async startMonitoring(): Promise<void> {
    this.isMonitoring = true;
    console.log("[MotionService] ניטור תנועה הופעל (Web Mode)");
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    this.isCurrentlyWalking = false;
  }

  public setWalking(isWalking: boolean): void {
    this.isCurrentlyWalking = isWalking;
    if (isWalking) {
      this.motionlessStartTime = null;
    } else if (this.motionlessStartTime === null) {
      this.motionlessStartTime = Date.now();
    }
  }

  public hasUserSatDown(): boolean {
    if (this.isCurrentlyWalking || this.motionlessStartTime === null) {
      return false;
    }
    const minutesMotionless = (Date.now() - this.motionlessStartTime) / (1000 * 60);
    return minutesMotionless >= AppConfig.timing.motionlessMinutesToConfirmSeat;
  }

  public isWalking(): boolean {
    return this.isCurrentlyWalking;
  }
}