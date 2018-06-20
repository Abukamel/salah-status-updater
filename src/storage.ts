import * as _ from "lodash";
// @ts-ignore
import * as log from "loglevel";
import * as store from "store";

interface StoreData {
  key: string;
  value: any;
}

export async function put(data: StoreData, combine: boolean) {
  try {
    const currentVersion = await store.get(data.key);
    if (currentVersion instanceof Array) {
      currentVersion.push(data.value);
      const newVersion = _.uniqWith(currentVersion, _.isEqual);
      await store.set(data.key, newVersion);
    } else if (!currentVersion && combine) {
      await store.set(data.key, [data.value]);
    } else {
      await store.set(data.key, data.value);
    }
  } catch (e) {
    log.error(e);
  }
}

export function get(key: string) {
  return store.get(key);
}
