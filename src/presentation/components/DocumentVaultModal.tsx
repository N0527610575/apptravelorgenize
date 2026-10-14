/**
 * @file DocumentVaultModal.tsx
 * @description
 * כספת המסמכים המקומית המאובטחת (Local Encrypted Vault).
 * מציגה את כל המסמכים שאותרו, חולצו וקוטלגו במכשיר ללא תלות ברשת.
 */

import React, { useState } from 'react';
import { TravelDocument, DocumentCategory } from '../../core/types/Document';
import { BarcodeDecoder } from '../../services/processing/BarcodeDecoder';
import {
  FolderLock,
  Plus,
  Trash2,
  FileText,
  Plane,
  Building2,
  Car,
  Shield,
  CreditCard,
  X,
  FileUp,
  Barcode,
  Eye,
  CheckCircle2
} from 'lucide-react';

interface DocumentVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: TravelDocument[];
  onAddSampleDocs: () => void;
  onUploadDoc: (title: string, category: DocumentCategory, text: string) => void;
  onDeleteDoc: (id: string) => void;
}

export const DocumentVaultModal: React.FC<DocumentVaultModalProps> = ({
  isOpen,
  onClose,
  documents,
  onAddSampleDocs,
  onUploadDoc,
  onDeleteDoc,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [inspectDoc, setInspectDoc] = useState<TravelDocument | null>(null);

  // New doc form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocumentCategory>('flight');
  const [newText, setNewText] = useState('');

  if (!isOpen) return null;

  const categories: Array<{ id: string; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: 'כל המסמכים', icon: <FolderLock className="w-4 h-4" /> },
    { id: 'flight', label: 'טיסות וכרטיסים', icon: <Plane className="w-4 h-4" /> },
    { id: 'hotel', label: 'מלונות ואירוח', icon: <Building2 className="w-4 h-4" /> },
    { id: 'car_rental', label: 'השכרת רכב', icon: <Car className="w-4 h-4" /> },
    { id: 'insurance', label: 'ביטוח נסיעות', icon: <Shield className="w-4 h-4" /> },
    { id: 'passport', label: 'דרכונים', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const filteredDocs =
    selectedCategory === 'all'
      ? documents
      : documents.filter((d) => d.category === selectedCategory);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onUploadDoc(newTitle.trim(), newCategory, newText.trim());
    setNewTitle('');
    setNewText('');
    setIsAddingNew(false);
  };

  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case 'flight':
        return <Plane className="w-5 h-5 text-blue-600" />;
      case 'hotel':
        return <Building2 className="w-5 h-5 text-amber-600" />;
      case 'car_rental':
        return <Car className="w-5 h-5 text-emerald-600" />;
      case 'insurance':
        return <Shield className="w-5 h-5 text-purple-600" />;
      case 'passport':
        return <CreditCard className="w-5 h-5 text-rose-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 text-right overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <FolderLock className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">כספת מסמכים מקומית (Offline Vault)</h2>
              <p className="text-xs text-gray-500">מוצפנת במכשיר • ללא העברת מידע לענן חיצוני</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar & Filters */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === c.id
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {c.icon}
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onAddSampleDocs}
                className="text-xs bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 py-1.5 px-3 rounded-xl font-medium transition-colors cursor-pointer"
              >
                סרוק מסמכי ברירת מחדל
              </button>
              <button
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-xl font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                הוסף מסמך
              </button>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Add document form */}
          {isAddingNew && (
            <form onSubmit={handleFormSubmit} className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 mb-4 animate-in fade-in duration-200">
              <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-1.5">
                <FileUp className="w-4 h-4 text-blue-600" />
                הוספת מסמך חדש לכספת
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">שם המסמך</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="למשל: כרטיס עלייה למטוס - רומא"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">קטגוריה</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="flight">כרטיס טיסה / בורדינג</option>
                    <option value="hotel">מלון / אירוח</option>
                    <option value="car_rental">השכרת רכב</option>
                    <option value="insurance">ביטוח נסיעות</option>
                    <option value="passport">דרכון / תעודה</option>
                    <option value="custom">אחר</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-700 block mb-1">טקסט / נתוני מסמך (אופציונלי לחילוץ OCR)</label>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="הדבק טקסט או פרטי שובר..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs py-1.5 px-3 rounded-lg text-gray-600 hover:bg-gray-200"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="text-xs py-1.5 px-4 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
                >
                  שמור לכספת
                </button>
              </div>
            </form>
          )}

          {/* Documents list */}
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FolderLock className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-base font-semibold text-gray-600">אין מסמכים בקטגוריה זו</p>
              <p className="text-xs text-gray-400 mt-1">לחץ על "סרוק מסמכי ברירת מחדל" או "הוסף מסמך"</p>
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-white border border-gray-200/90 hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100 shrink-0">
                    {getCategoryIcon(doc.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{doc.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        {doc.category === 'flight'
                          ? 'כרטיס טיסה'
                          : doc.category === 'hotel'
                          ? 'אישור מלון'
                          : doc.category === 'car_rental'
                          ? 'שובר רכב'
                          : doc.category === 'insurance'
                          ? 'פוליסת ביטוח'
                          : 'מסמך נסיעה'}
                      </span>
                      {doc.barcode && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                          <Barcode className="w-3 h-3" />
                          ברקוד {doc.barcode.format}
                        </span>
                      )}
                      <span className="text-gray-400">
                        {new Date(doc.createdAt).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 mr-2">
                  <button
                    onClick={() => setInspectDoc(doc)}
                    title="פרטי מסמך ופענוח"
                    className="p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteDoc(doc.id)}
                    title="מחק מסמך"
                    className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Inspect Document modal */}
        {inspectDoc && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-right shadow-2xl border border-gray-100 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">{inspectDoc.title}</h3>
                <button
                  onClick={() => setInspectDoc(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-4 space-y-3 text-xs">
                {inspectDoc.barcode && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <span className="font-bold text-blue-900 block mb-1">פענוח ברקוד תקן IATA BCBP:</span>
                    {inspectDoc.barcode.rawData.startsWith('M') && (
                      (() => {
                        const parsed = BarcodeDecoder.parseBCBP(inspectDoc.barcode);
                        return parsed ? (
                          <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px] text-gray-800">
                            <div>שם נוסע: <strong>{parsed.passengerName}</strong></div>
                            <div>קוד PNR: <strong>{parsed.pnr}</strong></div>
                            <div>מסלול: <strong>{parsed.originPort} ➔ {parsed.destinationPort}</strong></div>
                            <div>טיסה: <strong>{parsed.airlineCode}{parsed.flightNumber}</strong></div>
                            <div>מספר מושב: <strong>{parsed.seatNumber}</strong></div>
                          </div>
                        ) : null;
                      })()
                    )}
                    <div className="mt-2 text-gray-500 break-all font-mono text-[10px]">
                      Raw: {inspectDoc.barcode.rawData}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-700 block mb-1">סטטוס כספת מקומית:</span>
                  <div className="text-gray-600 space-y-1">
                    <div>טריגר תצוגה: <strong>{inspectDoc.trigger.type}</strong></div>
                    <div>מקור: <strong>{inspectDoc.source}</strong></div>
                    <div>פורמט: <strong>{inspectDoc.mimeType}</strong></div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectDoc(null)}
                className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs"
              >
                סגור
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
