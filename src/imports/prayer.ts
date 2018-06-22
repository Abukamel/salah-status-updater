import * as constants from "./constants";
import { prayTimes } from "./PrayTimes";
import * as storage from "./storage";

interface LocationTimezoneInfo {
  dayLightSaving: number;
  latitude: number;
  longitude: number;
  timezoneOffset: number;
  timeFormat: string;
}

export function setOrUpdateTimes(locationTimezoneInfo: LocationTimezoneInfo) {
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

  // For testing purposes fake times
  // storage.put(
  //   {
  //     key: "prayerTimes",
  //     value: {
  //       asr: "15:07",
  //       dhuhr: "11:41",
  //       fajr: "03:17",
  //       imsak: "03:07",
  //       isha: "22:26",
  //       maghrib: "22:23",
  //       midnight: "23:41",
  //       sunrise: "04:48",
  //       sunset: "18:35"
  //     }
  //   },
  //   false
  // );
}