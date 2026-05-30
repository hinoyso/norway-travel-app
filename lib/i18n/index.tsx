"use client";
import React, { createContext, useContext, useEffect } from "react";
import { parseISO, isToday, isTomorrow, format } from "date-fns";
import { he as heLocale } from "date-fns/locale/he";
import { nb as nbLocale } from "date-fns/locale/nb";
import { useTripStore, Language } from "@/store/tripStore";

const T = {
  en: {
    nav: { home: "Home", itinerary: "Itinerary", map: "Map", settings: "Settings" },
    hero: {
      yourJourney: "Your Journey",
      days: "Days", daysAway: "Days away", live: "Live",
      ongoing: "Ongoing", done: "Done", completed: "Completed", cities: "Cities",
      todayIn: "Today you're in",
    },
    home: {
      welcome: "Welcome to Norway", uploadPrompt: "Upload your Excel itinerary to begin your adventure",
      uploadBtn: "Upload Itinerary", yourItinerary: "Your Itinerary", noDays: "No days yet.",
      uploadFile: "Upload your Excel file",
    },
    day: {
      day: "Day", today: "Today", tomorrow: "Tomorrow", activity: "activity", activities: "activities",
      dayNames: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      notes: "Notes", routeMap: "Route Map", optimizeRoute: "Optimize Route",
      optimizing: "Optimizing...", noActivities: "No activities yet",
      uploadPrompt: "Upload your itinerary to get started",
    },
    activity: {
      getDirections: "Get Directions", nearbyRestaurants: "Nearby Restaurants",
      notes: "Notes", description: "About", hasNotes: "Has notes",
      time: "Time", address: "Address", travelInfo: "Travel Info",
      findNearby: "Find nearby restaurants", searchMaps: "Search on Google Maps",
      daysPlanned: "days planned", noActivities: "No activities yet",
      uploadPrompt: "Upload your Excel itinerary to get started",
      weatherLow: "Low", weatherRain: "rain",
    },
    map: {
      title: "Full Route Map", subtitle: "All days combined",
      locations: "locations", across: "across", daysSuffix: "days",
    },
    emergency: {
      title: "Emergency Numbers", subtitle: "Save these before you travel",
      police: "Police / Emergency", ambulance: "Ambulance", fire: "Fire",
      embassy: "Israeli Embassy – Oslo", embassyPhone: "+47 21 01 34 00",
      tapToCall: "Tap to call",
    },
    hotel: { tonight: "Tonight's Hotel", navigate: "Navigate" },
    share: { shareDay: "Share Day Plan", via: "Share via…" },
    settings: {
      title: "Settings", appearance: "Appearance", language: "Language",
      chooseLanguage: "Choose your language",
      itinerary: "Itinerary", uploadNew: "Upload new itinerary",
      uploadDesc: "Replace current trip data", clearCache: "Clear cached data",
      clearDesc: "Force reload from server", upload: "Upload", clear: "Clear",
      connectivity: "Connectivity", offlineMode: "Offline mode",
      offlineOn: "Using cached data only", offlineOff: "Online — syncing live",
      account: "Account", signOut: "Sign out", signOutDesc: "Log out of your account",
      appName: "Norway Travel App", builtWith: "Built with ❤️ for your adventure",
    },
    categories: {
      sightseeing: "Sightseeing", food: "Food", transport: "Transport",
      accommodation: "Hotel", outdoor: "Outdoor", culture: "Culture",
      shopping: "Shopping", other: "Other",
    },
    theme: { light: "Light", auto: "Auto", dark: "Dark" },
    noteLabels: { restaurant: "Restaurant", driving: "Drive time", km: "Distance (km)" },
    crud: {
      edit: "Edit", delete: "Delete", save: "Save", cancel: "Cancel",
      add: "Add Activity", confirmDelete: "Delete this?", yes: "Yes", no: "No",
      activityName: "Activity name", city: "City", notes: "Notes",
      editDay: "Edit Day", editActivity: "Edit Activity", newActivity: "New Activity",
      deleted: "Deleted", saved: "Saved",
    },
  },
  he: {
    nav: { home: "בית", itinerary: "מסלול", map: "מפה", settings: "הגדרות" },
    home: {
      welcome: "ברוכים הבאים לנורווגיה", uploadPrompt: "העלו את קובץ האקסל כדי להתחיל",
      uploadBtn: "העלאת מסלול", yourItinerary: "המסלול שלכם", noDays: "אין ימים עדיין.",
      uploadFile: "העלו קובץ אקסל",
    },
    hero: {
      yourJourney: "המסע שלכם",
      days: "ימים", daysAway: "ימים לטיול", live: "בדרך",
      ongoing: "בטיול", done: "סיום", completed: "הושלם", cities: "ערים",
      todayIn: "היום אתם ב",
    },
    day: {
      day: "יום", today: "היום", tomorrow: "מחר", activity: "פעילות", activities: "פעילויות",
      dayNames: ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"],
      notes: "הערות", routeMap: "מפת המסלול", optimizeRoute: "אופטימיזציה",
      optimizing: "מחשב...", noActivities: "אין פעילויות עדיין",
      uploadPrompt: "העלו את המסלול כדי להתחיל",
    },
    activity: {
      getDirections: "נווט", nearbyRestaurants: "מסעדות קרובות",
      notes: "הערות", description: "אודות", hasNotes: "יש הערות",
      time: "שעה", address: "כתובת", travelInfo: "מידע נסיעה",
      findNearby: "מסעדות קרובות", searchMaps: "חיפוש במפות גוגל",
      daysPlanned: "ימים מתוכננים", noActivities: "אין פעילויות עדיין",
      uploadPrompt: "העלו את המסלול כדי להתחיל",
      weatherLow: "מינימום", weatherRain: "גשם",
    },
    map: {
      title: "מפת המסלול המלא", subtitle: "כל הימים",
      locations: "מיקומים", across: "על פני", daysSuffix: "ימים",
    },
    emergency: {
      title: "מספרי חירום", subtitle: "שמרו לפני הנסיעה",
      police: "משטרה / חירום", ambulance: "אמבולנס", fire: "כיבוי אש",
      embassy: "שגרירות ישראל – אוסלו", embassyPhone: "+47 21 01 34 00",
      tapToCall: "לחצו להתקשרות",
    },
    hotel: { tonight: "מלון הלילה", navigate: "נווט" },
    share: { shareDay: "שתפו את תוכנית היום", via: "שתף דרך…" },
    settings: {
      title: "הגדרות", appearance: "מראה", language: "שפה",
      chooseLanguage: "בחרו שפה",
      itinerary: "מסלול", uploadNew: "העלו מסלול חדש",
      uploadDesc: "החלף את נתוני הטיול", clearCache: "נקה מטמון",
      clearDesc: "טען מחדש מהשרת", upload: "העלה", clear: "נקה",
      connectivity: "קישוריות", offlineMode: "מצב לא מקוון",
      offlineOn: "משתמש בנתונים שמורים", offlineOff: "מקוון — מסונכרן",
      account: "חשבון", signOut: "התנתק", signOutDesc: "צא מהחשבון",
      appName: "אפליקציית טיול נורווגיה", builtWith: "נבנה באהבה עבור המסע שלכם ❤️",
    },
    categories: {
      sightseeing: "אטרקציות", food: "אוכל", transport: "תחבורה",
      accommodation: "מלון", outdoor: "טבע", culture: "תרבות",
      shopping: "קניות", other: "אחר",
    },
    theme: { light: "בהיר", auto: "אוטו", dark: "כהה" },
    noteLabels: { restaurant: "מסעדה", driving: "מרחק נסיעה", km: 'מרחק ק"מ' },
    crud: {
      edit: "ערוך", delete: "מחק", save: "שמור", cancel: "ביטול",
      add: "הוסף פעילות", confirmDelete: "למחוק?", yes: "כן", no: "לא",
      activityName: "שם פעילות", city: "עיר", notes: "הערות",
      editDay: "עריכת יום", editActivity: "עריכת פעילות", newActivity: "פעילות חדשה",
      deleted: "נמחק", saved: "נשמר",
    },
  },
  no: {
    nav: { home: "Hjem", itinerary: "Reiserute", map: "Kart", settings: "Innstillinger" },
    home: {
      welcome: "Velkommen til Norge", uploadPrompt: "Last opp Excel-filen for å begynne",
      uploadBtn: "Last opp reiserute", yourItinerary: "Din reiserute", noDays: "Ingen dager ennå.",
      uploadFile: "Last opp Excel-fil",
    },
    hero: {
      yourJourney: "Din Reise",
      days: "Dager", daysAway: "Dager igjen", live: "Live",
      ongoing: "Pågående", done: "Ferdig", completed: "Fullført", cities: "Byer",
      todayIn: "I dag er du i",
    },
    day: {
      day: "Dag", today: "I dag", tomorrow: "I morgen", activity: "aktivitet", activities: "aktiviteter",
      dayNames: ["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"],
      notes: "Notater", routeMap: "Rutekart", optimizeRoute: "Optimaliser",
      optimizing: "Optimaliserer...", noActivities: "Ingen aktiviteter ennå",
      uploadPrompt: "Last opp reiseruten din for å komme i gang",
    },
    activity: {
      getDirections: "Veibeskrivelse", nearbyRestaurants: "Nærliggende restauranter",
      notes: "Notater", description: "Om aktiviteten", hasNotes: "Har notater",
      time: "Tid", address: "Adresse", travelInfo: "Reiseinfo",
      findNearby: "Finn nærliggende restauranter", searchMaps: "Søk på Google Maps",
      daysPlanned: "dager planlagt", noActivities: "Ingen aktiviteter ennå",
      uploadPrompt: "Last opp reiseruten din for å komme i gang",
      weatherLow: "Min", weatherRain: "regn",
    },
    map: {
      title: "Fullstendig Rutekart", subtitle: "Alle dager kombinert",
      locations: "steder", across: "over", daysSuffix: "dager",
    },
    emergency: {
      title: "Nødnumre", subtitle: "Lagre disse før du reiser",
      police: "Politi / Nødsituasjon", ambulance: "Ambulanse", fire: "Brann",
      embassy: "Israelsk ambassade – Oslo", embassyPhone: "+47 21 01 34 00",
      tapToCall: "Trykk for å ringe",
    },
    hotel: { tonight: "Kveldens hotell", navigate: "Naviger" },
    share: { shareDay: "Del dagsplan", via: "Del via…" },
    settings: {
      title: "Innstillinger", appearance: "Utseende", language: "Språk",
      chooseLanguage: "Velg språk",
      itinerary: "Reiserute", uploadNew: "Last opp ny reiserute",
      uploadDesc: "Erstatt nåværende turdata", clearCache: "Tøm hurtigbuffer",
      clearDesc: "Tving ny innlasting", upload: "Last opp", clear: "Tøm",
      connectivity: "Tilkobling", offlineMode: "Frakoblet modus",
      offlineOn: "Bruker bufrede data", offlineOff: "Tilkoblet — synkroniserer",
      account: "Konto", signOut: "Logg ut", signOutDesc: "Logg ut av kontoen din",
      appName: "Norway Travel App", builtWith: "Laget med ❤️ for eventyret ditt",
    },
    categories: {
      sightseeing: "Severdigheter", food: "Mat", transport: "Transport",
      accommodation: "Overnatting", outdoor: "Friluft", culture: "Kultur",
      shopping: "Shopping", other: "Annet",
    },
    theme: { light: "Lys", auto: "Auto", dark: "Mørk" },
    noteLabels: { restaurant: "Restaurant", driving: "Reisetid", km: "Avstand (km)" },
    crud: {
      edit: "Rediger", delete: "Slett", save: "Lagre", cancel: "Avbryt",
      add: "Legg til aktivitet", confirmDelete: "Slette?", yes: "Ja", no: "Nei",
      activityName: "Aktivitetsnavn", city: "By", notes: "Notater",
      editDay: "Rediger dag", editActivity: "Rediger aktivitet", newActivity: "Ny aktivitet",
      deleted: "Slettet", saved: "Lagret",
    },
  },
};

export type Translations = typeof T.en;

const LanguageContext = createContext<{ lang: Language; t: Translations }>({
  lang: "he",
  t: T.he,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { language, setLanguage } = useTripStore();
  const lang: Language = language ?? "he";
  const t = T[lang] as Translations;

  useEffect(() => {
    // Set Hebrew as default on first load (if no language was ever chosen)
    if (!language) setLanguage("he");
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, language, setLanguage]);

  return (
    <LanguageContext.Provider value={{ lang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT() {
  return useContext(LanguageContext);
}

export function useDayLabel() {
  const { t } = useContext(LanguageContext);
  return (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return t.day.today;
    if (isTomorrow(d)) return t.day.tomorrow;
    return t.day.dayNames[d.getDay()];
  };
}

export function useFormatDate() {
  const { lang } = useContext(LanguageContext);
  const locale = lang === "he" ? heLocale : lang === "no" ? nbLocale : undefined;
  return (dateStr: string, pattern = "d MMMM yyyy") => {
    try {
      return format(parseISO(dateStr), pattern, locale ? { locale } : {});
    } catch {
      return dateStr;
    }
  };
}

export { T };
export type { Language };
