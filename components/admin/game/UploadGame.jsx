"use client"
import ImageUploader from '@/components/common/ImageUploader';
import MultiImageUploader from '@/components/common/MultiImageUploader';
import { getMovieFileInfo } from '@/utils/google/movie-info';
import React, { useEffect, useState } from 'react'
import { MdClear } from "react-icons/md";
import axios from "axios";
import Swal from 'sweetalert2';
import GameUploadErrorMessage from './_partials/GameUploadErrorMessage';

export default function UploadGame() {

  const [loading, setLoading] = useState(false);
  const [driveId, setDriveId] = useState('');
  const [type, setTypes] = useState('');
  const [driveIds, setDriveIds] = useState([]);
  const [errorMsg, setErrorMsg] = useState();

  const API_URL = "/api/games/type";

  const fetchTypes = async () => {
    try {
      const res = await fetch(API_URL);
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
    title: '',
    url: '',
    size: 0,
    asset_type: '',
    game_type: '',
    gif_hidden_bar: false,
    gmail: '',
    thumbnail_image: '',
    asset_images: [],
    asset_gif_images: [],
  });

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
      ...formData
    };

    axios.post('/api/games', payload)

      .then(response => {


        Swal.fire({
          icon: 'success',
          title: 'Asset Uploaded!',
          text: 'The game asset has been successfully listed.',
        });

        setTimeout(() => {

          window.location.href =
            `/admin/games?search=${encodeURIComponent(formData.title)}&page=1`;

        }, 1500);

      })

      .catch(error => {
        console.error('Error uploading asset:', error);
      })

      .finally(() => setLoading(false));
  }


  return (

    <div className="max-w-full mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 my-10">

      <h3 className="text-xl font-bold text-gray-800 mb-6">
        Upload New Game Assets
      </h3>

      <form onSubmit={handleUpload} className="space-y-6">


        {/* Google Drive URL */}

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


        {/* Asset type + Engine */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <select
            className="p-3 border rounded-lg"
            value={formData.asset_type}
            onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
          >

            <option value="" disabled selected>Select Type</option>
            <option value="game">Game</option>
            <option value="asset">Asset</option>
          </select>


          <select
            className="p-3 border rounded-lg"
            value={formData.game_type}
            onChange={(e) => setFormData({ ...formData, game_type: e.target.value })}
          >

            <option value="" disabled selected>Game Type</option>
            {
              type.length > 0 && type.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))
            }

          </select>

          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <input
              type="checkbox"
              id="gif_hidden_bar"
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              checked={!!formData.gif_hidden_bar}
              onChange={(e) => setFormData({ ...formData, gif_hidden_bar: e.target.checked })}
            />
            <label htmlFor="gif_hidden_bar" className="cursor-pointer font-medium select-none">
              Gif Hidden Bar
            </label>
          </div>


        </div>


        {/* Media Upload */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>

            <label className="font-semibold text-sm block mb-2">
              Main Thumbnail
            </label>

            <ImageUploader setDriveId={setDriveId} />

          </div>


          <div>

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

          {loading ? "Uploading Assets..." : "Publish Game Asset"}

        </button>


      </form>

    </div>
  )
}