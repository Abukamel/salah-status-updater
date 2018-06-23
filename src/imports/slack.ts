import { WebClient } from "@slack/client";

interface StatusObject {
  statusText: string;
  statusEmoji: string;
}

export function setDND(numberOfMinutes: number, accessToken: string) {
  const slackWebClient = new WebClient(accessToken);
  slackWebClient.dnd
    .setSnooze({ num_minutes: numberOfMinutes })
    .then(res => console.log(res))
    .catch(e => {
      throw new Error(e);
    });
}

export function endDND(accessToken: string) {
  const slackWebClient = new WebClient(accessToken);
  slackWebClient.dnd
    .endDnd()
    .then(res => console.log(res))
    .catch(e => {
      throw new Error(e);
    });
}

export function setUserStatus(profile: StatusObject, accessToken: string) {
  const slackWebClient = new WebClient(accessToken);
  slackWebClient.users.profile
    .set({
      profile: JSON.stringify({
        status_emoji: profile.statusEmoji,
        status_text: profile.statusText
      })
    })
    .then(res => console.log(res))
    .catch(e => {
      throw new Error(e);
    });
}
