import { enUS, fr, uk } from "date-fns/locale";

export function getFNSLocale(locale: string) {
  switch (locale) {
    case "uk": {
      return uk;
    }
    case "en": {
      return enUS;
    }
    case "fr": {
      return fr;
    }
    default: {
      return enUS;
    }
  }
}
