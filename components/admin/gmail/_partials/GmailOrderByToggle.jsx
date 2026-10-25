import React from 'react';

export default function GmailOrderByToggle({ hasSpaceBtn, orderBy, setOrderBy }) {
    
    // Define all possible options
    const allOptions = [
        { label: 'Default', name: 'created_at' },
        { label: 'Used Space', name: 'used_space' },
        { label: 'Last Login', name: 'last_login' }
    ];

    const filteredOptions = allOptions.filter(option => {
        if (option.name === 'used_space') return hasSpaceBtn;
        return true;
    });

    return (
        <div className="flex items-center">
            {filteredOptions.map((option, index) => {
                const isActive = orderBy === option.name;
                
                const isFirst = index === 0;
                const isLast = index === filteredOptions.length - 1;

                return (
                    <button
                        key={option.name}
                        onClick={() => setOrderBy(option.name)}
                        className={`
                            flex items-center px-4 py-2 text-xs font-bold border transition-all duration-300 cursor-pointer shadow-sm
                            ${isFirst ? 'rounded-l-full' : ''}
                            ${isLast ? 'rounded-r-full' : ''}
                            ${isActive
                                ? 'bg-indigo-600 text-white border-indigo-600 z-10 scale-105'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                            }
                        `}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}