import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { uploadToCloudinary } from '../services/cloudinaryService';

function OutputActions({ finalImageSrc, onRestart }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // Refs to prevent double uploads and track mount state
  const uploadAttemptedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Auto-upload when finalImageSrc is available
  useEffect(() => {
    isMountedRef.current = true;

    if (finalImageSrc && !uploadAttemptedRef.current) {
      uploadAttemptedRef.current = true;
      handleUpload();
    }

    // Track unmount - but DON'T cancel upload
    return () => {
      isMountedRef.current = false;
    };
  }, [finalImageSrc]);

  const handleUpload = async () => {
    if (!finalImageSrc || isUploading) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload continues even if component unmounts
      const url = await uploadToCloudinary(finalImageSrc);

      // Only update state if still mounted
      if (isMountedRef.current) {
        setImageUrl(url);
        // Don't auto-show QR - let user choose via button
        setIsUploading(false);
      }
      // Image is saved to Cloudinary regardless of mount state
      console.log('Image uploaded successfully:', url);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      if (isMountedRef.current) {
        setUploadError(error.message || 'Failed to upload image');
        setIsUploading(false);
        uploadAttemptedRef.current = false; // Allow retry on error
      }
    }
  };

  const handleDownload = () => {
    if (!finalImageSrc) return;
    const link = document.createElement('a');
    link.href = finalImageSrc;
    link.download = 'framed-photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleQR = () => {
    setShowQR(!showQR);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto mt-6">

      {/* Upload Status */}
      {isUploading && (
        <div className="w-full py-4 bg-purple-600/50 text-white rounded-xl font-medium flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Uploading to cloud...
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="w-full p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center">
          <p className="mb-2">{uploadError}</p>
          <button
            onClick={handleUpload}
            className="text-sm underline hover:text-white"
          >
            Retry Upload
          </button>
        </div>
      )}

      {/* QR Code Display - Premium Styled */}
      {imageUrl && showQR && (
        <div className="w-full relative animate-in fade-in zoom-in duration-300">
          {/* Outer glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-fuchsia-500/30 blur-xl rounded-3xl"></div>

          {/* Main container with glassmorphism */}
          <div className="relative bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-2xl">
            {/* Decorative gradient bar at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 rounded-full"></div>

            {/* Header */}
            <div className="text-center mb-4 mt-2">
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                Scan to Access
              </h3>
              <p className="text-gray-500 text-xs mt-1">Your photo is ready in the cloud</p>
            </div>

            {/* QR Code with decorative frame */}
            <div className="relative mx-auto w-fit">
              {/* Corner decorations */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-l-3 border-t-3 border-cyan-500 rounded-tl-lg"></div>
              <div className="absolute -top-2 -right-2 w-6 h-6 border-r-3 border-t-3 border-purple-500 rounded-tr-lg"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-3 border-b-3 border-purple-500 rounded-bl-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-3 border-b-3 border-fuchsia-500 rounded-br-lg"></div>

              {/* QR Code */}
              <div className="bg-white p-3 rounded-xl shadow-inner">
                <QRCodeSVG
                  value={imageUrl}
                  size={180}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#1f2937"
                />
              </div>
            </div>

            {/* Footer text */}
            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm font-medium flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Uploaded successfully
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show/Hide QR Button */}
      {imageUrl && (
        <button
          onClick={toggleQR}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          {showQR ? 'Hide QR Code' : 'Show QR Code'}
        </button>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Image
      </button>

      {/* Start Over Button */}
      <button
        onClick={onRestart}
        className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Start Over
      </button>
    </div>
  );
}

OutputActions.propTypes = {
  finalImageSrc: PropTypes.string,
  onRestart: PropTypes.func.isRequired,
};

export default OutputActions;
