import React from 'react'
import Badge from '@/components/common/Badge'
import { daysAgoCalculate } from '@/utils/google/manage';
import axios from 'axios';
import { IoReload } from 'react-icons/io5';

export default function LastLoginTime({ getData, id, last_login, type }) {
    const daysAgo = daysAgoCalculate(last_login);

    const handleLastLoginUpdateBtn = async (id) => {
        try {
            await axios.get(`/api/gmails/last-login?id=${id}&type=${type}`);
            await getData();
        } catch (error) {
            console.error('Network error:', error);
        } finally {
            setAutoUpdating(false);
        }
    }
    return (
        <>
            <Badge title={daysAgo} />
            <button onClick={() => handleLastLoginUpdateBtn(id)} className='flex items-center gap-2 px-3 py-1.5 
                                                   bg-indigo-500 text-white text-xs font-medium
                                                  rounded-lg shadow-sm
                                                  hover:bg-indigo-500 hover:shadow-md
                                                  transition-all duration-200 cursor-pointer'>
                <IoReload className='mt-1' />
            </button>
        </>
    )
}
