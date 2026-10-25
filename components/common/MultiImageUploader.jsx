"use client";

import { deleteFileFromGoogleDrive, uploadImageInGoogleDrive } from '@/utils/google/manage';
import axios from 'axios';
import { useState } from 'react';
import { RxCross2 } from "react-icons/rx";
import Swal from 'sweetalert2';

export default function MultiImageUploader({ setDriveIds }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // File select korle eita trigger hobe
  const handleChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setLoading(true);

    // Protiti file-er jonno placeholder create kora (UI-te loading dekhate)
    const newFilesBase = selectedFiles.map(file => ({
      preview: URL.createObjectURL(file),
      id: null,
      type: file.type,
      uploading: true,
      file: file // Reference for uploading
    }));

    setFiles(prev => [...prev, ...newFilesBase]);

    // Promise.all use kore fast upload kora
    try {
      const uploadPromises = newFilesBase.map(async (fileObj) => {
        try {
          const driveId = await uploadImageInGoogleDrive(fileObj.file);
          
          // Database-e save kora
          await axios.post('/api/images/', {
            drive_id: driveId,
            url: `https://drive.google.com/uc?id=${driveId}`
          });

          return { ...fileObj, id: driveId, uploading: false };
        } catch (error) {
          console.error("Upload failed for a file", error);
          return null; // Failed upload handle kora
        }
      });

      const uploadedResults = await Promise.all(uploadPromises);
      
      // State update kora (failed gulo bad diye)
      setFiles(prev => {
        const updated = prev.map(f => {
          const match = uploadedResults.find(res => res && res.preview === f.preview);
          return match ? match : f;
        });

        // Parent component-e IDs pathiye deya
        const allIds = updated
          .filter(f => f.id)
          .map(f => ({ id: f.id, type: f.type }));
        setDriveIds(allIds);
        
        return updated;
      });

    } catch (err) {
      console.error("Global upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Image remove korar logic
  const removeFile = (index) => {
    const file = files[index];

    Swal.fire({
      title: "Are you sure?",
      text: "This image will be deleted forever!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        // State theke agei remove kore UI smooth rakha
        const updated = files.filter((_, i) => i !== index);
        setFiles(updated);
        
        // Parent ke update kora
        setDriveIds(updated.filter(f => f.id).map(f => ({ id: f.id, type: f.type })));

        // Drive ebong DB theke delete kora (background-e)
        if (file.id) {
          try {
            await axios.delete(`/api/images/?drive_id=${file.id}`);
            await deleteFileFromGoogleDrive(file.id);
          } catch (err) {
            console.error("Delete error:", err);
          }
        }
      }
    });
  };

  return (
    <div className="w-full">
      {/* Upload Box */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center relative hover:border-blue-500 transition-colors bg-gray-50">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center">
          <p className="text-gray-600 font-medium">Click or Drag to Upload Images</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF are supported</p>
        </div>
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
          {files.map((file, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={file.id ? `https://lh3.googleusercontent.com/u/0/d/${file.id}` : file.preview}
                className={`w-full h-full object-cover rounded-lg border ${file.uploading ? 'opacity-50' : 'opacity-100'}`}
                alt="preview"
              />
              
              {file.uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              )}

              <button
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white shadow-lg rounded-full p-1 hover:bg-red-600 transition-transform hover:scale-110"
              >
                <RxCross2 size={14} />
              </button>

              {file.type?.includes("gif") && (
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 text-white px-2 py-0.5 rounded font-bold">
                  GIF
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}