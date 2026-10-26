const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzBitNkcvoaAK7KFPo2dXZxh9WEeIlRaK1HwZOClAvtNmtUS7p1U7JYqJmnAcWKvNumRw/exec";
const DEFAULT_SCRIPT_URL_DELETE = "https://script.google.com/macros/s/AKfycbzzk_p0ysLCF7SA6yUp6PZO5k62VufN5ER88mj0wd9QhT-iCZPtWo4QGguzZMTq35aUxw/exec";

export function getDriveUploadApiUrl() {
  return process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_URL || DEFAULT_SCRIPT_URL;
}

export function getDriveDeleteApiUrl() {
  return process.env.NEXT_PUBLIC_GOOGLE_DRIVE_DELETE_URL || 
         process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_URL || 
         DEFAULT_SCRIPT_URL_DELETE;
}

export async function uploadImageInGoogleDrive(file) {
  if (!file) return null;

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  try {
    const base64Data = await convertToBase64(file);

    const payload = {
      base64: base64Data,
      mimeType: file.type,
      fileName: file.name,
    };

    const uploadUrl = getDriveUploadApiUrl();
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error("Upload Error:", error);
    return null;
  }
}

export async function updateImageInGoogleDrive(fileId, newFile) {
  if (!fileId || !newFile) return null;

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  try {
    const base64Data = await convertToBase64(newFile);
    const payload = {
      action: 'update',
      fileId: fileId,
      base64: base64Data,
      mimeType: newFile.type,
      fileName: newFile.name,
    };

    const apiUrl = getDriveUploadApiUrl();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result.id || result.fileId || null;
  } catch (error) {
    console.error("Update Image Error:", error);
    return null;
  }
}

export function getFileType(file) {
  if (!file) return "No file";

  const typeFromMime = file.type.split('/').pop();
  const typeFromName = file.name.split('.').pop().toLowerCase();
  return file.type ? typeFromMime : typeFromName;
};

export async function deleteFileFromGoogleDrive(fileId) {
  if (!fileId) return null;

  try {
    const payload = {
      action: 'delete',
      fileId: fileId,
    };

    const deleteUrl = getDriveDeleteApiUrl();
    const response = await fetch(deleteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.status === "success") {
      console.log("File deleted successfully");
      return true;
    } else {
      console.error("Delete Failed:", result.error);
      return false;
    }
  } catch (error) {
    console.error("Network/API Error:", error);
    return false;
  }
}

export function extractGoogleDriveFileId(input) {
  if (!input || typeof input !== "string") return "";
  const trimmed = input.trim();
  if (trimmed === "#" || trimmed === "") return "";

  // If already clean ID (no slashes, no query params)
  if (!trimmed.includes("/") && !trimmed.includes("?") && !trimmed.includes("&")) {
    return trimmed;
  }

  // /file/d/{id}
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // ?id={id} or &id={id}
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  // /d/{id} (e.g. lh3.googleusercontent.com/d/{id})
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];

  return trimmed;
}

export function getGoogleDriveFileUrl(fileId) {
  if (!fileId) return "#";
  const id = extractGoogleDriveFileId(fileId);
  if (!id) return "#";
  return `https://drive.google.com/file/d/${id}/view`;
}

export function getGoogleDriveImageUrl(fileId) {
  if (!fileId) return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800";
  const id = extractGoogleDriveFileId(fileId);
  if (!id) return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800";

  // If it's a non-Google full URL (e.g. unsplash or external CDN), keep it
  if (typeof fileId === "string" && fileId.startsWith("http") && !fileId.includes("drive.google.com") && !fileId.includes("googleusercontent.com")) {
    return fileId;
  }

  return `https://lh3.googleusercontent.com/d/${id}`;
}

export function getGoogleDrivePreviewUrl(fileId) {
  if (!fileId) return "#";
  const id = extractGoogleDriveFileId(fileId);
  if (!id) return "#";
  return `https://drive.google.com/file/d/${id}/preview`;
}

export function getGoogleDriveDownloadUrl(fileId) {
  if (!fileId) return "#";
  const id = extractGoogleDriveFileId(fileId);
  if (!id) return "#";
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

export function daysAgoCalculate(date) {
  if (!date) return 0;
  const givenDate = new Date(date);
  const today = new Date();
  const diffTime = today - givenDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + " Days Ago";
};

export function googleDriveToDownload(fileId) {
  if (!fileId || fileId === "#") return;
  const id = extractGoogleDriveFileId(fileId);
  if (!id) return;
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;
  window.open(downloadUrl, "_blank");
};
