/**
 * =========================================================================
 * Movie-Server Unified Database API (Google Apps Script)
 * =========================================================================
 * এই একটি স্ক্রিপ্ট দিয়েই movie-server.xlsx এর সমস্ত শিট পরিচালনা করা যাবে:
 * - movies
 * - games
 * - game_type
 * - auth
 * - gmails
 * - gmail_inventory
 * - hitlogs
 * - galleries
 * =========================================================================
 */

function getTargetSpreadsheet() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    var SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
}

function getSheetByName(sheetName, autoCreate) {
  var ss = getTargetSpreadsheet();
  var name = sheetName || "movies";
  var target = ss.getSheetByName(name);
  
  if (!target) {
    if (autoCreate) {
      target = ss.insertSheet(name);
      return target;
    }
    var allSheets = ss.getSheets().map(function(s) { return s.getName(); });
    throw new Error("Sheet '" + name + "' not found. Available sheets: " + allSheets.join(", "));
  }
  return target;
}

// -------------------------------------------------------------
// GET REQUEST HANDLER (Read Data)
// -------------------------------------------------------------
function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var sheetName = params.sheet || params.table || "movies";
    var action = params.action || "getAll";

    var sheet;
    try {
      sheet = getSheetByName(sheetName, false);
    } catch (err) {
      // If sheet doesn't exist yet, return empty list gracefully instead of 500 error
      return jsonResponse({ status: "success", sheet: sheetName, count: 0, data: [] });
    }

    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return jsonResponse({ status: "success", sheet: sheetName, count: 0, data: [] });
    }

    var headers = data[0].map(function(h) { return String(h).trim(); });
    var rows = [];

    for (var i = 1; i < data.length; i++) {
      var rowObj = { _row: i + 1 };
      for (var c = 0; c < headers.length; c++) {
        rowObj[headers[c]] = data[i][c];
      }

      // Filter by ID or Email if provided
      if (params.id && String(rowObj.id) === String(params.id)) {
        return jsonResponse({ status: "success", sheet: sheetName, data: rowObj });
      }
      if (params.drive_id && String(rowObj.drive_id) === String(params.drive_id)) {
        return jsonResponse({ status: "success", sheet: sheetName, data: rowObj });
      }
      if (params.email && String(rowObj.email).toLowerCase() === String(params.email).toLowerCase()) {
        return jsonResponse({ status: "success", sheet: sheetName, data: rowObj });
      }

      rows.push(rowObj);
    }

    if (params.id || params.drive_id || params.email) {
      return jsonResponse({ status: "error", message: "Record not found" }, 404);
    }

    return jsonResponse({
      status: "success",
      sheet: sheetName,
      count: rows.length,
      data: rows
    });

  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() }, 500);
  }
}

