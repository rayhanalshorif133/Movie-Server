"use client";

import { deleteFileFromGoogleDrive, getGoogleDriveImageUrl, extractGoogleDriveFileId, uploadImageInGoogleDrive } from '@/utils/google/manage';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { RxCross2 } from "react-icons/rx";
import { FiUploadCloud, FiCheck, FiAlertCircle, FiLink, FiLoader } from "react-icons/fi";
import Swal from 'sweetalert2';

export default function ImageUploader({ setDriveId, initialDriveId = "" }) {
  const [preview, setPreview] = useState(initialDriveId ? getGoogleDriveImageUrl(initialDriveId) : null);
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(initialDriveId ? `https://drive.google.com/uc?id=${initialDriveId}` : "");
  const [getDriveId, setGetDriveId] = useState(initialDriveId || null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showDirectInput, setShowDirectInput] = useState(false);
  const [directIdInput, setDirectIdInput] = useState("");

  useEffect(() => {
    if (initialDriveId) {
      setGetDriveId(initialDriveId);
      setPreview(getGoogleDriveImageUrl(initialDriveId));
      setFileUrl(`https://drive.google.com/uc?id=${initialDriveId}`);
    }
  }, [initialDriveId]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setLoading(true);

    try {
      const driveId = await uploadImageInGoogleDrive(file);
      if (driveId) {
        setFileUrl(`https://drive.google.com/uc?id=${driveId}`);
        const data = {
          "drive_id": driveId,
          "url": `https://drive.google.com/uc?id=${driveId}`
        };
        axios.post('/api/images', data).catch(err => console.warn("Image gallery save notice:", err.message));
        setDriveId(driveId);
        setGetDriveId(driveId);
        setPreview(getGoogleDriveImageUrl(driveId));
      } else {
        setErrorMsg("Failed to upload image to Google Drive. Please retry or paste Drive ID.");
        setDriveId(null);
        setGetDriveId(null);
      }
    } catch (error) {
      console.error("Upload failed", error);
      setErrorMsg("Network error during image upload. Please retry.");
      setDriveId(null);
      setGetDriveId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectIdApply = () => {
    if (!directIdInput.trim()) return;
    const cleanId = extractGoogleDriveFileId(directIdInput.trim());
    if (cleanId) {
      setGetDriveId(cleanId);
      setDriveId(cleanId);
      setPreview(getGoogleDriveImageUrl(cleanId));
      setFileUrl(`https://drive.google.com/uc?id=${cleanId}`);
      setShowDirectInput(false);
      setErrorMsg("");
    }
  };

  const handleFileDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    Swal.fire({
      title: 'Are you sure?',
      text: "This will remove the selected poster image.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (getDriveId) {
          axios.delete(`/api/images/?drive_id=${getDriveId}`).catch(() => {});
          deleteFileFromGoogleDrive(getDriveId).catch(() => {});
        }
        setPreview(null);
        setFileUrl("");
        setGetDriveId(null);
        setDriveId(null);
        setErrorMsg("");
      }
    });
  };

  return (
    <div className="mx-auto w-full">
      <div className={`group relative border-2 border-dashed ${errorMsg ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-gray-50 hover:border-yellow-400'} rounded-lg p-5 text-center transition overflow-hidden`}>

        {!preview && !showDirectInput && (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        )}

        {preview ? (
          <div className="flex flex-col items-center relative z-20">
            <img
              src={preview}
              alt="Movie Poster Preview"
              className="max-h-52 w-auto rounded-lg mb-2 object-cover shadow-sm border border-gray-100"
            />
            {loading ? (
              <p className="text-xs text-yellow-600 animate-pulse font-medium flex items-center gap-1.5">
                <FiLoader className="animate-spin" /> Uploading poster to Google Drive...
              </p>
            ) : getDriveId ? (
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <FiCheck /> Poster Uploaded to Google Drive
              </p>
            ) : errorMsg ? (
              <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                <FiAlertCircle /> {errorMsg}
              </p>
            ) : null}

            {!loading && (
              <button
                onClick={handleFileDelete}
                type="button"
                title="Remove poster"
                className="absolute cursor-pointer -top-2 -right-2 bg-white shadow-md rounded-full p-1.5 text-gray-500 hover:text-red-500 transition border border-gray-100"
              >
                <RxCross2 size={16} />
              </button>
            )}
          </div>
        ) : showDirectInput ? (
          <div className="py-2 space-y-2 relative z-20">
            <p className="text-xs font-semibold text-gray-700">Paste Google Drive Image URL or File ID</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 1D8dXhhTWgcZp-rSOAfOeCMD5xQjR4eUw"
                value={directIdInput}
                onChange={(e) => setDirectIdInput(e.target.value)}
                className="flex-1 text-xs p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
              />
              <button
                type="button"
                onClick={handleDirectIdApply}
                className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Apply
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowDirectInput(false)}
              className="text-xs text-gray-500 hover:underline cursor-pointer"
            >
              Cancel & Upload Image File Instead
            </button>
          </div>
        ) : (
          <div className="py-4">
            <FiUploadCloud className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm font-semibold text-gray-700">Upload Movie Poster (JPG/PNG)</p>
            <p className="text-xs text-gray-400 mt-1">Click or drag & drop image</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDirectInput(true);
              }}
              className="mt-2 text-xs text-yellow-600 hover:text-yellow-700 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <FiLink size={12} /> Or paste Google Drive Image ID / Link
            </button>
          </div>
        )}
      </div>

      {errorMsg && !preview && (
        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
          <FiAlertCircle size={13} /> {errorMsg}
        </p>
      )}

      {fileUrl && (
        <div className="mt-3 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs break-all flex flex-col gap-0.5">
          <span className="font-semibold text-gray-700">Drive Poster Link:</span>
          <a href={fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
            {fileUrl}
          </a>
        </div>
      )}
    </div>
  );
}
