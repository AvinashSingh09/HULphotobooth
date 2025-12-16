const CLOUD_NAME = 'dzz5belph';
const UPLOAD_PRESET = 'ImageUpload';

/**
 * Upload a base64 data URL image to Cloudinary
 * @param {string} base64DataUrl - The image as a base64 data URL
 * @param {AbortSignal} signal - Optional AbortSignal to cancel the upload
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export async function uploadToCloudinary(base64DataUrl, signal = null) {
    console.log('[Cloudinary] 📤 Starting upload...');
    console.log('[Cloudinary] 📊 Image size:', Math.round(base64DataUrl.length / 1024), 'KB');

    const startTime = performance.now();

    const formData = new FormData();
    formData.append('file', base64DataUrl);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'photo-booth');

    console.log('[Cloudinary] 🌐 Sending request to:', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
                signal,
            }
        );

        const duration = Math.round(performance.now() - startTime);
        console.log('[Cloudinary] ⏱️ Response received in:', duration, 'ms');
        console.log('[Cloudinary] 📡 Response status:', response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[Cloudinary] ❌ Upload failed:', errorData);
            throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('[Cloudinary] ✅ Upload successful!');
        console.log('[Cloudinary] 🔗 Image URL:', data.secure_url);
        console.log('[Cloudinary] 📁 Public ID:', data.public_id);
        console.log('[Cloudinary] 📐 Dimensions:', data.width, 'x', data.height);

        return data.secure_url;
    } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        console.error('[Cloudinary] ❌ Error after', duration, 'ms:', error.message);
        throw error;
    }
}
