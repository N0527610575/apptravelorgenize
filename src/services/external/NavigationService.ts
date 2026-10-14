/**
 * @file NavigationService.ts
 * @description
 * שירות ניווט חיצוני וקישורים עמוקים (Deep Linking) מותאם לדפדפן/ווב.
 * מקשר בין האפליקציה שלנו לבין אפליקציות הניווט (Google Maps).
 */

export class NavigationService {
  private static readonly GOOGLE_MAPS_API_KEY: string = '';

  /**
   * פתיחת מפות ליעד ספציפי מבוסס קואורדינטות (GPS)
   */
  public static async navigateToCoordinates(latitude: number, longitude: number, label?: string): Promise<void> {
    try {
      console.log(`[NavigationService] מכין ניווט לקואורדינטות: ${latitude}, ${longitude}`);
      const query = `${latitude},${longitude}`;
      const url = `https://www.google.com/maps/search/?api=1&query=${query}${label ? `+(${encodeURIComponent(label)})` : ''}`;
      if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error("[NavigationService] שגיאה בניסיון לפתוח שירות ניווט:", error);
    }
  }

  /**
   * פתיחת ניווט המבוסס על כתובת טקסטואלית
   */
  public static async navigateToAddress(address: string): Promise<void> {
    try {
      if (!address) return;
      console.log(`[NavigationService] מכין ניווט לכתובת: ${address}`);
      const encodedAddress = encodeURIComponent(address);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error("[NavigationService] שגיאה בניווט לפי כתובת:", error);
    }
  }
}