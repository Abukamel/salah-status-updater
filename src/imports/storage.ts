import { WebClient } from "@slack/client";
import { isEqual, uniqWith } from "lodash";
import * as Raven from "raven-js";
import * as store from "store";
import { SENTRY_URL } from "./constants";

Raven.config(SENTRY_URL).install();

interface StoreData {
  key: string;
  value: any;
}


export function put(data: StoreData, combine: boolean) {
  try {
    const currentVersion = store.get(data.key);
    if (currentVersion instanceof Array) {
      currentVersion.push(data.value);
      const newVersion = uniqWith(currentVersion, isEqual);
      store.set(data.key, newVersion);
    } else if (!currentVersion && combine) {
      store.set(data.key, [data.value]);
    } else {
      store.set(data.key, data.value);
    }
  } catch (e) {
    Raven.captureException(e);
    throw new Error(e.message);
  }
}

export function get(key: string) {
  return store.get(key);
}

export function deleteSlackTeam(teamID: number) {
  try {
    const slackTeams = get("slackTeams");
    if (slackTeams) {
      store.set(
        "slackTeams",
        slackTeams.filter((team: any) => team.team_id !== teamID)
      );
    }
  } catch (e) {
   Raven.captureException(e);
  }
}

export function saveSlackLastProfileStatus(
  accessToken: string,
  teamId: string
) {
  const slackWebClient = new WebClient(accessToken);
  return slackWebClient.users.profile
    .get()
    .then((result: any) =>
      put(
        {
          key: `lastSlackProfileStatus${teamId}`,
          value: result
        },
        false
      )
    )
    .catch(e => {
      Raven.captureException(e);
      throw new Error(e.message);
    });
}

export function saveSlackLastDndSnoozeSettings(
  accessToken: string,
  teamId: string
) {
  const slackWebClient = new WebClient(accessToken);
  slackWebClient.dnd
    .info()
    .then((result: any) =>
      put(
        {
          key: `lastSlackDndSnoozeSettings${teamId}`,
          value: result
        },
        false
      )
    )
    .catch(e => {
      Raven.captureException(e);
      throw new Error(e.message);
    });
}
