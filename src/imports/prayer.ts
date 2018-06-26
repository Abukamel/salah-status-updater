import * as Raven from "raven-js";
import * as constants from "./constants";
import { prayTimes } from "./PrayTimes";
import * as storage from "./storage";

Raven.config(constants.SENTRY_URL).install();

interface LocationTimezoneInfo {
  dayLightSaving: number;
  latitude: number;
  longitude: number;
  timezoneOffset: number;
  timeFormat: string;
}

export function setOrUpdateTimes(locationTimezoneInfo: LocationTimezoneInfo) {
  try {
    storage.put(
      {
        key: "prayerTimes",
        value: prayTimes.getTimes(
          new Date(),
          [locationTimezoneInfo.latitude, locationTimezoneInfo.longitude],
          locationTimezoneInfo.timezoneOffset,
          locationTimezoneInfo.dayLightSaving,
          locationTimezoneInfo.timeFormat || constants.TIME_FORMAT
        )
      },
      false
    );
  } catch (e) {
    Raven.captureException(e);
  }
}
