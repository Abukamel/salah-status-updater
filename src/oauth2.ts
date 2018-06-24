import * as Raven from "raven-js";
import * as constants from "./imports/constants";
import * as storage from "./imports/storage";

Raven.config(constants.SENTRY_URL).install();

window.onload = () => {
  try {
    NProgress.start();
    // Save oauth2 access_token from slack into storage
    chrome.identity.launchWebAuthFlow(
      {
        interactive: true,
        url: `${constants.SLACK_AUTHORIZE_URL}?client_id=${
          constants.SLACK_CLIENT_ID
        }&scope=${constants.SLACK_SCOPE}&redirect_uri=${
          constants.HEROKU_REDIRECT_URL
        }`
      },
      (redirectURI: string) => {
        NProgress.done();
        const parsedUrl = new URL(redirectURI);
        const slackCredentials = {
          access_token: parsedUrl.searchParams.get("access_token"),
          team_id: parsedUrl.searchParams.get("team_id"),
          team_name: parsedUrl.searchParams.get("team_name")
        };
        storage.put({ key: "slackTeams", value: slackCredentials }, true);
        chrome.browserAction.setBadgeText({ text: "" });
        chrome.runtime.sendMessage({ oauth2_done: true }, msg => {
          if (msg && msg.wannaCreateAlarms) {
            chrome.runtime.sendMessage({ create_alarms: true });
          }
        });
      }
    );
  } catch (e) {
    Raven.captureException(e);
    throw new Error(e.message);
  }
};
