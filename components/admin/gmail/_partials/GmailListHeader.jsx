import React, { useState } from 'react'
import { Search, Loader2 } from 'lucide-react';
import { IoReload } from "react-icons/io5";
import GmailOrderByToggle from './GmailOrderByToggle';

export default function GmailListHeader(props) {
    const {
        setSearchTerm,
        searchTerm,
        colorAddBtn,
        autoGmailUpdateBtn,
        autoUpdating,
        color,
        addNewGmail = false,
        handleNewGmailAdd = false,
        newGmail,
        setNewGmail,
        isModalOpen,
        openModal,
        closeModal,
        orderBy,
        setOrderBy
    } = props;





    return (
        <div className="p-6 border-b flex justify-between items-center gap-4">

            <h3 className="text-lg font-bold text-gray-800">
                {addNewGmail ? 'Manage Inventory' : 'Gmail Database'}
            </h3>

            <button
                onClick={autoGmailUpdateBtn}
                disabled={autoUpdating}
                style={color}
                className="inline-flex items-center px-3 py-2 rounded-full text-xs font-bold border transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm"
            >
                {autoUpdating ?
                    <>
                        <Loader2 className="w-4 h-4 animate-spin mx-2" />
                        Updating...
                    </>
                    :
                    <>
                        <IoReload className="w-4 h-4 mx-2" />
                        Auto Update
                    </>
                }
            </button>

            <GmailOrderByToggle hasSpaceBtn={addNewGmail ? false : true} orderBy={orderBy} setOrderBy={setOrderBy} />

            <button
                style={colorAddBtn}
                onClick={openModal}
                className={` items-center px-3 py-2 rounded-full text-xs font-bold border transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm  ${addNewGmail ? 'inline-flex' : 'hidden'}`}
            >
                Add New
            </button>

            <div className="relative w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    placeholder="Search email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500/50  flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                        <h4 className="text-lg font-bold mb-4">Add New Gmail</h4>

                        <input
                            type="text"
                            placeholder="Enter email..."
                            className="w-full border px-3 py-2 rounded mb-4"
                            value={newGmail}
                            onChange={(e) => setNewGmail(e.target.value)}
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 rounded border text-sm hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNewGmailAdd}
                                className="px-4 py-2 cursor-pointer rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}