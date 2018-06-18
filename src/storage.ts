import * as _ from "lodash";
import * as store from "store";

interface StoreData {
  key: string,
  value: any
}

export function put(data: StoreData, combine: boolean) {
  const currentVersion = store.get(data.key);
  if (currentVersion instanceof Array) {
    currentVersion.push(data.value);
    const newVersion = _.uniqWith(currentVersion, _.isEqual);
    store.set(data.key, newVersion);
  } else if (!currentVersion && combine) {
    store.set(data.key, [data.value,]);
  } else {
    store.set(data.key, data.value);
  }
}

export function get(key: string) {
 return(store.get(key)) ;
}
