"use client";

import { deleteFileFromGoogleDrive, getFileType, uploadImageInGoogleDrive } from '@/utils/google/manage';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { RxCross2 } from "react-icons/rx";
import Swal from 'sweetalert2';

export default function ImageUploader({ setDriveId }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [getDriveId, setGetDriveId] = useState(null);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
        axios.post('/api/images/',data);
        setDriveId(driveId);
        setGetDriveId(driveId);
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    Swal.fire({
      title: 'Are you sure?',
      text: "This will remove the selected image.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`/api/images/?drive_id=${getDriveId}`);
        const deleteImageFromDrive = deleteFileFromGoogleDrive(getDriveId);
        if (deleteImageFromDrive) {
          Swal.fire('Deleted!', 'Your image has been deleted.', 'success');
          setPreview(null);
          setFileUrl("");
          setDriveId(null);
        } else {
          Swal.fire('Error!', 'Failed to delete the image from Drive.', 'error');
        }
      }
    });

  };

  return (
    <div className="mx-auto w-full">
      <div className="group relative border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-yellow-400 transition bg-gray-50 overflow-hidden">

        {!preview && (
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
              alt="Preview"
              className="max-h-48 rounded-md mb-2 object-cover shadow-sm"
            />
            {loading ? (
              <p className="text-xs text-yellow-600 animate-pulse font-medium">Uploading to Drive...</p>
            ) : (
              <p className="text-xs text-green-600 font-bold">Uploaded ✅</p>
            )}

            {!loading && (
              <button
                onClick={handleFileDelete}
                type="button"
                className="absolute cursor-pointer -top-2 -right-2 bg-white shadow-md rounded-full p-1 text-gray-500 hover:text-red-500 transition-colors border border-gray-100"
              >
                <RxCross2 size={18} />
              </button>
            )}
          </div>
        ) : (
          <div className="py-4">
            <p className="text-sm font-medium text-gray-700">Upload Poster (JPG/PNG)</p>
            <p className="text-xs text-gray-400 mt-1">Click or drag to select</p>
          </div>
        )}
      </div>

      {fileUrl && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs break-all flex flex-col gap-1">
          <span className="font-semibold text-gray-700">Drive Direct Link:</span>
          <a href={fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
            {fileUrl}
          </a>
        </div>
      )}
    </div>
  );
}