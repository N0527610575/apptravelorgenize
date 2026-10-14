# Smart Travel Companion & Vault — Native Android (Kotlin + Jetpack Compose)

תוכנית יישום מקיפה להפיכת האפליקציה לפרויקט Native Android טהור ב-Kotlin באמצעות Jetpack Compose, עם התמקדות מלאה במסד נתונים מקומי (Room/SQLite) וחיישני חומרה פיזיים של המכשיר.

## User Review & Critical Decisions

> [!IMPORTANT]
> בהתאם לתשובותיך בשלב הבירור:
> 1. **ארכיטקטורה ו-UI:** Native Android מלא ב-Kotlin עם **Jetpack Compose (Material3)**.
> 2. **תעדוף ליבה:** שילוב חיישני חומרה פיזיים של המכשיר (`SensorManager` לברומטר ומד תאוצה, `LocationServices` ל-GPS) ומסד נתונים מקומי מוצפן (`Room / SQLite`).

- **מבנה הפרויקט המיועד:** העברת קבצי ה-Android לשורש הפרויקט (`app/`, `build.gradle.kts`, `settings.gradle.kts`), הסרת מעטפת ה-React/Web, והגדרת פרויקט Android עצמאי הניתן לקימפול והרצה ישירה במכשיר או באמולטור.
- **אחסון ופרטיות (Offline & Local First):** שימוש ב-Room Database מקומי עם שמירת נתונים מוצפנת בכספת המכשיר, ללא תלות ברשת חיצונית.

---

## 1. Overview & Core Concept

- **מהות האפליקציה:** מלווה נסיעות חכם, מקומי ובלתי מתערב לאנדרואיד. האפליקציה שולפת ומציגה תמיד את המסמך או המידע הרלוונטי בדיוק לשנייה זו (כרטיס עלייה למטוס בבורדינג, מספר מושב ענק בהתיישבות במטוס, והוראות ניווט בנחיתה).
- **קהל יעד:** נוסעים ומשפחות הטסים לחו"ל ומעוניינים לחסוך לחץ מול עמדות הסריקה והבידוק בטרמינל, ללא תלות בקליטת סלולר או Wi-Fi.
- **ערך מרכזי:** מעבר מהיר בטאבים ייעודיים בין כרטיסי כל הנוסעים, קריאת חיישני חומרה בזמן אמת (זיהוי המראה לפי לחץ ברומטרי) וכספת מסמכים מוצפנת.

---

## 2. User Experience & Visual Design (Jetpack Compose)

### מסכים וזרימות משתמש (User Flows)
1. **המסך הראשי (Main Companion Hub):**
   - **Top AppBar:** כותרת הנסיעה ("חופשה ברומא - LY385"), חיווי מצב כספת מוצפנת, וכפתור גישה לכספת המסמכים.
   - **Context Banner / Toast:** בועת התראות מערכת מעוצבת המתעדכנת לפי שלב המסע (למשל: *"שער העלייה נפתח. נא להכין דרכונים וכרטיסים פתוחים"*).
   - **Hero Display Card:** כרטיס תצוגה מרכזי:
     - בשלב בורדינג: ברקוד QR / PDF417 ענק וקריא לסריקה מהירה.
     - בשלב איתור מושב / טיסה: מספר מושב ענק בגופן 96sp לקריאה בחושך או ממרחק.
   - **Passenger Tab Row:** סרגל טאבים אופקי למעבר מיידי בין הנוסעים (נחמן, שולמית), עם נקודה ירוקה לנוסע הראשי וציון מספר המושב.
   - **Wayfinding Card (בנחיתה):** כרטיס ניווט קופץ עם כפתור שיגור ישיר ל-Google Maps למלון או השכרת הרכב.

2. **פאנל סימולטור חיישנים ומצבי מסע (Sensors & Simulator Drawer / Sheet):**
   - מאפשר לבחון את תגובת האפליקציה לשינויים פיזיים: כפתורי מעבר בין 8 שלבי המסע, הדמיית ירידת לחץ ברומטרי (המראה), שינוי מיקום GPS (כניסה לשדה), וזיהוי תנועה במד תאוצה.

3. **כספת המסמכים המקומית (Document Vault Screen):**
   - רשימת מסמכים מסווגת לפי קטגוריות (טיסות, מלונות, רכב, ביטוח, דרכון), תצוגת פענוח תקן IATA BCBP, ואפשרות הוספת מסמכים.

### שפת עיצוב וצבעים
- **Material 3 Theme:** פלטת צבעים מודרנית ונקייה (כחול תעופה עמוק `#1565C0`, כחול בהיר `#E3F2FD`, ירוק הצלחה `#2E7D32`, ורקע אפור בהיר `#F8F9FA`).
- **טיפוגרפיה:** היררכיה חדה עם ספרות מושב ענקיות מודגשות בגופן מונוספייס, וקריאות מקסימלית בשמש ובתאורת לילה.