// -------------------------------------------------------------
// POST REQUEST HANDLER (Create, BatchAdd, ReplaceAll, Update, Delete)
// -------------------------------------------------------------
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    var requestData = {};
    if (e.postData && e.postData.contents) {
      try {
        requestData = JSON.parse(e.postData.contents);
      } catch (err) {
        requestData = e.parameter;
      }
    } else {
      requestData = e.parameter;
    }

    var sheetName = requestData.sheet || requestData.table || "movies";
    var action = requestData.action || "add";

    // Auto-create sheet if it does not exist
    var sheet = getSheetByName(sheetName, true);
    var data = sheet.getDataRange().getValues();
    var headers = (data.length > 0 && data[0].length > 0 && data[0][0] !== "")
      ? data[0].map(function(h) { return String(h).trim(); })
      : [];

    // Ensure header row exists if sheet was newly created or blank
    if (headers.length === 0) {
      var initialHeaders = requestData.headers;
      if (!initialHeaders && requestData.data) {
        initialHeaders = Object.keys(requestData.data);
      }
      if (!initialHeaders && requestData.rows && requestData.rows.length > 0) {
        initialHeaders = Object.keys(requestData.rows[0]);
      }
      if (!initialHeaders) {
        if (sheetName === "galleries") {
          initialHeaders = ["id", "drive_id", "url", "created_at"];
        } else {
          initialHeaders = ["id", "created_at"];
        }
      }
      sheet.appendRow(initialHeaders);
      headers = initialHeaders;
      data = sheet.getDataRange().getValues();
    }

    // ---------------------------------------------------------
    // ১. ADD / CREATE (একটি রো যোগ করা)
    // ---------------------------------------------------------
    if (action === "add" || action === "create") {
      var item = requestData.data || requestData;
      var newRow = [];

      for (var c = 0; c < headers.length; c++) {
        var colName = headers[c];
        var val = item[colName];

        if (colName === "id" && (val === undefined || val === null || val === "")) {
          val = String(Date.now());
        }
        if (colName === "created_at" && (val === undefined || val === null || val === "")) {
          val = new Date().toISOString();
        }

        newRow.push(val !== undefined && val !== null ? val : "");
      }

      sheet.appendRow(newRow);
      return jsonResponse({
        status: "success",
        sheet: sheetName,
        message: "Record added successfully",
        data: item
      });
    }

    // ---------------------------------------------------------
    // ২. BATCH ADD (একসাথে একাধিক রো যোগ করা)
    // ---------------------------------------------------------
    else if (action === "batchAdd") {
      var items = requestData.rows || requestData.data || [];
      if (!Array.isArray(items) || items.length === 0) {
        return jsonResponse({ status: "error", message: "No rows provided for batchAdd" }, 400);
      }

      var rows2D = [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var row = [];
        for (var c = 0; c < headers.length; c++) {
          var colName = headers[c];
          var val = item[colName];
          row.push(val !== undefined && val !== null ? val : "");
        }
        rows2D.push(row);
      }

      var startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, rows2D.length, headers.length).setValues(rows2D);

      return jsonResponse({
        status: "success",
        sheet: sheetName,
        count: rows2D.length,
        message: "Batch added successfully"
      });
    }

    // ---------------------------------------------------------
    // ৩. REPLACE ALL (পুরনো ডেটা মুছে নতুন লিস্ট রিপ্লেস করা)
    // ---------------------------------------------------------
    else if (action === "replaceAll") {
      var items = requestData.rows || requestData.data || [];
      if (!Array.isArray(items)) {
        return jsonResponse({ status: "error", message: "Array of rows required for replaceAll" }, 400);
      }

      // হেডার ছাড়া বাকি সব রো ক্লিয়ার করা
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }

      if (items.length > 0) {
        var rows2D = [];
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var row = [];
          for (var c = 0; c < headers.length; c++) {
            var colName = headers[c];
            var val = item[colName];
            row.push(val !== undefined && val !== null ? val : "");
          }
          rows2D.push(row);
        }
        sheet.getRange(2, 1, rows2D.length, headers.length).setValues(rows2D);
      }

      return jsonResponse({
        status: "success",
        sheet: sheetName,
        count: items.length,
        message: "Sheet replaced successfully"
      });
    }

    // ---------------------------------------------------------
    // ৪. UPDATE (নির্দিষ্ট রো আপডেট করা)
    // ---------------------------------------------------------
    else if (action === "update") {
      var targetId = requestData.id;
      var targetDriveId = requestData.drive_id;
      var targetEmail = requestData.email;
      var updatePayload = requestData.data || requestData;

      if (!targetId && !targetDriveId && !targetEmail) {
        return jsonResponse({ status: "error", message: "Either 'id', 'drive_id', or 'email' is required to update" }, 400);
      }

      var idColIndex = headers.indexOf("id");
      var driveIdColIndex = headers.indexOf("drive_id");
      var emailColIndex = headers.indexOf("email");
      var targetRow = -1;

      for (var i = 1; i < data.length; i++) {
        if (targetId && idColIndex !== -1 && String(data[i][idColIndex]).trim() === String(targetId).trim()) {
          targetRow = i + 1;
          break;
        }
        if (targetDriveId && driveIdColIndex !== -1 && String(data[i][driveIdColIndex]).trim() === String(targetDriveId).trim()) {
          targetRow = i + 1;
          break;
        }
        if (targetEmail && emailColIndex !== -1 && String(data[i][emailColIndex]).trim().toLowerCase() === String(targetEmail).trim().toLowerCase()) {
          targetRow = i + 1;
          break;
        }
      }

      if (targetRow === -1) {
        return jsonResponse({ status: "error", message: "Matching record not found to update" }, 404);
      }

      var currentRowValues = data[targetRow - 1];
      for (var c = 0; c < headers.length; c++) {
        var headerName = headers[c];
        if (updatePayload[headerName] !== undefined) {
          var val = updatePayload[headerName];
          if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
            val = JSON.stringify(val);
          }
          currentRowValues[c] = (val !== null && val !== undefined) ? val : "";
        }
      }
      sheet.getRange(targetRow, 1, 1, headers.length).setValues([currentRowValues]);

      return jsonResponse({
        status: "success",
        sheet: sheetName,
        message: "Record updated successfully",
        row: targetRow
      });
    }

    // ---------------------------------------------------------
    // ৫. DELETE (নির্দিষ্ট রো মুছে ফেলা)
    // ---------------------------------------------------------
    else if (action === "delete") {
      var delId = requestData.id;
      var delDriveId = requestData.drive_id;
      var delEmail = requestData.email;

      if (!delId && !delDriveId && !delEmail) {
        return jsonResponse({ status: "error", message: "Either 'id', 'drive_id', or 'email' is required to delete" }, 400);
      }

      var idIdx = headers.indexOf("id");
      var driveIdIdx = headers.indexOf("drive_id");
      var emailIdx = headers.indexOf("email");
      var deleted = false;

      for (var i = data.length - 1; i >= 1; i--) {
        var matchId = delId && idIdx !== -1 && String(data[i][idIdx]) === String(delId);
        var matchDriveId = delDriveId && driveIdIdx !== -1 && String(data[i][driveIdIdx]) === String(delDriveId);
        var matchEmail = delEmail && emailIdx !== -1 && String(data[i][emailIdx]).toLowerCase() === String(delEmail).toLowerCase();

        if (matchId || matchDriveId || matchEmail) {
          sheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }

      if (!deleted) {
        return jsonResponse({ status: "error", message: "Matching record not found to delete" }, 404);
      }

      return jsonResponse({
        status: "success",
        sheet: sheetName,
        message: "Record deleted successfully"
      });
    }

    return jsonResponse({ status: "error", message: "Invalid action" }, 400);

  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

// -------------------------------------------------------------
// HELPER: JSON Response
// -------------------------------------------------------------
function jsonResponse(obj, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
