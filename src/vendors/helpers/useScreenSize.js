// useScreenSize.js
import { geoContext } from '../../GeoContext';
import { useState, useLayoutEffect } from 'react';

export function useScreenSize() {
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    //Should not be added in dev
    if (!geoContext.previewMode)
        useLayoutEffect(() => {
            const handleResize = function () {
                const rec = {
                    width: window.innerWidth,
                    height: window.innerHeight,
                }
                clearTimeout(window.resizedFinished);
                window.resizedFinished = setTimeout(function () {
                    setScreenSize(rec);
                }, 250);
            }
            window.addEventListener('resize', handleResize);
            // Clean up the event listener when the component unmounts
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }, []);

    return screenSize;
};