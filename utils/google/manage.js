
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzBitNkcvoaAK7KFPo2dXZxh9WEeIlRaK1HwZOClAvtNmtUS7p1U7JYqJmnAcWKvNumRw/exec";
const SCRIPT_URL_DELETE = "https://script.google.com/macros/s/AKfycbzzk_p0ysLCF7SA6yUp6PZO5k62VufN5ER88mj0wd9QhT-iCZPtWo4QGguzZMTq35aUxw/exec";


export async function uploadImageInGoogleDrive(file) {
  if (!file) return null;

  // ১. ফাইলটিকে Base64 এ রূপান্তর
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

    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Apps Script POST রিকোয়েস্টের জন্য অনেক সময় এটি লাগে
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

    const response = await fetch(SCRIPT_URL_DELETE, {
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

export function getGoogleDriveFileUrl(fileId) {
  if (!fileId) return null;
  if (fileId.includes("view")) {
    return fileId;
  }
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export function getGoogleDriveImageUrl(fileId) {

  if (!fileId) return null;
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

export function getGoogleDrivePreviewUrl(fileId) {
  if (!fileId) return null;

  if (fileId.includes("view")) {
    return fileId.replace("/view", "/preview");
  }

  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function getGoogleDriveDownloadUrl(fileId) {
  if (!fileId) return null;
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
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
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  window.open(downloadUrl, "_blank");
};


