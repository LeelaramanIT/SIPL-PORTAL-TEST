import React from 'react';
import { useLocation } from 'react-router-dom';

const BreadCrumbs = () => {
    const location = useLocation();
    const pathSegments = location.pathname === '/' 
    ? ['Home'] 
    : location.pathname.split('/').filter(Boolean);
    

    return (
        <div className='w-fit h-fit p-2 text-gray-500 text-sm dark:text-white'>
            {pathSegments.map((segment, index) => (
                <span key={index} className='capitalize'>
                    {segment === 'home' ? 'Home' : segment.replace('-', ' ')}
                    {index < pathSegments.length - 1 && ' / '}
                </span>
            ))}
        </div>
    );
};

export default BreadCrumbs;
