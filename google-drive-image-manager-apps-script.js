/**
 * =========================================================================
 * Movie-Server Google Drive Image Manager (Google Apps Script)
 * =========================================================================
 * এই স্ক্রিপ্ট দিয়ে নির্দিষ্ট ফোল্ডারে ইমেজ আপলোড, ডিলিট, আপডেট ও ফেচ করা যাবে।
 * Target Google Drive Folder: 
 * https://drive.google.com/drive/folders/1vMGg-h4c8FnDRHTujkaTd3IV0zWXdSN0?usp=sharing
 * =========================================================================
 */

// আপনার টার্গেট ফোল্ডার আইডি
var TARGET_FOLDER_ID = "1vMGg-h4c8FnDRHTujkaTd3IV0zWXdSN0";

function getTargetFolder() {
  try {
    return DriveApp.getFolderById(TARGET_FOLDER_ID);
  } catch (err) {
    throw new Error("Target folder not found. Please verify TARGET_FOLDER_ID: " + TARGET_FOLDER_ID);
  }
}

// -------------------------------------------------------------------------
// GET REQUEST HANDLER (ব্রাউজারে টেস্ট করা অথবা ফাইল লিস্ট/ইনফো দেখা)
// -------------------------------------------------------------------------
function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || "list";

    // ১. নির্দিষ্ট ফাইলের ইনফো দেখা
    if (params.fileId) {
      var file = DriveApp.getFileById(params.fileId);
      return jsonResponse({
        status: "success",
        id: file.getId(),
        name: file.getName(),
        size: file.getSize(),
        mimeType: file.getMimeType(),
        url: "https://drive.google.com/uc?id=" + file.getId(),
        directUrl: "https://lh3.googleusercontent.com/d/" + file.getId()
      });
    }

    // ২. ফোল্ডারের ফাইল তালিকা দেখা
    var folder = getTargetFolder();
    var filesIterator = folder.getFiles();
    var fileList = [];
    var limit = params.limit ? parseInt(params.limit) : 100;

    while (filesIterator.hasNext() && fileList.length < limit) {
      var f = filesIterator.next();
      fileList.push({
        id: f.getId(),
        name: f.getName(),
        size: f.getSize(),
        mimeType: f.getMimeType(),
        created_at: f.getDateCreated(),
        directUrl: "https://lh3.googleusercontent.com/d/" + f.getId(),
        downloadUrl: "https://drive.google.com/uc?export=download&id=" + f.getId()
      });
    }

    return jsonResponse({
      status: "success",
      folderId: TARGET_FOLDER_ID,
      folderName: folder.getName(),
      count: fileList.length,
      files: fileList
    });

  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() }, 500);
  }
}

// -------------------------------------------------------------------------
// POST REQUEST HANDLER (Upload, Delete, Update, Rename)
// -------------------------------------------------------------------------
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
      requestData = e.parameter || {};
    }

    var action = requestData.action;

    // ---------------------------------------------------------------------
    // ১. DELETE FILE (ফাইল মুছে ফেলা / ট্র্যাশে পাঠানো - একক বা মাল্টিপল)
    // ---------------------------------------------------------------------
    if (action === "delete" || action === "batchDelete") {
      var fileIds = requestData.fileIds || 
                    (requestData.fileId ? [requestData.fileId] : 
                    (requestData.id ? [requestData.id] : []));
      
      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return jsonResponse({ status: "error", error: "Missing fileId or fileIds parameter" }, 400);
      }

      var deleted = [];
      var errors = [];

      for (var i = 0; i < fileIds.length; i++) {
        var fId = String(fileIds[i]).trim();
        if (!fId) continue;
        try {
          var file = DriveApp.getFileById(fId);
          file.setTrashed(true); // Move to trash safely
          deleted.push(fId);
        } catch (fErr) {
          errors.push({ id: fId, error: fErr.toString() });
        }
      }

      return jsonResponse({
        status: "success",
        message: deleted.length + " file(s) moved to trash successfully",
        deletedCount: deleted.length,
        deletedIds: deleted,
        errors: errors.length > 0 ? errors : undefined
      });
    }

    // ---------------------------------------------------------------------
    // ২. UPDATE / REPLACE FILE (ইমেজ কনটেন্ট রিপ্লেস বা রিনেম করা)
    // ---------------------------------------------------------------------
    else if (action === "update" || action === "replace") {
      var oldFileId = requestData.fileId || requestData.id;
      if (!oldFileId) {
        return jsonResponse({ status: "error", error: "Missing fileId parameter" }, 400);
      }

      var oldFile = DriveApp.getFileById(oldFileId);

      // যদি নতুন ইমেজ ডেটা (base64) পাঠানো হয়, তবে নতুন ইমেজ সেভ করে পুরনোটি ট্র্যাশ করা হবে
      if (requestData.base64) {
        var bytes = Utilities.base64Decode(requestData.base64);
        var mimeType = requestData.mimeType || oldFile.getMimeType() || "image/jpeg";
        var fileName = requestData.fileName || oldFile.getName();
        var blob = Utilities.newBlob(bytes, mimeType, fileName);

        var folder = getTargetFolder();
        var newFile = folder.createFile(blob);

        // পাবলিক ভিউ পারমিশন সেট
        newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        // পুরনো ফাইল ট্র্যাশে পাঠানো
        oldFile.setTrashed(true);

        return jsonResponse({
          status: "success",
          message: "Image replaced successfully",
          id: newFile.getId(),
          oldFileId: oldFileId,
          name: newFile.getName(),
          url: "https://drive.google.com/uc?id=" + newFile.getId(),
          directUrl: "https://lh3.googleusercontent.com/d/" + newFile.getId()
        });
      }

      // শুধু ফাইলের নাম পরিবর্তন
      if (requestData.fileName) {
        oldFile.setName(requestData.fileName);
        return jsonResponse({
          status: "success",
          message: "File renamed successfully",
          id: oldFile.getId(),
          name: oldFile.getName()
        });
      }

      return jsonResponse({ status: "error", error: "No update parameters (base64 or fileName) provided" }, 400);
    }

    // ---------------------------------------------------------------------
    // ৩. UPLOAD IMAGE (নতুন ছবি টার্গেট ফোল্ডারে আপলোড করা)
    // ---------------------------------------------------------------------
    else {
      var base64Data = requestData.base64;
      if (!base64Data) {
        return jsonResponse({ status: "error", error: "No base64 data provided" }, 400);
      }

      var bytes = Utilities.base64Decode(base64Data);
      var mimeType = requestData.mimeType || "image/jpeg";
      var fileName = requestData.fileName || ("img_" + Date.now() + ".jpg");

      var blob = Utilities.newBlob(bytes, mimeType, fileName);
      var folder = getTargetFolder();
      var file = folder.createFile(blob);

      // পাবলিক ভিউ অ্যাক্সেস সেট করা (যাতে ওয়েব অ্যাপে ইমেজ সরাসরি শো করে)
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      var fileId = file.getId();

      // UI/সফটওয়্যারের সাথে ১০০% কম্প্যাটিবল রেসপন্স (id প্রোপার্টি সহ)
      return jsonResponse({
        status: "success",
        id: fileId,
        fileId: fileId,
        name: file.getName(),
        size: file.getSize(),
        url: "https://drive.google.com/uc?id=" + fileId,
        directUrl: "https://lh3.googleusercontent.com/d/" + fileId
      });
    }

  } catch (err) {
    return jsonResponse({ status: "error", error: err.toString(), message: err.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

// -------------------------------------------------------------------------
// HELPER: JSON Response
// -------------------------------------------------------------------------
function jsonResponse(obj, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

