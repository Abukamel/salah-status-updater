import { keys, omit } from "lodash";
import * as moment from "moment";
import * as Raven from "raven-js";
import { SENTRY_URL } from "./constants";
import * as storage from "./storage";


Raven.config(SENTRY_URL).install();

export function createPrayerAlarms() {
  try {
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
  } catch (e) {
    Raven.captureException(e);
    throw new Error(e.message);
  }
}
