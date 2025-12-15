import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

// Calibrated values from user testing
const INITIAL_CONFIG = {
    x: 230,
    y: 705,
    width: 1035,
    height: 1140,
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
    }, [templateSrc, capturedFile, config]); // Re-run when config changes

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

            // 3. (Optional) Draw Debug Box if calibration is open
            /* 
            if (showCalibration) {
              ctx.strokeStyle = "red";
              ctx.lineWidth = 5;
              ctx.strokeRect(config.x, config.y, config.width, config.height);
            }
            */
            // No, we don't want the red box in the final output even during calibration if we want to preview quality.
            // But for alignment it helps. Let's decide: we see the photo, so we know where it is. 
            // We don't need a red box.

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

    return (
        <div className="flex flex-col items-center w-full max-w-sm mx-auto p-4">
            <h2 className="text-2xl font-bold text-white mb-4">Your Photo</h2>

            {/* Preview Area - Compact */}
            <div className="relative w-full bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                {isProcessing ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    <img src={previewUrl} alt="Composite Preview" className="w-full h-auto" />
                )}
            </div>
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
 * Validates and mimics object-fit: cover for canvas
 */
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}


ImageComposer.propTypes = {
    templateSrc: PropTypes.string,
    capturedFile: PropTypes.object,
    onCompositionComplete: PropTypes.func.isRequired,
    onRetake: PropTypes.func.isRequired,
};

export default ImageComposer;
