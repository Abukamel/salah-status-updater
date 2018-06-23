import { WebClient } from "@slack/client";

interface StatusObject {
  statusText: string;
  statusEmoji: string;
}

export function setSnooze(numberOfMinutes: number, accessToken: string) {
  const slackWebClient = new WebClient(accessToken);
  slackWebClient.dnd.setSnooze({ num_minutes: numberOfMinutes }).catch(e => {
    throw new Error(e);
  });
}

export function endDnd(accessToken: string) {
  const slackWebClient = new WebClient(accessToken);
  slackWebClient.dnd.endDnd().catch(e => {
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
    .catch(e => {
      throw new Error(e);
    });
}
