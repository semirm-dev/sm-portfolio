import type { CareerRecord } from "~/types/career";
import rawRecord from "../data/career.json";

/**
 * The one seam between the site and where its data lives.
 *
 * Today that is a JSON file imported as a module. Binding it to a
 * `CareerRecord`-typed constant below (rather than asserting with `as`) is
 * checked by assignability, not comparability: a project missing a required key
 * — even just one, among nine others that have it — fails the build, because
 * that key does not silently reconcile to optional-and-undefined the way it
 * would under `as`. Swapping the JSON for a database is a change to this
 * function body and nothing else: the endpoint, the composable and every
 * component above them only know they receive a `CareerRecord`.
 */
const record: CareerRecord = rawRecord;

export function getCareer(): Promise<CareerRecord> {
  return Promise.resolve(record);
}
