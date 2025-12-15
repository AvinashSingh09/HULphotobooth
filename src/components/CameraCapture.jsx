import PropTypes from 'prop-types';
import { useRef } from 'react';

function CameraCapture({ onCapture, onBack }) {
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onCapture(file);
        }
    };

    const triggerCamera = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto p-6 bg-purple-900/60 rounded-2xl backdrop-blur-sm border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">Capture Photo</h2>
            <p className="text-purple-200/70 mb-8 text-center">
                Use your camera to take a photo. For best results, ensure good lighting.
            </p>

            {/* Hidden File Input configured for Environment Camera */}
            <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            <button
                onClick={triggerCamera}
                className="w-full mb-4 py-4 px-6 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Take Photo
            </button>

            <button
                onClick={triggerCamera}
                className="w-full py-4 px-6 bg-purple-800/50 hover:bg-purple-700/60 text-white rounded-xl font-medium flex items-center justify-center gap-2 border border-purple-500/30"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload from Gallery
            </button>

            <div className="mt-6">
                <button
                    onClick={onBack}
                    className="text-purple-300 hover:text-white underline text-sm"
                >
                    Select a different frame
                </button>
            </div>
        </div>
    );
}

CameraCapture.propTypes = {
    onCapture: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
};

export default CameraCapture;
