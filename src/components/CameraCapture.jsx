import PropTypes from 'prop-types';
import { useRef, useState, useEffect, useCallback } from 'react';

function CameraCapture({ onCapture, onBack }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const streamRef = useRef(null);

    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Stop the camera stream
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    }, []);

    // Start the camera stream
    const startCamera = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const constraints = {
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setIsCameraActive(true);
        } catch (err) {
            console.error('Camera access error:', err);
            if (err.name === 'NotAllowedError') {
                setError('Camera access was denied. Please allow camera permissions and try again.');
            } else if (err.name === 'NotFoundError') {
                setError('No camera found. Please connect a camera and try again.');
            } else {
                setError('Could not access camera. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Capture photo from the video stream
    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas size to match video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob and create a File object
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
                stopCamera();
                onCapture(file);
            }
        }, 'image/jpeg', 0.95);
    };

    // Handle file upload from gallery
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            stopCamera();
            onCapture(file);
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto p-6 bg-purple-900/60 rounded-2xl backdrop-blur-sm border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">Capture Photo</h2>

            {!isCameraActive && !isLoading && (
                <p className="text-purple-200/70 mb-8 text-center">
                    Use your camera to take a photo. For best results, ensure good lighting.
                </p>
            )}

            {/* Hidden canvas for capturing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Hidden File Input for gallery upload */}
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {/* Error Message */}
            {error && (
                <div className="w-full mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center">
                    <p>{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="mt-2 text-sm underline hover:text-white"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Camera View */}
            {(isCameraActive || isLoading) && (
                <div className="w-full mb-4 relative overflow-hidden rounded-xl bg-black aspect-video">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-purple-900/80">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-purple-200">Starting camera...</p>
                            </div>
                        </div>
                    )}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />

                    {/* Camera overlay */}
                    {isCameraActive && (
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Corner brackets for framing */}
                            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-400/70"></div>
                            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-400/70"></div>
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-400/70"></div>
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-400/70"></div>
                        </div>
                    )}
                </div>
            )}

            {/* Camera Active: Show Capture and Close buttons */}
            {isCameraActive && (
                <div className="w-full flex flex-col gap-3">
                    <button
                        onClick={capturePhoto}
                        className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Capture Photo
                    </button>

                    <button
                        onClick={stopCamera}
                        className="w-full py-3 px-6 bg-purple-800/50 hover:bg-purple-700/60 text-white rounded-xl font-medium flex items-center justify-center gap-2 border border-purple-500/30"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Close Camera
                    </button>
                </div>
            )}

            {/* Initial State: Show Open Camera and Upload buttons */}
            {!isCameraActive && !isLoading && (
                <>
                    <button
                        onClick={startCamera}
                        className="w-full mb-4 py-4 px-6 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Take Photo
                    </button>

                    <button
                        onClick={triggerFileUpload}
                        className="w-full py-4 px-6 bg-purple-800/50 hover:bg-purple-700/60 text-white rounded-xl font-medium flex items-center justify-center gap-2 border border-purple-500/30"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload from Gallery
                    </button>
                </>
            )}

            <div className="mt-6">
                <button
                    onClick={() => {
                        stopCamera();
                        onBack();
                    }}
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
