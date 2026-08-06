import { type DataDeliveryBatchData, type DataDeliveryFile } from "./types.js";

type DateTypes = [Date, string];

export function generateDateFromString(dateString: string, timeString: string): DateTypes {
  const day = dateString.substring(0, 2);
  const month = dateString.substring(2, 4);
  const year = dateString.substring(4, 8);

  const time = timeString.match(/.{1,2}/g);
  let [hours, minutes, seconds] = ["0", "0", "0"];

  if (time != null) {
    if (time.length >= 3) {
      [hours, minutes, seconds] = time;
    }
  }

  return [
    new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`),
    `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`,
  ];
}

export function dataDeliveryFilenameToData(dd_filename: string): DataDeliveryFile {
  if (!dd_filename.match(/^[a-zA-Z]{2}_.{8,}_?[0-9]{8}_[0-9]{4,}/)) {
    return {
      instrumentName: dd_filename,
    };
  }

  const [, instrumentName, instrumentCohort] = dd_filename.split("_");

  return {
    instrumentName: `${instrumentName}${instrumentName.startsWith("LM") ? `_${instrumentCohort}` : ""}`,
  };
}

export function batchToData(batchName: string): DataDeliveryBatchData {
  let survey: string = "";
  let originalDateString: string;
  let timeString: string;

  if (batchName.match(/^[0-9]{8}_[0-9]{6}$/)) {
    // example 26032021_080842
    [originalDateString, timeString] = batchName.split("_");
  } else if (batchName.match(/^[a-zA-Z]*_[0-9]{8}_[0-9]{6}$/)) {
    // example OPN_26032021_080842
    [survey, originalDateString, timeString] = batchName.split("_");
  } else if (batchName.match(/^[a-zA-Z]{3}[0-9]{4}_[a-zA-Z0-9]{3}_[0-9]{8}_[0-9]{6}$/)) {
    // example LMS2212_FB1_26032021_080842
    const batchInfo = batchName.split("_");

    survey = batchInfo[0].substring(0, 2);
    originalDateString = batchInfo[2];
    timeString = batchInfo[3];
  } else if (batchName.match(/^[a-zA-Z]{3}[0-9]{4}[a-zA-Z]_[0-9]{8}_[0-9]{6}$/)) {
    // example OPN2101A_30032021_141600
    const batchInfo = batchName.split("_");

    survey = batchInfo[0].substring(0, 3);
    originalDateString = batchInfo[1];
    timeString = batchInfo[2];
  } else {
    throw new Error(`Unrecognised batch name format: "${batchName}"`);
  }

  const [date, dateString] = generateDateFromString(originalDateString, timeString);

  return {
    survey: survey,
    date: date.toISOString(),
    dateString: dateString,
    name: batchName,
  };
}
