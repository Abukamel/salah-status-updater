// @ts-ignore
import * as log from "loglevel";
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

export async function setOrUpdateTimes(
  locationTimezoneInfo: LocationTimezoneInfo
) {
  storage
    .put(
      {
        key: "prayerTimes",
        value: await prayTimes.getTimes(
          new Date(),
          [locationTimezoneInfo.latitude, locationTimezoneInfo.longitude],
          locationTimezoneInfo.timezoneOffset,
          locationTimezoneInfo.dayLightSaving,
          locationTimezoneInfo.timeFormat || config.TIME_FORMAT
        )
      },
      false
    )
    .then(response => log.info(response))
    .catch(e => log.error(e));
}
