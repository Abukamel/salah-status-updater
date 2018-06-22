import * as moment from "moment";
import * as constants from "./imports/constants";
import * as location from "./imports/location";
import * as schedule from "./imports/schedule";
import * as slack from "./imports/slack";
import * as storage from "./imports/storage";

export interface SlackTeam {
  access_token: string | null;
  team_id: string | null;
  team_name: string | null;
}

chrome.runtime.onInstalled.addListener(() => {
  // Alert user to connect
  if (!storage.get("slackTeams")) {
    chrome.browserAction.setBadgeText({
      text: "New!"
    });
  }

  // Set current geographic location
  location.setOrUpdateCurrent();

  // Set default prayers idle time
  storage.put(
    { key: "prayersIdleTime", value: constants.prayersIdleTime },
    false
  );

  // Update current location and Salah times every 6 hour
  chrome.alarms.create("updateLocationAndSalahTimes", {
    periodInMinutes: 360,
    when: Date.now()
  });

  // Update Salah Alarms everyday after midnight
  chrome.alarms.create("updateSalahAlarmsAfterMidnight", {
    periodInMinutes: 1440,
    when: Number(moment("0:1", "HH:mm"))
  });

  setTimeout(() => {
    // Add alarms for prayers
    schedule.createPrayerAlarms();
  }, 10 * 1000);
});

chrome.runtime.onStartup.addListener(() => {
  // Add alarms for prayers
  schedule.createPrayerAlarms();
});

// Act upon triggered alarms
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === "updateSalahAlarmsAfterMidnight") {
    schedule.createPrayerAlarms();
  } else if (alarm.name === "updateLocationAndSalahTimes") {
    location.setOrUpdateCurrent();
    // Removing status after Salah time is up
  } else if (constants.prayersStatusRemoveAlarmNames.includes(alarm.name)) {
    for (const team of storage.get("slackTeams")) {
      if (team && team.access_token) {
        // End do not disturb
        slack.endDND(team.access_token);

        // Remove Status
        slack.setUserStatus(
          { statusEmoji: "", statusText: "" },
          team.access_token
        );
      }
    }

    // Salah Alarms
  } else if (constants.prayerNames.includes(alarm.name)) {
    for (const team of storage.get("slackTeams")) {
      if (team && team.access_token) {
        // Set an alarm to remove the status from slack
        chrome.alarms.create(`remove_${alarm.name}_status`, {
          when: Number(
            alarm.scheduledTime +
              constants.prayersIdleTime[alarm.name] * 60 * 1000
          )
        });

        // Update user profile status on slack
        slack.setUserStatus(
          {
            statusEmoji: ":mosque:",
            statusText: `Praying ${alarm.name} now, will be back after ${
              constants.prayersIdleTime[alarm.name]
            }m in shaa Allah`
          },
          team.access_token
        );

        // Activate slack Do not disturb state
        slack.setDND(constants.prayersIdleTime[alarm.name], team.access_token);

        // Recreate prayer alarms every Salah
        schedule.createPrayerAlarms();
      }
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Request for adding a slack workspace
  if (request.add_slack_team) {
    chrome.tabs.create({ url: "oauth2.html" }, tab =>
      storage.put({ key: "lastOauth2TabId", value: tab.id }, false)
    );
    sendResponse({ added: true });

    // Ackowledge from oauth2.ts that slack space is added
  } else if (request.oauth2_done) {
    sendResponse({ wannaCreateAlarms: true });

    // Request from oauth2 for creating Salah Alarms
  } else if (request.create_alarms) {
    // Close opened oauth2.html tab
    chrome.tabs.remove([Number(storage.get("lastOauth2TabId"))]);
  }
  return true;
});
