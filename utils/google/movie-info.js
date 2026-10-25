"use server";

export async function getMovieFileInfo(url) {
    // 1. Regex to extract File ID
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const fileId = match ? match[1] : null;

    if (!fileId) {
        throw new Error("Invalid Google Drive URL");
    }

    const API_KEY = process.env.NEXT_GOOGLE_API_KEY;

    try {
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?fields=size,name,owners(emailAddress)&key=${API_KEY}`,
            { cache: 'no-store' } 
        );
        
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error.message);
            return null;
        }

        if (!data.size) {
            console.log("File size not found or file not public.");
            return null;
        }

        // Calculations
        const sizeInMB = (parseFloat(data.size) / (1024 * 1024)).toFixed(2);
        var name = data.name.replace(/\.(mp4|mkv|avi|zip|mov)$/i, "");
        name = name.replace(/-/g, " ");
        const ownerEmail = data.owners?.[0]?.emailAddress || 'N/A';

        return {
            fileId,
            size: sizeInMB,
            name: name,
            gmail: ownerEmail
        };

    } catch (err) {
        console.error("Fetch error:", err);
        return null;
    }
}