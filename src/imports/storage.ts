import { isEqual, uniqWith } from "lodash";
import * as store from "store";

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
    throw new Error(e);
  }
}

export function get(key: string) {
  return store.get(key);
}

export function deleteSlackTeam(teamID: number) {
  const slackTeams = get("slackTeams");
  if (slackTeams) {
    store.set(
      "slackTeams",
      slackTeams.filter((team: any) => team.team_id !== teamID)
    );
  }
}
