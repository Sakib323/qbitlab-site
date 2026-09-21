/**
 * Saves /survey/ answers into the Google Sheet this script is bound to.
 *
 * Setup (once, about five minutes):
 *   1. Create a Google Sheet. Extensions -> Apps Script.
 *   2. Replace the file it opens with this one. Save.
 *   3. Deploy -> New deployment -> type "Web app".
 *        Execute as: Me.    Who has access: Anyone.
 *      Google asks to authorise it; "Advanced" -> "Go to ... (unsafe)" is the
 *      normal path for your own script.
 *   4. Copy the /exec URL it gives you into contact.surveyEndpoint in
 *      src/content/site.json, then rebuild and deploy the site.
 *   5. Submit the form once and check the row lands.
 *
 * After editing this script, deploy again (Deploy -> Manage deployments ->
 * edit -> Version: New version). Saving alone does not update the live URL.
 */

var SHEET_NAME = 'Responses';

/** Sends a copy of each answer here. Set to '' to turn that off. */
var NOTIFY = 'info@qbitlab.tech';

/** Column order. Anything not listed is appended on the right as it appears. */
var COLUMNS = [
  'submittedAt',
  'ref',
  'business',
  'trade',
  'teamSize',
  'website',
  'timeSink',
  'hours',
  'places',
  'tools',
  'handOver',
  'blocker',
  'tried',
  'name',
  'email',
  'whatsapp',
  'call',
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    // The site posts JSON under a text/plain content type; a native form post
    // arrives as parameters instead.
    var raw = e.postData && e.postData.contents ? e.postData.contents.trim() : '';
    var data = raw.charAt(0) === '{' ? JSON.parse(raw) : readForm_(e);

    // Spam trap: the form's hidden field is only ever filled in by bots.
    if (data._gotcha) return reply_(e, { ok: true });
    delete data._gotcha;

    if (!data.submittedAt) data.submittedAt = new Date().toISOString();

    var sheet = getSheet_();
    var headers = getHeaders_(sheet, data);
    var row = headers.map(function (key) {
      return data[key] === undefined ? '' : data[key];
    });
    sheet.appendRow(row);

    if (NOTIFY) notify_(data);
    return reply_(e, { ok: true });
  } catch (err) {
    return reply_(e, { ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('QBitLab survey endpoint is live.');
}

/** Native form posts (the no-JavaScript path) arrive as parameters, not JSON. */
function readForm_(e) {
  var data = {};
  var params = e.parameters || {};
  Object.keys(params).forEach(function (key) {
    data[key] = params[key].join(', ');
  });
  return data;
}

function getSheet_() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  return book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
}

/** Reads row 1, adding any column this answer needs and the script doesn't have yet. */
function getHeaders_(sheet, data) {
  var width = sheet.getLastColumn();
  var headers = width ? sheet.getRange(1, 1, 1, width).getValues()[0].filter(String) : [];

  if (!headers.length) {
    headers = COLUMNS.slice();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  var added = Object.keys(data).filter(function (key) {
    return headers.indexOf(key) === -1;
  });
  if (added.length) {
    sheet.getRange(1, headers.length + 1, 1, added.length).setValues([added]).setFontWeight('bold');
    headers = headers.concat(added);
  }
  return headers;
}

function notify_(data) {
  var who = [data.business, data.trade].filter(String).join(' · ') || 'Someone';
  var lines = COLUMNS.filter(function (key) {
    return data[key];
  }).map(function (key) {
    return key + ': ' + data[key];
  });
  MailApp.sendEmail({
    to: NOTIFY,
    subject: 'Survey: ' + who,
    body: lines.join('\n\n'),
  });
}

/** JSON back to fetch; a plain thank-you page to a browser that posted the form itself. */
function reply_(e, result) {
  var posted = e.postData && e.postData.type && e.postData.type.indexOf('form') !== -1;
  if (posted) {
    return HtmlService.createHtmlOutput(
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<div style="font:17px -apple-system,Segoe UI,Roboto,sans-serif;max-width:32em;margin:12vh auto;padding:0 24px">' +
        '<h1 style="font-size:28px">Thank you — that’s exactly what we needed.</h1>' +
        '<p style="color:#6e6e73">We read every answer, and we’ll come back to you about it.</p>' +
        '<p><a href="https://qbitlab.tech/">Back to qbitlab.tech</a></p></div>',
    );
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
