# ✈️ Smart Travel Companion & Vault — 100% Pure Native Android

אפליקציית ניהול מסמכים וליווי נסיעות חכמה, מקומית (On-Device) ובלתי מתערבת, הבנויה בארכיטקטורת **Native Android טהורה ב-Kotlin עם Jetpack Compose**.

האפליקציה פותרת את הלחץ והבלגן בשליפת מסמכים בזמן אמת (כרטיסי טיסה, דרכונים, שוברי מלון ורכב), תוך שימוש בחיישני המכשיר הפיזיים ובמנוע הקשר חכם כדי להציג תמיד את המסמך הנכון ברגע הנכון.

---

## 🌟 עקרונות הליבה

1. **פרטיות מקומית תחילה (Local & Offline First):** כל הנתונים, המסמכים והברקודים נשמרים ומעובדים באופן מקומי על גבי המכשיר במסד נתונים **Room SQLite** מוצפן (`VaultCrypto`).
2. **חיישני חומרה פיזיים של אנדרואיד (Hardware Sensors):** שימוש ישיר ב-`SensorManager`:
   - **חיישן ברומטר (`Sensor.TYPE_PRESSURE`):** זיהוי צניחת לחץ ברומטרי עקב דיחוס תא נוסעים בזמן המראה.
   - **מד תאוצה (`Sensor.TYPE_ACCELEROMETER`):** ניתוח וקטור תאוצה תלת-ממדי להבחנה בין הליכה בשרוול לישיבה במטוס.
   - **מיקום ו-Geofencing:** זיהוי הגעה לשדה התעופה או למלון היעד.
3. **תמיכה מובנית בריבוי נוסעים:** מעבר מהיר בטאבים ייעודיים בין כרטיסי טיסה של כל בני המשפחה מול עמדת הסריקה בטרמינל.
4. **מפענח כרטיסי טיסה בינלאומי (IATA BCBP):** חילוץ אוטומטי של שמות נוסעים, קוד PNR, טיסה ומספר מושב מתוך ברקודים.

---

## 🏗️ מבנה הפרויקט (Clean Architecture)

```text
/
├── .github/workflows/build-apk.yml    # CI/CD: קימפול APK אוטומטי ב-GitHub Actions
├── app/                               # מודול האפליקציה (com.android.application)
│   ├── build.gradle.kts               # תלויות Compose, Material3, Room, Coroutines
│   └── src/main/
│       ├── AndroidManifest.xml        # הרשאות חומרה ומאפייני האפליקציה
│       ├── java/com/smarttravel/companion/
│       │   ├── MainActivity.kt        # ComponentActivity המריץ Jetpack Compose
│       │   ├── MainApplication.kt     # Application נקי
│       │   ├── data/
│       │   │   ├── model/TripModels.kt              # מודלי נתונים
│       │   │   ├── database/TravelDatabase.kt       # Room SQLite + VaultCrypto (הצפנה)
│       │   │   └── sensors/AndroidHardwareSensors.kt# ברומטר ומד תאוצה
│       │   ├── domain/
│       │   │   ├── ContextStateMachine.kt           # מכונת מצבי מסע (8 שלבים)
│       │   │   └── IataBcbpParser.kt                # מפענח תקן כרטיסי טיסה
│       │   └── ui/
│       │       ├── theme/Theme.kt                   # Material 3 Theme
│       │       ├── components/                      # HeroDisplayCard, PassengerTabBar, Wayfinding, Vault
│       │       └── screens/MainCompanionScreen.kt   # המסך המרכזי
│       └── res/                                     # צבעים, מחרוזות, אייקונים
├── gradle/wrapper/
├── gradlew & gradlew.bat
├── gradle.properties
├── settings.gradle.kts
└── build.gradle.kts
```

---

## 🚀 הוראות הרצה ובנייה

### פתיחה ב-Android Studio:
1. פתח את Android Studio.
2. בחר **Open** ובחר את תיקיית השורש של הפרויקט.
3. הפרויקט יסונכרן אוטומטית באמצעות Gradle.
4. הרץ על מכשיר פיזי או על אמולטור.

### קימפול APK דרך שורת הפקודה (CLI):
```bash
# מתן הרשאת הרצה ל-Gradle Wrapper
chmod +x ./gradlew

# בניית Debug APK
./gradlew assembleDebug

# ה-APK ייווצר בנתיב:
# app/build/outputs/apk/debug/app-debug.apk
```

---

## 🧪 רכיבי המערכת הפעילים

| רכיב | סטטוס | פירוט טכנולוגי |
| :--- | :---: | :--- |
| **ממשק משתמש (UI)** | ✅ פעיל | Jetpack Compose + Material 3, כרטיס Hero דינמי, טאבים לנוסעים, חלון ניווט למפות |
| **מסד נתונים מקומי** | ✅ פעיל | `Room Database` מוצפן מקומית עם מפתח כספת `enc_v1` |
| **חיישני מכשיר** | ✅ פעיל | `SensorManager` ישיר עבור `Sensor.TYPE_PRESSURE` ו-`Sensor.TYPE_ACCELEROMETER` |
| **מכונת מצבי מסע** | ✅ פעיל | `ContextStateMachine` עם 8 שלבי מסע והתאמה אוטומטית של הממשק |
| **פענוח כרטיסי טיסה** | ✅ פעיל | `IataBcbpParser` לחילוץ שמות נוסעים, קוד PNR, נמלי תעופה ומספרי מושבים |
| **אינטגרציית ניווט** | ✅ פעיל | Android Intent ישיר ל-Google Maps לפי קואורדינטות וכתובת |
| **בנייה אוטומטית (CI)** | ✅ פעיל | GitHub Actions workflow המייצר standalone APK בכל push |