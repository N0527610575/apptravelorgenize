/**
 * @file ManualUploadHandler.ts
 * @description
 * מנהל את העלאת המסמכים הידנית על ידי המשתמש (Manual Ingestion) עבור סביבת Web.
 */

import { DocumentCategory, TravelDocument } from '../../core/types/Document';
import { LocalOCREngine } from '../processing/LocalOCREngine';
import { DatabaseService } from '../../core/database/DatabaseService';

export interface ManualUploadResult {
  localFilePath: string;
  fileName: string;
  mimeType: 'application/pdf' | 'image/jpeg' | 'image/png' | string;
  userSuggestedCategory?: DocumentCategory;
  fileData?: string; // Base64 or text
}

export class ManualUploadHandler {
  public static async processUploadedDocument(
    tripId: string,
    uploadResult: ManualUploadResult,
    passengerId?: string
  ): Promise<TravelDocument> {
    const ocrResult = await LocalOCREngine.recognizeTextLocally(uploadResult.fileName);

    if (uploadResult.userSuggestedCategory) {
      ocrResult.category = uploadResult.userSuggestedCategory;
    }

    const doc = LocalOCREngine.createDocumentFromOCR(
      tripId,
      uploadResult.localFilePath || `file://${uploadResult.fileName}`,
      ocrResult,
      uploadResult.fileName,
      passengerId
    );

    await DatabaseService.saveDocument(doc);
    return doc;
  }
}