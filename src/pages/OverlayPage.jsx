import { useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'

// Function to remove green screen background
const removeGreenScreen = (imageSrc) => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'

        img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            canvas.width = img.width
            canvas.height = img.height

            ctx.drawImage(img, 0, 0)

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data

            // Process each pixel
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i]
                const g = data[i + 1]
                const b = data[i + 2]

                // Check if pixel is green (chroma key detection)
                // Green screen typically has high green, lower red and blue
                const isGreen = g > 100 && g > r * 1.2 && g > b * 1.2

                if (isGreen) {
                    // Make pixel transparent
                    data[i + 3] = 0
                }
            }

            ctx.putImageData(imageData, 0, 0)

            // Convert canvas to data URL
            const processedImageUrl = canvas.toDataURL('image/png')
            resolve(processedImageUrl)
        }

        img.onerror = (error) => {
            reject(error)
        }

        img.src = imageSrc
    })
}

function OverlayPage({ selectedImage, onSelectOverlay }) {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleFileSelect = async (event) => {
        const file = event.target.files[0]
        if (file) {
            setIsProcessing(true)
            try {
                const imageUrl = URL.createObjectURL(file)

                // Remove green screen background
                const processedImageUrl = await removeGreenScreen(imageUrl)

                onSelectOverlay({ src: processedImageUrl, name: file.name })
                navigate('/result')
            } catch (error) {
                console.error('Error processing image:', error)
                // Fallback: use original image if processing fails
                const imageUrl = URL.createObjectURL(file)
                onSelectOverlay({ src: imageUrl, name: file.name })
                navigate('/result')
            } finally {
                setIsProcessing(false)
            }
        }
    }

    const handleSelectFromDevice = () => {
        fileInputRef.current?.click()
    }

    const handleBack = () => {
        navigate('/')
    }

    if (!selectedImage) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-8">
                <p className="text-white text-xl mb-4">No image selected</p>
                <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center p-8">
            <button
                onClick={handleBack}
                className="self-start mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
            </button>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent text-center">
                Add Your Photo
            </h1>
            <p className="text-gray-400 mb-8 text-lg text-center">Select an image with green screen background</p>

            {/* Preview of selected frame */}
            <div className="mb-12 p-6 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700/50">
                <p className="text-gray-400 text-sm mb-4 text-center">Selected Frame:</p>
                <img
                    src={selectedImage.src}
                    alt={selectedImage.name}
                    className="h-48 md:h-64 object-contain rounded-lg mx-auto"
                />
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Upload button */}
            <button
                onClick={handleSelectFromDevice}
                disabled={isProcessing}
                className={`group flex flex-col items-center gap-4 p-8 bg-gray-800/50 rounded-2xl backdrop-blur-sm border-2 border-dashed transition-all duration-300 cursor-pointer ${isProcessing
                        ? 'border-gray-600 opacity-50 cursor-wait'
                        : 'border-gray-600 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/20'
                    }`}
            >
                <div className={`w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center transition-transform ${isProcessing ? '' : 'group-hover:scale-110'
                    }`}>
                    {isProcessing ? (
                        <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    )}
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-white group-hover:text-orange-400 transition-colors">
                        {isProcessing ? 'Removing Green Screen...' : 'Choose from Gallery'}
                    </h3>
                    <p className="text-gray-500 mt-1">
                        {isProcessing ? 'Please wait' : 'Green background will be removed automatically'}
                    </p>
                </div>
            </button>

            <p className="mt-8 text-gray-500 text-sm text-center">
                Supported formats: JPG, PNG, GIF, WebP
            </p>
        </div>
    )
}

export default OverlayPage