---

## 3. Key Product Decisions & Trade-Offs

- **החלטה 1: Native Android ב-Kotlin ו-Compose במקום React Native**
  - *הגישה שנבחרה:* שכתוב מלא למבנה Android מקורי ונקי.
  - *נימוק:* ביצועים מקסימליים, גישה ישירה ללא גשרים ל-Android `SensorManager`, צריכת סוללה מינימלית ברקע, וממשק Native איכותי.
- **החלטה 2: מסד נתונים מקומי מבוסס Room / SQLite עם הצפנה**
  - *הגישה שנבחרה:* שימוש ב-Room ORM המובנה של אנדרואיד יחד עם אלגוריתם הצפנת הכספת (`enc_v1`) להגנה על מסמכים וכרטיסי עלייה למטוס.
  - *נימוק:* תאימות 100% לאופליין, אבטחת מידע אישי בטלפון, ושליפה מהירה ללא השהיות.
- **החלטה 3: שילוב מנהל חיישנים היברידי (Hardware + Simulation)**
  - *הגישה שנבחרה:* קריאה מחיישני חומרה אמיתיים כשקיימים במכשיר (`Sensor.TYPE_PRESSURE`, `Sensor.TYPE_ACCELEROMETER`), בתוספת מצב סימולציה מובנה לבדיקות ולמכשירים נטולי ברומטר.
  - *נימוק:* תמיכה מלאה בכל מגוון מכשירי האנדרואיד לצד חוויית בדיקה נוחה.

---

## 4. Technical Architecture & Data Strategy

```text
┌────────────────────────────────────────────────────────┐
│                   Jetpack Compose UI                   │
│  MainCompanionScreen • HeroDisplayCard • PassengerTabs │
│     WayfindingSheet  • DocumentVault  • SimulatorSheet │
└───────────────────────────▲────────────────────────────┘
                            │ StateFlow / UI Events
┌───────────────────────────┴────────────────────────────┐
│              TravelCompanionViewModel                  │
│       Manages ContextState, Active Trip & Docs         │
└───────▲───────────────────────────────────────▲────────┘
        │                                       │
┌───────┴────────────────────────┐     ┌────────┴──────────────┐
│     ContextStateMachine        │     │  Database & Vault     │
│  - Evaluates Travel Phases     │     │  - Room Database      │
│  - Triggers Barcode / Seat UI  │     │  - Encrypted Storage  │
└───────▲────────────────────────┘     └───────────────────────┘
        │
┌───────┴────────────────────────────────────────────────┐
│                   Sensor Services                      │
│  - AndroidBarometerService (Sensor.TYPE_PRESSURE)      │
│  - AndroidMotionService (Sensor.TYPE_ACCELEROMETER)    │
│  - AndroidLocationService (FusedLocationClient / GPS)  │
└────────────────────────────────────────────────────────┘
```

### מודלי הנתונים (Core Data Models)
- `Trip`: מזהה, יעד, תאריכי עוגן לטיסה, רשימת טיסות, רשימת נוסעים ומסמכים.
- `Passenger`: מזהה, שם מלא, שם קצר לטאב, מספר מושב (`27E`), וחיווי נוסע ראשי.
- `TravelDocument`: כותרת, קטגוריה (טיסה/מלון/רכב/ביטוח/דרכון), נתוני ברקוד (`BarcodePayload`), וטריגרים.
- `ContextState`: שלב המסע הנוכחי מתוך 8 השלבים, נוסע פעיל, מושב מודגש, האם להציג ברקוד, והודעת טוסט עליונה.
- `IataBcbpParser`: מפענח שורת כרטיס טיסה סטנדרטית (תקן IATA BCBP) לחילוץ שם הנוסע, PNR, קודי שדות (TLV, FCO), חברת תעופה ומספר מושב.

---

## שלבי ביצוע מתוכננים לאחר אישור

1. ארגון מבנה הפרויקט לשורש Android תקני (`app/`, `build.gradle.kts`, `settings.gradle.kts`, `debug.keystore`).
2. הגדרת תלויות Jetpack Compose, Material3, Room Database, Navigation, ו-Coroutines/Flow.
3. מימוש שכבת הנתונים (Room Database & DAOs עם לוגיקת הצפנת כספת).
4. מימוש שירותי החיישנים המקומיים (`BarometerService`, `MotionService`, `LocationService`) ומכונת המצבים (`ContextStateMachine`).
5. בניית רכיבי ה-UI ב-Jetpack Compose (`MainCompanionScreen`, `HeroDisplayCard`, `PassengerTabBar`, `WayfindingModal`, `DocumentVaultScreen`).
6. אימות וקימפול מלא של האפליקציה באמצעות `compile_applet`.
