import { prayTimes } from "./PrayTimes";
import * as storage from "./storage";

interface LocationTimezoneInfo {
  dayLightSaving: boolean;
  latitude: string;
  longitude: string;
  timezoneOffset: string;
  timeFormat: string;
}

export function putOrUpdateTimes(locationTimezoneInfo: LocationTimezoneInfo) {
  storage.put(
    {
      key: "prayerTimes",
      value: prayTimes.getTimes(
        new Date(),
        [locationTimezoneInfo.latitude, locationTimezoneInfo.longitude],
        locationTimezoneInfo.timezoneOffset,
        locationTimezoneInfo.dayLightSaving,
        locationTimezoneInfo.timeFormat = "24h",
      )
    },
    false
  );
}
