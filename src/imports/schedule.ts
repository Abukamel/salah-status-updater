import { omit, keys } from "lodash";
import * as storage from "./storage";
import * as moment from "moment";

export function createPrayerAlarms() {
  // Add alarms for prayers
  const prayerTimes = omit(storage.get("prayerTimes"), [
    "imsak",
    "sunrise",
    "sunset",
    "midnight"
  ]);

  // Create an alarm for each Salah
  for (const currentPrayer of keys(prayerTimes)) {
    if (Number(moment(prayerTimes[currentPrayer], "HH:mm")) > Date.now()) {
      chrome.alarms.create(currentPrayer, {
        when: Number(moment(prayerTimes[currentPrayer], "HH:mm"))
      });
    }
  }
}
