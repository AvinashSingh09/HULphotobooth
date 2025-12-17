import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

// Calibrated values - ADJUST THESE FOR YOUR TEMPLATE
// Use the calibration sliders to find the right values, then update here
const INITIAL_CONFIG = {
    x: 85,       // Photo X position (pixels from left)
    y: 390,      // Photo Y position (pixels from top)
    width: 720,  // Photo width
    height: 880, // Photo height
};

function ImageComposer({ templateSrc, capturedFile, onCompositionComplete, onRetake }) {
    const canvasRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isProcessing, setIsProcessing] = useState(true);

    // Calibration State
    const [config, setConfig] = useState(INITIAL_CONFIG);
    const [showCalibration, setShowCalibration] = useState(false);
    const [templateDimensions, setTemplateDimensions] = useState({ w: 0, h: 0 });

    useEffect(() => {
        if (!templateSrc || !capturedFile) return;
        generateComposite();
    }, [templateSrc, capturedFile, config]);

    const generateComposite = async () => {
        setIsProcessing(true);
        try {
            const templateImg = await loadImage(templateSrc);
            setTemplateDimensions({ w: templateImg.width, h: templateImg.height });

            const capturedImgUrl = URL.createObjectURL(capturedFile);
            const capturedImg = await loadImage(capturedImgUrl);

            const canvas = document.createElement('canvas');
            canvas.width = templateImg.width;
            canvas.height = templateImg.height;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 1. Draw Captured Image FIRST (Background)
            drawImageProp(ctx, capturedImg, config.x, config.y, config.width, config.height);

            // 2. Draw Template ON TOP (Foreground / Frame)
            ctx.drawImage(templateImg, 0, 0);

            // 3. Draw Debug Box if calibration is open
            if (showCalibration) {
                ctx.strokeStyle = "red";
                ctx.lineWidth = 5;
                ctx.strokeRect(config.x, config.y, config.width, config.height);
            }

            const finalDataUrl = canvas.toDataURL('image/png', 1.0);
            setPreviewUrl(finalDataUrl);
            onCompositionComplete(finalDataUrl);

        } catch (error) {
            console.error("Composition error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: parseInt(value, 10) || 0
        }));
    };

    const copyConfigToClipboard = () => {
        const configStr = `const INITIAL_CONFIG = {
    x: ${config.x},
    y: ${config.y},
    width: ${config.width},
    height: ${config.height},
};`;
        navigator.clipboard.writeText(configStr);
        alert('Config copied to clipboard! Paste it in ImageComposer.jsx');
    };

    return (
        <div className="flex flex-col items-center w-full max-w-sm mx-auto p-4">
            <h2 className="text-2xl font-bold text-white mb-4">Your Photo</h2>

            {/* Preview Area */}
            <div className="relative w-full bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                {isProcessing ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    <img src={previewUrl} alt="Composite Preview" className="w-full h-auto" />
                )}
            </div>

            {/* Calibration Toggle Button */}
            <button
                onClick={() => setShowCalibration(!showCalibration)}
                className="mt-4 text-sm text-purple-300 hover:text-white underline"
            >
                {showCalibration ? 'Hide Calibration' : '🔧 Adjust Photo Position'}
            </button>

            {/* Calibration Controls */}
            {showCalibration && (
                <div className="w-full mt-4 p-4 bg-purple-900/60 rounded-xl border border-purple-500/30">
                    <h3 className="text-white font-bold mb-3 text-center">📐 Position Calibration</h3>
                    <p className="text-purple-200/70 text-xs mb-4 text-center">
                        Template: {templateDimensions.w} × {templateDimensions.h}px
                    </p>

                    <div className="space-y-3">
                        <div>
                            <label className="text-purple-200 text-sm flex justify-between">
                                <span>X Position</span>
                                <span className="text-cyan-400">{config.x}px</span>
                            </label>
                            <input
                                type="range"
                                name="x"
                                min="0"
                                max={templateDimensions.w}
                                value={config.x}
                                onChange={handleConfigChange}
                                className="w-full accent-cyan-500"
                            />
                        </div>

                        <div>
                            <label className="text-purple-200 text-sm flex justify-between">
                                <span>Y Position</span>
                                <span className="text-cyan-400">{config.y}px</span>
                            </label>
                            <input
                                type="range"
                                name="y"
                                min="0"
                                max={templateDimensions.h}
                                value={config.y}
                                onChange={handleConfigChange}
                                className="w-full accent-cyan-500"
                            />
                        </div>

                        <div>
                            <label className="text-purple-200 text-sm flex justify-between">
                                <span>Width</span>
                                <span className="text-cyan-400">{config.width}px</span>
                            </label>
                            <input
                                type="range"
                                name="width"
                                min="100"
                                max={templateDimensions.w}
                                value={config.width}
                                onChange={handleConfigChange}
                                className="w-full accent-cyan-500"
                            />
                        </div>

                        <div>
                            <label className="text-purple-200 text-sm flex justify-between">
                                <span>Height</span>
                                <span className="text-cyan-400">{config.height}px</span>
                            </label>
                            <input
                                type="range"
                                name="height"
                                min="100"
                                max={templateDimensions.h}
                                value={config.height}
                                onChange={handleConfigChange}
                                className="w-full accent-cyan-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={copyConfigToClipboard}
                        className="mt-4 w-full py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-medium text-sm hover:scale-105 transition-transform"
                    >
                        📋 Copy Config Values
                    </button>

                    <p className="text-purple-300/50 text-xs mt-2 text-center">
                        Red box shows photo placement area
                    </p>
                </div>
            )}
        </div>
    );
}

// Helper to load image
const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
    });
};

/**
 * Mimics object-fit: cover for canvas
 */
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,
        nh = ih * r,
        cx, cy, cw, ch, ar = 1;

    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
    nw *= ar;
    nh *= ar;

    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}


ImageComposer.propTypes = {
    templateSrc: PropTypes.string,
    capturedFile: PropTypes.object,
    onCompositionComplete: PropTypes.func.isRequired,
    onRetake: PropTypes.func.isRequired,
};

export default ImageComposer;
