// TODO: switch to user properties
const props = JSON.parse(PropertiesService.getScriptProperties().getProperty("SERVICE_ACCOUNT")!);
const firestore = FirestoreApp.getFirestore(props.client_email, props.private_key, props.project_id);

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

/**
 * Calculates the champion and loser of an event and syncs the data with the house website. Sheet MUST be named after the season.
 *
 * @param {Array<Array<string>>} data Event data in the order of tier, start_date, end_date, title, albemarle, ettl, hobler, lambert
 * @param {string} [ref] The ID of the event in Firestore
 * @return The champion and loser of the event
 * @customfunction
 */
function EVENT(data: string[][], ref?: string) {
  // Flatten 2D array and replace empty cells with null
  const flattened = data[0].map((x) => (x === "" ? null : x));

  const [tier, start_date, end_date, title, albemarle, ettl, hobler, lambert] = flattened;

  if (!title || !ref) {
    return;
  }

  firestore.updateDocument(`events/${ref}`, {});
}
