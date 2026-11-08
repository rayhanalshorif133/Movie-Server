"use server";

import { extractGoogleDriveFileId } from "./manage.js";

const DEFAULT_DRIVE_API_URL = "https://script.google.com/macros/s/AKfycbyj-zHReigYVh_pBBv0LEIZhnGk3qISfHU87iaeqhP9PkrHA9RGAtcU8nQEq-N8buUg/exec";

/**
 * Fetches Google Drive file metadata (name, size in MB, owner Gmail, fileId).
 * Supports full Drive URLs (/file/d/..., ?id=..., etc.) or direct file IDs.
 */
export async function getMovieFileInfo(urlOrId) {
    if (!urlOrId || typeof urlOrId !== "string") {
        return {
            success: false,
            error: "No Google Drive URL or File ID provided",
            fileId: "",
            name: "",
            title: "",
            gmail: "",
            movie_source: "",
            size: ""
        };
    }

    const fileId = extractGoogleDriveFileId(urlOrId);

    if (!fileId || fileId.length < 15) {
        return {
            success: false,
            error: "Invalid Google Drive URL or File ID",
            fileId: "",
            name: "",
            title: "",
            gmail: "",
            movie_source: "",
            size: ""
        };
    }

    const scriptApiUrl = process.env.NEXT_GOOGLE_DRIVE_API_URL || 
                         process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_URL || 
                         DEFAULT_DRIVE_API_URL;
    const apiKey = process.env.NEXT_GOOGLE_API_KEY;

    let fileName = "";
    let fileSizeMB = "";
    let ownerGmail = "";
    let mimeType = "";

    try {
        // Concurrently fetch from Apps Script proxy and Drive public preview page
        const fetchScriptPromise = fetch(`${scriptApiUrl}?fileId=${encodeURIComponent(fileId)}`, {
            cache: 'no-store'
        }).then(async (res) => {
            if (!res.ok) return null;
            return await res.json();
        }).catch((err) => {
            console.warn("Drive Apps Script fetch error:", err.message);
            return null;
        });

        const fetchDrivePagePromise = fetch(`https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            cache: 'no-store'
        }).then(async (res) => {
            if (!res.ok) return null;
            return await res.text();
        }).catch((err) => {
            console.warn("Drive page fetch error:", err.message);
            return null;
        });

        // Optional Drive v3 API if API key exists in environment
        const fetchV3Promise = apiKey ? fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?fields=size,name,owners(emailAddress),mimeType&key=${apiKey}`,
            { cache: 'no-store' }
        ).then(async (res) => {
            if (!res.ok) return null;
            const data = await res.json();
            return data.error ? null : data;
        }).catch(() => null) : Promise.resolve(null);

        const [scriptData, htmlText, v3Data] = await Promise.all([
            fetchScriptPromise,
            fetchDrivePagePromise,
            fetchV3Promise
        ]);

        // A. Process Apps Script result
        if (scriptData && (scriptData.status === 'success' || scriptData.name)) {
            if (scriptData.name) fileName = scriptData.name;
            if (scriptData.size) {
                fileSizeMB = (parseFloat(scriptData.size) / (1024 * 1024)).toFixed(2);
            }
            if (scriptData.mimeType) mimeType = scriptData.mimeType;
            if (scriptData.email || scriptData.owner) {
                ownerGmail = scriptData.email || scriptData.owner;
            }
        }

        // B. Process Drive v3 API result if available
        if (v3Data) {
            if (!fileName && v3Data.name) fileName = v3Data.name;
            if (!fileSizeMB && v3Data.size) {
                fileSizeMB = (parseFloat(v3Data.size) / (1024 * 1024)).toFixed(2);
            }
            if (!ownerGmail && v3Data.owners?.[0]?.emailAddress) {
                ownerGmail = v3Data.owners[0].emailAddress;
            }
            if (!mimeType && v3Data.mimeType) mimeType = v3Data.mimeType;
        }

        // C. Extract owner email from Drive preview page HTML
        if (!ownerGmail && htmlText) {
            const emailMatches = htmlText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
            const filteredEmails = emailMatches.filter(email => {
                const lower = email.toLowerCase();
                return !lower.includes('google.com') && 
                       !lower.includes('googleusercontent.com') &&
                       !lower.includes('gstatic.com') &&
                       !lower.includes('schema.org') &&
                       !lower.includes('w3.org') &&
                       !lower.includes('noreply') &&
                       !lower.includes('no-reply');
            });
            if (filteredEmails.length > 0) {
                ownerGmail = filteredEmails[0];
            } else if (emailMatches.some(e => e.toLowerCase().endsWith('@gmail.com'))) {
                ownerGmail = emailMatches.find(e => e.toLowerCase().endsWith('@gmail.com'));
            }
        }

        // D. Fallback file name from HTML meta/title tags if Apps Script didn't return one
        if (!fileName && htmlText) {
            const ogTitleMatch = htmlText.match(/property="og:title" content="([^"]+)"/i);
            const titleTagMatch = htmlText.match(/<title>([^<]+)<\/title>/i);
            if (ogTitleMatch && ogTitleMatch[1]) {
                fileName = ogTitleMatch[1];
            } else if (titleTagMatch && titleTagMatch[1]) {
                fileName = titleTagMatch[1].replace(/ - Google Drive$/i, '').trim();
            }
        }

    } catch (err) {
        console.error("Error fetching movie file info:", err);
    }

    // Clean file title: remove extension and trim
    let cleanName = fileName || "";
    cleanName = cleanName.replace(/\.(mp4|mkv|avi|zip|mov|rar|webm|flv|wmv|m4v)$/i, "").trim();

    const isSuccess = Boolean(cleanName || fileSizeMB || ownerGmail);

    return {
        success: isSuccess,
        fileId: fileId,
        name: cleanName,
        title: cleanName,
        size: fileSizeMB || "",
        gmail: ownerGmail || "",
        movie_source: ownerGmail || "",
        mimeType: mimeType || "",
        error: isSuccess ? null : "Could not retrieve file information from Google Drive. Ensure the file link has sharing set to 'Anyone with the link'."
    };
}
