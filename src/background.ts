import * as moment from "moment";
import * as Raven from "raven-js";
import * as constants from "./imports/constants";
import * as location from "./imports/location";
import * as schedule from "./imports/schedule";
import * as slack from "./imports/slack";
import * as storage from "./imports/storage";

Raven.config(constants.SENTRY_URL).install();

export interface SlackTeam {
  access_token: string | null;
  team_id: string | null;
  team_name: string | null;
}

chrome.runtime.onInstalled.addListener(() => {
  try {
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
      { key: "prayersIdleTime", value: constants.PRAYERS_IDLE_TIME },
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
  } catch (e) {
    Raven.captureException(e);
  }
});

chrome.runtime.onStartup.addListener(() => {
  try {
    // Add alarms for prayers
    schedule.createPrayerAlarms();
  } catch (e) {
    Raven.captureException(e);
  }
});

// Act upon triggered alarms
chrome.alarms.onAlarm.addListener(alarm => {
  try {
    if (alarm.name === "updateSalahAlarmsAfterMidnight") {
      schedule.createPrayerAlarms();
    } else if (alarm.name === "updateLocationAndSalahTimes") {
      location.setOrUpdateCurrent();
      // Removing status after Salah time is up
    } else if (
      constants.PRAYERS_STATUS_REMOVE_ALARM_NAMES.includes(alarm.name)
    ) {
      for (const team of storage.get("slackTeams")) {
        if (team && "access_token" in team) {
          // Get last slack profile status before Salah
          const lastSlackProfileStatus = storage.get(
            `lastSlackProfileStatus${team.team_id}`
          );

          // Get last slack Dnd and Snooze settings
          const lastSlackDndSnoozeSettings = storage.get(
            `lastSlackDndSnoozeSettings${team.team_id}`
          );

          // Restore last user Status
          slack.setUserStatus(
            {
              statusEmoji: lastSlackProfileStatus.profile.status_emoji,
              statusText: lastSlackProfileStatus.profile.status_text
            },
            team.access_token
          );

          // Set last Snooze settings if needed
          if (
            lastSlackDndSnoozeSettings &&
            "snooze_enabled" in lastSlackDndSnoozeSettings
          ) {
            slack.setSnooze(
              lastSlackDndSnoozeSettings.snooze_remaining -
                storage.get("prayersIdleTime")[storage.get("lastSalahName")] *
                  60,
              team.access_token
            );
          }

          // End do not disturb if needed
          if (
            "dnd_enabled" in lastSlackDndSnoozeSettings &&
            !lastSlackDndSnoozeSettings.dnd_enabled
          ) {
            slack.endDnd(team.access_token);
          }
        }
      }

      // Salah Alarms
    } else if (constants.PRAYER_NAMES.includes(alarm.name)) {
      for (const team of storage.get("slackTeams")) {
        if (team && "access_token" in team) {
          // Set an alarm to remove the status from slack
          chrome.alarms.create(`remove_${alarm.name}_status`, {
            when: Number(
              alarm.scheduledTime +
                storage.get("prayersIdleTime")[alarm.name] * 60 * 1000
            )
          });

          // Capture last profile status and emoji
          storage
            .saveSlackLastProfileStatus(team.access_token, team.team_id)
            .catch(e => {
              throw new Error(e);
            });

          // Capture last Dnd and Snooze settings
          storage.saveSlackLastDndSnoozeSettings(
            team.access_token,
            team.team_id
          );

          // Capture last Salah name
          storage.put({ key: "lastSalahName", value: alarm.name }, false);

          // Update user profile status on slack
          slack.setUserStatus(
            {
              statusEmoji: ":mosque:",
              statusText: `Praying ${alarm.name} now, will be back at ${moment(
                Date.now() +
                  storage.get("prayersIdleTime")[alarm.name] * 60 * 1000
              ).format("hh:mm A")} in shaa Allah`
            },
            team.access_token
          );

          // Activate slack Do not disturb state
          slack.setSnooze(
            storage.get("prayersIdleTime")[alarm.name],
            team.access_token
          );

          // Recreate prayer alarms every Salah
          schedule.createPrayerAlarms();
        }
      }
    }
  } catch (e) {
    Raven.captureException(e);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    // Request for adding a slack workspace
    if (request.add_slack_team) {
      chrome.tabs.create({ url: "oauth2.html" }, tab =>
        storage.put({ key: "lastOauth2TabId", value: tab.id }, false)
      );
      sendResponse({ added: true });

      // Acknowledge from oauth2.ts that slack space is added
    } else if (request.oauth2_done) {
      sendResponse({ wannaCreateAlarms: true });
      chrome.notifications.create({
        iconUrl: "prayer-128.png",
        message: "Your Status will be updated at Salah times in shaa Allah",
        requireInteraction: true,
        title: "Slack Team Added",
        type: "basic"
      });

      // Request from oauth2 for creating Salah Alarms
    } else if (request.create_alarms) {
      // Close opened oauth2.html tab
      chrome.tabs.remove([Number(storage.get("lastOauth2TabId"))]);
    }
  } catch (e) {
    Raven.captureException(e);
  }
  return true;
});
