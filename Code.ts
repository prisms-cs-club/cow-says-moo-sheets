import type { HouseEvent } from "./format";

// TODO: switch to user properties
const props = JSON.parse(PropertiesService.getScriptProperties().getProperty("SERVICE_ACCOUNT")!);
const firestore = FirestoreApp.getFirestore(props.client_email, props.private_key, props.project_id);

var index: string[] = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(1, 1, 1, 10).getValues()[0].map(x => x.toLowerCase());

/**
 * Creates Firestore documents for events that do not already have a reference.
 */
function sync2() {
  // Find all cells with the formula =EVENT(...) and only one argument
  const matches = SpreadsheetApp.getActiveSpreadsheet()
    .createTextFinder("=EVENT\\(\\s*([^,\\s]+)\\s*\\)")
    .useRegularExpression(true)
    .matchFormulaText(true);

  while (matches.findNext()) {
    const ref = firestore.createDocument("events").name?.split("/").pop();
    if (ref) matches.replaceWith(`=EVENT($1, "${ref}")`);
  }
}

/**
 * Updates newly created EVENT formulas to include the Firestore reference.
 *
 * @param e - The event data
 */
function sync(e: GoogleAppsScript.Events.SheetsOnEdit) {
  const formulas = e.range.getFormulas();
  for (const i in formulas) {
    for (const j in formulas[i]) {
      // const match = formulas[i][j].match(/=EVENT\(\s*([^,\s]+)\s*\)/);
      // if (match) {
      //   const ref = firestore.createDocument("events").name?.split("/").pop();
      //   if (ref) {
      //   }
      // }
      Logger.log(formulas[i][j].replaceAll(" ", "$"));
    }
  }
  // e.range.setFormulas(
  //   formulas.map((_) =>
  //     _.map((formula) => formula.replace(/=EVENT\(\s*([^,\s]+)\s*\)/, `=EVENT($1, ${Logger.log("hello")})`))
  //   )
  // );
}

function parseEntry(entry: Record<string, string | null>): HouseEvent {
  let tier = null;
  switch(entry["tier"]) {
    case "I": tier = 1; break;
    case "II": tier = 2; break;
    case "III": tier = 3; break;
    case "IV": tier = 4; break;
    default: throw new Error("Invalid tier.");
  }
  let dateStart = null;
  let dateEnd = null;
  if(entry["date"] == null) {
    throw new Error("Date must not be empty.");
  }
  const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  if(typeof(entry["date"]) === "object" || entry["date"].match(dateRegex)) {
    // check if the date string is a valid date
    dateStart = new Date(entry["date"]);
    dateEnd = new Date(entry["date"]);
  } else {
    // check if the date string is two dates splited by a '-' or a space
    let dates = entry["date"].split(/[\s\-]/).filter(s => s !== "");
    if(dates.length === 2 && dates[0].match(dateRegex) && dates[1].match(dateRegex)) {
      dateStart = new Date(dates[0]);
      dateEnd = new Date(dates[1]);
    } else if(dates[0].match(dateRegex)) {
      dateStart = new Date(dates[0]);
      dateEnd = new Date(dates[0]);
    } else {
      throw new Error("Invalid date format.");
    }
  }
  const title = entry["title"]!;
  const signupLink = entry["signupLink"] ?? undefined;
  const albemarle = entry["albemarle"];
  const ettl = entry["ettl"];
  const hobler = entry["hobler"];
  const lambert = entry["lambert"];
  let result = undefined;
  if(albemarle !== null && ettl !== null && hobler !== null && lambert !== null) {
    result = {
      albemarle: parseInt(albemarle),
      ettl: parseInt(ettl),
      hobler: parseInt(hobler),
      lambert: parseInt(lambert),
    };
  }
  const winner = entry["champion of event"];

  return {
    tier,
    dateStart,
    dateEnd,
    title,
    result,
    description: "",
    winner: winner ?? undefined,
    signupLink,
  };
}

/**
 * Calculates the champion and loser of an event and syncs the data with the house website. Sheet MUST be named after the season.
 *
 * @param {Array<Array<string>>} data Event data in the order of tier, start_date, end_date, title, albemarle, ettl, hobler, lambert
 * @param {string} [ref] The ID of the event in Firestore
 * @return The champion and loser of the event
 * @customfunction
 */
function EVENT(data: string[][], ref: string) {
  if(!ref) {
    throw new Error("Reference must not be empty.");
  }
  // Flatten 2D array and replace empty cells with null
  const flattened = data[0].map((x) => (x === "" || x === "#N/A" ? null : x));
  if(index.length !== flattened.length) {
    throw new Error("Data and index must have the same length.");
  }

  const entry = index.reduce((acc, cur, i) => {
    acc[cur] = flattened[i];
    return acc;
  }, {} as Record<string, string | null>);

  try {
    let event = parseEntry(entry);
    firestore.updateDocument(`events/${ref}`, event);
    return "√ Updated";
  } catch(e) {
    throw e;
  }
}
