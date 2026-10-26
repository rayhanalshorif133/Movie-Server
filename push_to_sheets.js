/**
 * Utility script to push any table data (from utils/dummyData or data/*.csv)
 * directly to the live Google Sheets via Google Apps Script API.
 * Usage:
 *   node push_to_sheets.js galleries
 *   node push_to_sheets.js movies
 */

const { 
  dummyGalleries, 
  dummyMovies, 
  dummyGames, 
  dummyGameTypes, 
  dummyGmails, 
  dummyGmailInventory, 
  dummyHitlogs 
} = require('./utils/dummyData');

const API_URL = process.env.NEXT_GOOGLE_SHEET_API_URL || 
  "https://script.google.com/macros/s/AKfycbyopn16A3wM7tulOBRs18t6Xgb2_Bo4k_n_W__4u-r13VTdjHxy2uIP1e1Wvjh9c0ZptQ/exec";

const datasetMap = {
  galleries: dummyGalleries,
  movies: dummyMovies,
  games: dummyGames,
  game_type: dummyGameTypes,
  gmails: dummyGmails,
  gmail_inventory: dummyGmailInventory,
  hitlogs: dummyHitlogs
};

async function pushSheet(sheetName) {
  const data = datasetMap[sheetName];
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.error(`No data found for sheet: '${sheetName}'`);
    return;
  }

  console.log(`Starting push for sheet [${sheetName}] with ${data.length} total rows...`);

  // Step 1: Replace first batch of up to 300 rows
  const BATCH_SIZE = 300;
  const firstBatch = data.slice(0, BATCH_SIZE);

  try {
    console.log(`Sending replaceAll with initial batch of ${firstBatch.length} rows...`);
    const res1 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        sheet: sheetName,
        action: 'replaceAll',
        headers: Object.keys(firstBatch[0] || {}),
        rows: firstBatch
      })
    });
    const res1Json = await res1.json();
    console.log(`Initial batch response:`, res1Json);

    if (res1Json.status !== 'success') {
      console.error(`Failed initial batch for ${sheetName}:`, res1Json.message);
      return;
    }

    // Step 2: Append subsequent batches with batchAdd
    for (let i = BATCH_SIZE; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      console.log(`Sending batchAdd: rows ${i + 1} to ${Math.min(i + BATCH_SIZE, data.length)}...`);
      const resBatch = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          sheet: sheetName,
          action: 'batchAdd',
          rows: batch
        })
      });
      const batchJson = await resBatch.json();
      console.log(`Batch ${i / BATCH_SIZE + 1} response:`, batchJson.status);
    }

    console.log(`Successfully completed push for sheet: '${sheetName}' (${data.length} rows)!`);
  } catch (err) {
    console.error(`Network or script error while pushing ${sheetName}:`, err);
  }
}

const targetSheet = process.argv[2] || 'galleries';
pushSheet(targetSheet);

