import React from 'react'
import LoadingDots from '../_partials/LoadingDots';


export default function MovieFilterLoading() {
    return (
        <div className="flex gap-4 items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <div
                    key={n}
                    className="flex items-center justify-center p-2"
                >
                    <LoadingDots />
                </div>
            ))}
        </div>
    )
}