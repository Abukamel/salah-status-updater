import { WebClient } from "@slack/client";
import * as Raven from "raven-js";
import { SENTRY_URL } from "./constants";

Raven.config(SENTRY_URL).install();

interface StatusObject {
  statusText: string;
  statusEmoji: string;
}

export function setSnooze(numberOfMinutes: number, accessToken: string) {
  const slackWebClient = new WebClient(accessToken);
  slackWebClient.dnd.setSnooze({ num_minutes: numberOfMinutes }).catch(e => {
    Raven.captureException(e);
    throw new Error(e.message);
  });
}

export function endDnd(accessToken: string) {
  const slackWebClient = new WebClient(accessToken);
  slackWebClient.dnd.endDnd().catch(e => {
    Raven.captureException(e);
    throw new Error(e.message);
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
      Raven.captureException(e);
      throw new Error(e.message);
    });
}
