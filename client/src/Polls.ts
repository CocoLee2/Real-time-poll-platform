import { isRecord } from "./record";

// Description of an individual poll
export type Poll = {
  readonly name: string,
  readonly option: string[],
  readonly votedOption: number[],
  readonly endTime: number,
  readonly totalvotes: number
};

/**
 * Parses unknown data into a Poll. Will log an error and return undefined
 * if it is not a valid Poll.
 * @param val unknown data to parse into an Poll
 * @return Poll if val is a valid Poll and undefined otherwise
 */
export const parsePoll = (val: unknown): Poll | undefined => {
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
  
  return {
    name: val.name,
    option: optionsArray,
    votedOption: [],
    endTime: val.endTime,
    totalvotes: 0
  };
};
