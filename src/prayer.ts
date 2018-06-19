import * as config from "./config";
import { prayTimes } from "./PrayTimes";
import * as storage from "./storage";

interface LocationTimezoneInfo {
  dayLightSaving: number;
  latitude: number;
  longitude: number;
  timezoneOffset: number;
  timeFormat: string;
}

export async function setOrUpdateTimes(locationTimezoneInfo: LocationTimezoneInfo) {
  await storage.put(
    {
      key: "prayerTimes",
      value: prayTimes.getTimes(
        new Date(),
        [locationTimezoneInfo.latitude, locationTimezoneInfo.longitude],
        locationTimezoneInfo.timezoneOffset,
        locationTimezoneInfo.dayLightSaving,
        locationTimezoneInfo.timeFormat = config.TIME_FORMAT,
      )
    },
    false
  );
}
