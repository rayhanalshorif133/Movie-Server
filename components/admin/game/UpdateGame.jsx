"use client"

import ImageUploader from '@/components/common/ImageUploader';
import MultiImageUploader from '@/components/common/MultiImageUploader';
import { getMovieFileInfo } from '@/utils/google/movie-info';
import React, { useEffect, useState } from 'react'
import { MdClear } from "react-icons/md";
import axios from "axios";
import Swal from 'sweetalert2';
import { deleteFileFromGoogleDrive } from '@/utils/google/manage';
import GameUploadErrorMessage from './_partials/GameUploadErrorMessage';

export default function UpdateGame({ game }) {

  const [loading, setLoading] = useState(false);
  const [driveId, setDriveId] = useState('');
  const [type, setTypes] = useState('');
  const [driveIds, setDriveIds] = useState([]);
  const [errorMsg, setErrorMsg] = useState();

  const fetchTypes = async () => {
    try {
      const res = await fetch("/api/games/type");
      const data = await res.json();
      if (res.ok) setTypes(data);
    } catch (error) {
      console.error("Failed to fetch types:", error);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    url: '',
    size: 0,
    asset_type: '',
    game_type: '',
    hidden_bar_gif: false,
    gmail: '',
    thumbnail_image: '',
    asset_images: [],
    asset_gif_images: [],
  });

  const handleDeleteImage = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete this image?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        axios.delete(`/api/images/?drive_id=${id}`);
        await deleteFileFromGoogleDrive(id);

        setFormData(prev => ({
          ...prev,
          thumbnail_image: prev.thumbnail_image === id ? '' : prev.thumbnail_image,
          asset_images: prev.asset_images.filter(img => img !== id),
          asset_gif_images: prev.asset_gif_images.filter(gif => gif !== id)
        }));

        Swal.fire('Deleted!', 'The reference has been removed.', 'success');
      }
    });
  };

  useEffect(() => {
    if (game) {
      console.log(game)
      setFormData({
        _id: game.id,
        title: game.title || '',
        url: game.url || '',
        size: game.size || 0,
        asset_type: game.asset_type || '',
        game_type: game.game_type || '',
        hidden_bar_gif: game.hidden_bar_gif ?? false,
        gmail: game.gmail || '',
        thumbnail_image: game.thumbnail_image || '',
        asset_images: game.asset_images || [],
        asset_gif_images: game.asset_gif_images || [],
      });
    }
  }, [game]);

  const handlePaste = async () => {
    try {
      const URL = await navigator.clipboard.readText();
      const data = await getMovieFileInfo(URL);

      const { fileId, name, gmail, size } = data;

      axios.get(`/api/games/check-duplicate-entry?title=${name}&url=${fileId}`)
        .then((response) => {
          const data = response.data;
          setErrorMsg(data.message);
          if (data.status == 'success') {
            setFormData(prev => ({
              ...prev,
              title: name,
              url: fileId,
              gmail: gmail,
              size: size
            }));
          }
        });
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const clearURL = () => {
    setErrorMsg('');
    setFormData(prev => ({
      ...prev,
      title: '',
      url: '',
      gmail: '',
      size: 0
    }));
  };

  useEffect(() => {
    if (driveId) {
      setFormData(prev => ({
        ...prev,
        thumbnail_image: driveId
      }));
    }
  }, [driveId]);

  /* auto split image & gif */
  useEffect(() => {
    if (driveIds.length === 0) return;

    const images = [];
    const gifs = [];

    console.clear();
    console.log("driveIds", driveIds);
    driveIds.forEach(file => {
      if (file.type.includes("gif")) {
        gifs.push(file.id);
      } else {
        images.push(file.id);
      }
    });

    setFormData(prev => ({
      ...prev,
      asset_images: images,
      asset_gif_images: gifs
    }));

  }, [driveIds]);


  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      id: formData._id, // _id কে id হিসেবে রিনেম করা হলো
      title: formData.title,
      url: formData.url,
      size: formData.size,
      asset_type: formData.asset_type,
      game_type: formData.game_type,
      hidden_bar_gif: formData.hidden_bar_gif,
      gmail: formData.gmail,
      thumbnail_image: formData.thumbnail_image,
      asset_images: formData.asset_images,
      asset_gif_images: formData.asset_gif_images,
    };

    axios.put('/api/games', payload)
      .then(response => {
        Swal.fire({
          icon: 'success',
          title: 'Asset Updated!',
          text: 'The game asset has been successfully updated.',
        });

        setTimeout(() => {
          window.location.href =
            `/admin/games?search=${encodeURIComponent(formData.title)}&page=1`;
        }, 1500);
      })
      .catch(error => {
        console.error('Error updating asset:', error);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: error.response?.data?.error || 'Something went wrong!',
        });
      })
      .finally(() => setLoading(false));
  }

  const getImageUrl = (id) => {
    if (!id) return 'https://placehold.co/400x300?text=No+Image';
    return `https://lh3.googleusercontent.com/d/${id}`;
  };

  return (
    <div className="max-w-full mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Update Game</h3>
      <form onSubmit={handleUpload} className="space-y-6">

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 flex">
            Asset File URL (G-Drive)
            <button
              type="button"
              onClick={clearURL}
              className="h-5 w-5 mx-2 cursor-pointer hover:scale-105 rounded-full bg-gray-300 hover:bg-red-500 hover:text-white flex items-center justify-center"
            >
              <MdClear size={14} />
            </button>
          </label>

          <input
            type="text"
            placeholder="Paste Google Drive URL to Auto-Fill"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            value={formData.url}
            onClick={handlePaste}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
          <div className="mt-4">
            {errorMsg && <GameUploadErrorMessage errorMsg={errorMsg} />}
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-blue-50 border-2 border-dashed border-blue-100 p-6 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-sm text-gray-700 mb-2 block">
                Asset Name
              </label>
              <input
                required
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Size (MB)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Uploader Email
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={formData.gmail}
                onChange={(e) => setFormData({ ...formData, gmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Asset type + Engine + Checkbox */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <select
            className="p-3 border rounded-lg"
            value={formData.asset_type}
            onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
          >
            <option value="" disabled>Select Type</option>
            <option value="game">Game</option>
            <option value="asset">Asset</option>
          </select>

          <select
            className="p-3 border rounded-lg"
            value={formData.game_type}
            onChange={(e) => setFormData({ ...formData, game_type: e.target.value })}
          >
            <option value="" disabled>Game Type</option>
            {
              type.length > 0 && type.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))
            }
          </select>

          {/* Gif Hidden Bar Checkbox */}
          <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
            <input
              type="checkbox"
              id="hidden_bar_gif"
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              checked={!!formData.hidden_bar_gif}
              onChange={(e) => setFormData({ ...formData, hidden_bar_gif: e.target.checked })}
            />
            <label htmlFor="hidden_bar_gif" className="cursor-pointer font-medium select-none text-sm text-gray-700">
              Gif Hidden Bar
            </label>
          </div>
        </div>

        {/* Media Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className='flex justify-center flex-col'>
            <div className="relative group w-48 h-48 mb-4">
              <img
                alt="Thumbnail"
                className="h-full w-full object-cover rounded-lg border shadow-md"
                src={getImageUrl(formData.thumbnail_image)}
              />
              {formData.thumbnail_image && (
                <button
                  type="button"
                  onClick={() => handleDeleteImage(formData.thumbnail_image)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-700 shadow-lg transition-all"
                >
                  <MdClear size={18} />
                </button>
              )}
            </div>

            <label className="font-semibold text-sm block mb-2">
              Main Thumbnail
            </label>
            <ImageUploader setDriveId={setDriveId} />
          </div>

          <div className='flex justify-center flex-col'>
            <div className='grid grid-cols-3 gap-3 mb-4 overflow-y-auto max-h-60 p-2 border bg-white rounded-md'>
              {[...formData.asset_images, ...formData.asset_gif_images].map((imgId, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={getImageUrl(imgId)}
                    className="h-20 w-full object-cover rounded border"
                    alt="preview"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(imgId)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MdClear size={14} />
                  </button>
                </div>
              ))}

              {(formData.asset_images.length === 0 && formData.asset_gif_images.length === 0) && (
                <p className="col-span-3 text-center text-gray-400 text-xs py-4">No previews found</p>
              )}
            </div>

            <label className="font-semibold text-sm block mb-2">
              Preview Images / GIFs
            </label>
            <MultiImageUploader
              setDriveIds={setDriveIds}
            />
            <p className="text-xs text-gray-400 mt-2">
              Upload images or gifs together. They will auto separate.
            </p>
          </div>
        </div>

        {!formData.thumbnail_image && (
          <div className="w-full h-10 flex items-center justify-center bg-amber-500 rounded-lg">
            <p className="text-xs text-white">
              Please upload a thumbnail to enable publishing
            </p>
          </div>
        )}

        <button
          disabled={loading || !formData.thumbnail_image}
          className={`w-full py-4 rounded-lg font-bold text-white ${loading || !formData.thumbnail_image
            ? "bg-gray-400"
            : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Updating Assets..." : "Update Game Asset"}
        </button>

      </form>
    </div>
  )
}