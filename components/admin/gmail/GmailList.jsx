'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Eye } from 'lucide-react';
import axios from "axios";
import ShowMovies from './ShowMovies';
import Badge from '@/components/common/Badge';
import GmailListHeader from './_partials/GmailListHeader';
import GmailListPagination from './_partials/GmailListPagination';
import LastLoginTime from './_partials/LastLoginTime';

export default function GmailList() {

  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoUpdating, setAutoUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [color, setColor] = useState();
  const [orderBy, setOrderBy] = useState('created_at');

  const generateRandomColors = () => {
    const hue = Math.floor(Math.random() * 360);
    return {
      backgroundColor: `hsla(${hue}, 70%, 90%, 1)`,
      color: `hsla(${hue}, 70%, 20%, 1)`,
      borderColor: `hsla(${hue}, 70%, 80%, 1)`,
    };
  };

  useEffect(() => {
    setColor(generateRandomColors());
  }, []);

  const [openRow, setOpenRow] = useState(null); // 👈 fix

  const ITEMS_PER_PAGE = 10;

  const getData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/gmails?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${searchTerm}&order_by=${orderBy}`
      );

      const result = await response.json();

      if (response.ok) {
        setEmails(result.data || []);
        setTotalCount(result.total || 0);
        setTotalPages(result.totalPages || 0);
      }

    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(0);
      getData();
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    getData();
  }, [currentPage]);

  useEffect(() => {
    getData();
  }, [orderBy]);

  const autoGmailUpdateBtn = async () => {
    setAutoUpdating(true);
    try {
      await axios.get('/api/gmails/autoupdate');
      await getData();
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setAutoUpdating(false);
    }
  }

  const toggleMovies = (id) => {
    if (openRow === id) {
      setOpenRow(null);
    } else {
      setOpenRow(id);
    }
  }


  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

      {/* Header */}
      <GmailListHeader orderBy={orderBy} setOrderBy={setOrderBy} addNewGmail={false} setSearchTerm={setSearchTerm} searchTerm={searchTerm} autoGmailUpdateBtn={autoGmailUpdateBtn} autoUpdating={autoUpdating} color={color} />

      {/* Table */}
      <table className="w-full text-left">

        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-6 py-4">#</th>
            <th className="px-6 py-4">Gmail</th>
            <th className="px-6 py-4">Movies</th>
            <th className="px-6 py-4">Used Space</th>
            <th className="px-6 py-4">Last Login</th>
          </tr>
        </thead>

        <tbody>

          {loading ? (

            <tr>
              <td colSpan={5} className="py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
              </td>
            </tr>

          ) : emails.map((item, index) => {

            const movies = item.movies ? item.movies.split(',') : [];


            return (
              <React.Fragment key={item.id}>

                <tr className="hover:bg-gray-50">

                  <td className="px-6 py-4 text-sm font-medium">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {item.name}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleMovies(item.id)}
                      className="flex items-center gap-2 px-3 py-1.5 
                        bg-teal-500 text-white text-xs font-medium
                        rounded-lg shadow-sm
                        hover:bg-teal-600 hover:shadow-md
                        transition-all duration-200 cursor-pointer"
                    >
                      <Eye size={14} />
                      <span>{movies.length}</span>
                    </button>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <Badge title={`${item.used_space} GB`} />
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500 flex space-x-1">
                    <LastLoginTime getData={getData} id={item.id} last_login={item.last_login} type={'gmails'} />
                  </td>

                </tr>

                {openRow === item.id && (
                  <ShowMovies items={item} className="w-full mx-auto flex justify-center" />
                )}

              </React.Fragment>
            )

          })}

        </tbody>

      </table>

      {/* Pagination */}
      <GmailListPagination
        totalCount={totalCount}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        loading={loading}
      />


    </div>
  );
}