// tslint:disable:no-console
import * as config from "./config";
import * as storage from "./storage";

export interface SlackTeam {
  access_token: string | null;
  team_id: string | null;
  team_name: string | null;
}

setInterval(() => {
  storage.get("slackTeams")
    ? chrome.browserAction.setBadgeText({ text: "" })
    : chrome.browserAction.setBadgeText({ text: "ADD" });
}, 10 * 1000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.add_slack_team) {
    chrome.identity.launchWebAuthFlow(
      {
        interactive: true,
        url: `${config.slackAuthorizeURL}?client_id=${
          config.slackClientID
        }&scope=${config.slackScope}&redirect_uri=${config.herokuRedirectURI}`
      },
      async (redirectURI: string) => {
        const parsedURL = new URL(redirectURI);
        const slackCredentials = {
          access_token: parsedURL.searchParams.get("access_token"),
          team_id: parsedURL.searchParams.get("team_id"),
          team_name: parsedURL.searchParams.get("team_name")
        };
        await storage.put({ key: "slackTeams", value: slackCredentials }, true);
        sendResponse({ added: true });
      }
    );
  }
});

// setInterval(
//   () => navigator.geolocation.getCurrentPosition(success, error, options),
//   60 * 1000
// );
