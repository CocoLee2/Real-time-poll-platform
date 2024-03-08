import { isRecord } from "./record";

// Description of an individual poll
export type Poll = {
  readonly name: string,
  readonly endTime: number,  // ms since epoch
  readonly options: string,
  readonly result: string
};

/**
 * Parses unknown data into a Poll. Will log an error and return undefined
 * if it is not a valid Poll.
 * @param val unknown data to parse into an Poll
 * @return Poll if val is a valid Poll and undefined otherwise
 */
export const parsePoll = (val: unknown): undefined | Poll => {
  if (!isRecord(val)) {
    console.error("not a poll", val)
    return undefined;
  }
  if (typeof val.name !== "string") {
    console.error("not a poll: missing 'name'", val)
    return undefined;
  }
  if (typeof val.endTime !== "number" || val.endTime < 0 || isNaN(val.endTime)) {
    console.error("not a poll: missing or invalid 'endTime'", val)
    return undefined;
  }
  if (typeof val.options !== "string") {
    console.error("not a poll: missing 'options'", val)
    return undefined;
  }
  const optionsArray = val.options.split('\n').map((option: string) => option.trim());
  if (optionsArray.length < 2) {
    console.error("not a poll: 'options' should contain at least two lines");
    return undefined;
  }
  if (typeof val.result !== "string") {
    console.error("not a poll: missing 'result'", val)
    return undefined;
  }
  
  return {
    name: val.name, endTime: val.endTime, options: val.options, result: val.result
  }

};
