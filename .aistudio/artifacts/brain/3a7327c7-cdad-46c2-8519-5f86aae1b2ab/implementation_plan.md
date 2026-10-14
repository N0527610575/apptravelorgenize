# Purge Hybrid Layer & Migrate to 100% Pure Native Android (Kotlin + Jetpack Compose)

תוכנית פעולה מלאה להסרת כל שרידי ה-Web, React Native ו-Expo מהמאגר, והסבת המאגר לפרויקט Native Android טהור ומודרני (Kotlin DSL, Jetpack Compose, Room SQLite, ו-GitHub Actions CI).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> בהתאם לתשובותיך בשלב הבירור:
> 1. **מיקום קבצי הפרויקט:** העברה מלאה של כל קבצי ה-Android לשורש המאגר (`/app`, `/gradle`, `/gradlew`, `settings.gradle.kts`).
> 2. **פורמט סקריפטי הבנייה:** שימוש ב-**Kotlin DSL (`build.gradle.kts` ו-`settings.gradle.kts`)** התקני והמודרני ביותר.

- **סילוק מוחלט של שכבות היברידיות:** מחיקה מלאה של תיקיית `src/` (קוד הווב), `ios/`, `android/react-settings-plugin/`, וכל קבצי ההגדרות של Node/Vite/Expo (`package.json`, `App.tsx`, `index.html`, `vite.config.ts`, `app.json`, `babel.config.js`, `eas.json` וכו').
- **סביבת CI/CD:** עדכון מלא של `.github/workflows/build-apk.yml` להרצה ישירה של JDK 17 ו-Gradle Wrapper המייצרים `app-debug.apk` להורדה כ-Artifact.

---

## 1. Overview & Core Architecture

המאגר יאורגן מחדש כמבנה Android מקורי ונקי:

```text
/
├── .github/workflows/build-apk.yml    # CI/CD: מריץ Gradle ומייצר APK
├── app/                               # מודול האפליקציה הראשי (com.android.application)
│   ├── build.gradle.kts               # תלויות Compose, Material3, Room, Coroutines
│   ├── proguard-rules.pro
│   └── src/main/
│       ├── AndroidManifest.xml        # הרשאות חומרה: ברומטר, אקסלרומטר, מיקום, אינטרנט
│       ├── java/com/smarttravel/companion/
│       │   ├── MainActivity.kt        # ComponentActivity המריץ Compose
│       │   ├── MainApplication.kt     # Application נקי
│       │   ├── data/
│       │   │   ├── model/TripModels.kt
│       │   │   ├── database/TravelDatabase.kt  # Room SQLite + VaultCrypto
│       │   │   └── sensors/AndroidHardwareSensors.kt # ברומטר + מד תאוצה
│       │   ├── domain/
│       │   │   ├── ContextStateMachine.kt
│       │   │   └── IataBcbpParser.kt
│       │   └── ui/
│       │       ├── theme/Theme.kt
│       │       ├── components/        # HeroCard, PassengerTabs, Wayfinding, Vault, StatusBanner
│       │       └── screens/MainCompanionScreen.kt
│       └── res/                       # משאבי עיצוב, מיתוג ואייקונים
├── gradle/wrapper/                    # Gradle Wrapper v8.x / 9.x
├── gradlew & gradlew.bat
├── gradle.properties                  # הגדרות JVM ו-AndroidX נקיות
├── settings.gradle.kts                # הגדרת rootProject ו-include(":app")
├── build.gradle.kts                   # הגדרות Top-level Gradle ו-AGP
├── debug.keystore                     # חתימת Debug מקומית
└── README.md                          # תיעוד ארכיטקטורה והרצה
```

---

## 2. User Experience & Visual Design (Jetpack Compose)

כל התכונות והיכולות המקוריות של האפליקציה נשמרות במלואן בתוך קוד ה-Compose:
1. **Hero Display Card:**
   - ברקוד BCBP / QR ענק בשער העלייה למטוס (`BOARDING_GATE`).
   - מספר מושב ענק (92sp) בתוך תא הנוסעים (`FINDING_SEAT`, `IN_FLIGHT`).
2. **Passenger Tab Row:**
   - סרגל טאבים אופקי למעבר מהיר בין כרטיסי הנוסעים (נחמן, שולמית) עם חיווי מושב ונוסע ראשי.
3. **Wayfinding Modal / Bottom Sheet:**
   - כפתור ניווט קופץ בנחיתה (`LANDED_AT_DESTINATION`) המשגר Intent ישיר ל-Google Maps.
4. **Local Encrypted Vault (כספת מסמכים):**
   - כספת מסווגת לפי קטגוריות (טיסות, מלונות, רכב, ביטוח, דרכון) המוצפנת מקומית ב-SQLite/Room.
5. **Live Flight Status Banner:**
   - תצוגת זמני טיסה, שער עלייה (Gate B22) ומסוע כבודה (Belt 8).
6. **Sensors Simulation Panel:**
   - פאנל בדיקות מובנה לבחינת תגובות המערכת לחיישנים בזמן אמת.

---

## 3. Key Product & DevOps Decisions

- **מחיקת כל קבצי הווב וה-JS:** מחיקה מוחלטת ללא השארת קבצי תצורה כפולים או מבלבלים.
- **מעבר ל-Kotlin DSL בשורש:** `settings.gradle.kts` ו-`build.gradle.kts` בשורש, ו-`app/build.gradle.kts` במודול האפליקציה.
- **הסרת AndroidManifest Debug:** מחיקת `android/app/src/debug/AndroidManifest.xml` שהכיל שרידי React Native (`DevSettingsActivity` ו-`SYSTEM_ALERT_WINDOW`).
- **תהליך CI ב-GitHub Actions:** Workflow מינימליסטי ומהיר שמתקין JDK 17, מריץ `./gradlew assembleDebug`, ושומר את ה-APK שנוצר ב-`app/build/outputs/apk/debug/app-debug.apk`.

---

## 4. Technical Architecture Diagram

```text
┌────────────────────────────────────────────────────────┐
│             Android Jetpack Compose UI                 │
│  MainCompanionScreen • HeroDisplayCard • PassengerTabs │
│     WayfindingModal  • DocumentVault  • StatusBanner   │
└───────────────────────────▲────────────────────────────┘
                            │ State / Events
┌───────────────────────────┴────────────────────────────┐
│                  Application Layer                     │
│               MainActivity & ViewModel                 │
└───────▲───────────────────────────────────────▲────────┘
        │                                       │
┌───────┴────────────────────────┐     ┌────────┴──────────────┐
│     ContextStateMachine        │     │   TravelDatabase      │
│  - Evaluates Travel Phases     │     │   - Room SQLite       │
│  - IataBcbpParser              │     │   - VaultCrypto (enc) │
└───────▲────────────────────────┘     └───────────────────────┘
        │
┌───────┴────────────────────────────────────────────────┐
│             Android Hardware Sensors                   │
│  - SensorManager: Barometer (Sensor.TYPE_PRESSURE)     │
│  - SensorManager: Motion (Sensor.TYPE_ACCELEROMETER)   │
│  - LocationManager / GPS Geofencing                    │
└────────────────────────────────────────────────────────┘
```

---

## שלבי ביצוע מתוכננים

1. **שלב 1: מחיקת קבצי Web, React Native ו-iOS:**
   - מחיקת `src/`, `ios/`, `android/react-settings-plugin/`.
   - מחיקת `App.tsx`, `index.html`, `index.js`, `vite.config.ts`, `tsconfig.json`, `package.json`, `package-lock.json`, `app.json`, `babel.config.js`, `eas.json`, `metadata.json`, `.env.example`.
   - מחיקת `rn_edit_text_material.xml` ו-`debug/AndroidManifest.xml`.
2. **שלב 2: העברת מבנה ה-Android לשורש המאגר:**
   - העברת `android/app/` אל `/app/`.
   - העברת `android/gradle/`, `android/gradlew`, `android/gradlew.bat`.
   - העברת `debug.keystore` לשורש.
   - מחיקת תיקיית `android/` הריקה.
3. **שלב 3: כתיבת סקריפטי Kotlin DSL:**
   - יצירת `settings.gradle.kts` בשורש.
   - יצירת `build.gradle.kts` בשורש.
   - יצירת `app/build.gradle.kts` ב-Kotlin DSL עם תלויות Compose, Material3, Room ו-Coroutines.
   - ניקוי `gradle.properties`.
4. **שלב 4: השלמת רכיבי ה-Kotlin Compose:**
   - וידוא קיומם של `FlightStatusBanner.kt` ו-`DocumentVaultModal.kt` ב-Compose כדי שלא ייגרע אף רכיב ממשק.
   - בדיקת כל הייבואים והאנוטציות ב-`TravelDatabase.kt` ו-`MainActivity.kt`.
5. **שלב 5: עדכון GitHub Actions Workflow:**
   - כתיבה מחדש של `.github/workflows/build-apk.yml` ל-Native Android עם JDK 17 ו-Gradle.
6. **שלב 6: עדכון README.md ואימות סופי:**
   - עדכון `README.md` בעברית ובאנגלית המסביר את ארכיטקטורת ה-Native Android, הוראות הרצה ב-Android Studio, והוראות בנייה ב-CLI.
