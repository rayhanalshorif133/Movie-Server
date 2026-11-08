import React, { useState } from 'react'
import Badge from '@/components/common/Badge'
import { daysAgoCalculate } from '@/utils/google/manage';
import axios from 'axios';
import { IoReload } from 'react-icons/io5';

export default function LastLoginTime({ getData, id, last_login, type }) {
    const [updating, setUpdating] = useState(false);
    const daysAgo = daysAgoCalculate(last_login);

    const handleLastLoginUpdateBtn = async (itemId) => {
        setUpdating(true);
        try {
            await axios.get(`/api/gmails/last-login?id=${itemId}&type=${type}`);
            if (getData) {
                await getData();
            }
        } catch (error) {
            console.error('Network error:', error);
        } finally {
            setUpdating(false);
        }
    }
    return (
        <div className="flex items-center gap-2">
            <Badge title={daysAgo} />
            <button 
                onClick={() => handleLastLoginUpdateBtn(id)} 
                disabled={updating}
                title="Update last login date to today"
                className='flex items-center justify-center p-1.5 
                           bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white
                           border border-indigo-200 text-xs font-medium
                           rounded-lg shadow-2xs hover:shadow-xs
                           transition-all duration-200 cursor-pointer disabled:opacity-50'
            >
                <IoReload className={`text-xs ${updating ? 'animate-spin' : ''}`} />
            </button>
        </div>
    )
}
