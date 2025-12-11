import { useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'

function ResultPage({ selectedImage, selectedOverlay, userName }) {
    const navigate = useNavigate()
    const certificateRef = useRef(null)
    const canvasRef = useRef(null)
    const [canvasDataUrl, setCanvasDataUrl] = useState(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleStartOver = () => {
        navigate('/')
    }

    // Generate the composite image using canvas
    const generateCompositeImage = () => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            // Load the base frame image
            const frameImg = new Image()
            frameImg.crossOrigin = 'anonymous'

            frameImg.onload = () => {
                // Set canvas size to match frame
                canvas.width = frameImg.width
                canvas.height = frameImg.height

                // Draw the frame
                ctx.drawImage(frameImg, 0, 0)

                // Draw the user's name
                const fontSize = Math.floor(canvas.width * 0.025) // 2.5% of width
                ctx.font = `500 ${fontSize}px Arial, sans-serif`
                ctx.fillStyle = '#374151'
                const nameX = canvas.width * 0.33
                const nameY = canvas.height * 0.84
                ctx.fillText(userName || '', nameX, nameY)

                // Load and draw the overlay image
                const overlayImg = new Image()
                overlayImg.crossOrigin = 'anonymous'

                overlayImg.onload = () => {
                    // Calculate overlay position and size
                    const overlayWidth = canvas.width * 0.5
                    const overlayHeight = canvas.height * 0.6
                    const overlayX = (canvas.width * 0.20) - (overlayWidth * 0.5)
                    const overlayY = canvas.height * 0.13

                    // Draw overlay maintaining aspect ratio
                    const aspectRatio = overlayImg.width / overlayImg.height
                    let drawWidth = overlayWidth
                    let drawHeight = overlayWidth / aspectRatio

                    if (drawHeight > overlayHeight) {
                        drawHeight = overlayHeight
                        drawWidth = overlayHeight * aspectRatio
                    }

                    const drawX = overlayX + (overlayWidth - drawWidth) / 2
                    const drawY = overlayY

                    ctx.drawImage(overlayImg, drawX, drawY, drawWidth, drawHeight)

                    // Convert to data URL
                    const dataUrl = canvas.toDataURL('image/png', 1.0)
                    resolve(dataUrl)
                }

                overlayImg.onerror = () => {
                    // If overlay fails, still return the frame with name
                    const dataUrl = canvas.toDataURL('image/png', 1.0)
                    resolve(dataUrl)
                }

                overlayImg.src = selectedOverlay.src
            }

            frameImg.onerror = (err) => {
                reject(new Error('Failed to load frame image'))
            }

            frameImg.src = selectedImage.src
        })
    }

    // Generate image on component mount
    useEffect(() => {
        if (selectedImage && selectedOverlay) {
            setIsGenerating(true)
            generateCompositeImage()
                .then(dataUrl => {
                    setCanvasDataUrl(dataUrl)
                    setIsGenerating(false)
                })
                .catch(err => {
                    console.error('Error generating composite:', err)
                    setIsGenerating(false)
                })
        }
    }, [selectedImage, selectedOverlay, userName])

    const handleDownload = async () => {
        if (canvasDataUrl) {
            // For mobile compatibility, create a blob and use it
            try {
                const response = await fetch(canvasDataUrl)
                const blob = await response.blob()

                // Try using the share API for mobile
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'certificate.png', { type: 'image/png' })] })) {
                    const file = new File([blob], `certificate-${userName || 'user'}.png`, { type: 'image/png' })
                    await navigator.share({
                        files: [file],
                        title: 'Certificate',
                    })
                } else {
                    // Fallback to regular download
                    const link = document.createElement('a')
                    link.download = `certificate-${userName || 'user'}.png`
                    link.href = canvasDataUrl
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                }
            } catch (error) {
                console.error('Download error:', error)
                // Final fallback - open in new tab
                const newTab = window.open()
                if (newTab) {
                    newTab.document.write(`<img src="${canvasDataUrl}" style="max-width:100%"/>`)
                    newTab.document.title = 'Certificate - Long press to save'
                }
            }
        } else {
            alert('Image is still generating. Please wait a moment and try again.')
        }
    }

    const handlePrint = async () => {
        if (canvasDataUrl) {
            const printWindow = window.open('', '_blank')
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title></title>
                            <style>
                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                html, body { 
                                    width: 100%; 
                                    height: 100%; 
                                    margin: 0; 
                                    padding: 0;
                                    background: white;
                                }
                                body { 
                                    display: flex; 
                                    justify-content: center; 
                                    align-items: center;
                                }
                                img { 
                                    max-width: 96%; 
                                    max-height: 100vh; 
                                    object-fit: contain;
                                }
                                @page { 
                                    size: landscape; 
                                    margin: 0; 
                                }
                                @media print { 
                                    @page {
                                        size: landscape;
                                        margin: 0;
                                    }
                                    html, body { 
                                        width: 100%; 
                                        height: 100%; 
                                        margin: 0 !important; 
                                        padding: 0 !important;
                                        background: white !important;
                                        -webkit-print-color-adjust: exact;
                                        print-color-adjust: exact;
                                    }
                                    img { 
                                        width: 96%; 
                                        height: auto;
                                        max-height: 100%;
                                    }
                                }
                            </style>
                        </head>
                        <body>
                            <img src="${canvasDataUrl}" />
                        </body>
                    </html>
                `)
                printWindow.document.close()

                // Wait for image to load before printing
                const img = printWindow.document.querySelector('img')
                if (img) {
                    img.onload = () => {
                        setTimeout(() => {
                            printWindow.print()
                        }, 100)
                    }
                    // If image is already loaded (cached)
                    if (img.complete) {
                        setTimeout(() => {
                            printWindow.print()
                        }, 100)
                    }
                }
            }
        } else {
            alert('Image is still generating. Please wait a moment and try again.')
        }
    }

    if (!selectedImage || !selectedOverlay) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-8">
                <p className="text-white text-xl mb-4">No selections made</p>
                <button
                    onClick={handleStartOver}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    Start Over
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center p-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                Your Certificate
            </h1>
            <p className="text-gray-400 mb-8 text-lg">Here's your personalized certificate</p>

            {/* Combined result */}
            <div className="relative max-w-2xl w-full bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm border border-gray-700/50">
                {isGenerating ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                    </div>
                ) : canvasDataUrl ? (
                    <img
                        src={canvasDataUrl}
                        alt="Certificate"
                        className="w-full object-contain rounded-xl"
                    />
                ) : (
                    <div
                        ref={certificateRef}
                        className="relative"
                        style={{ backgroundColor: '#ffffff' }}
                    >
                        {/* Base frame image */}
                        <img
                            src={selectedImage.src}
                            alt={selectedImage.name}
                            className="w-full object-contain"
                            style={{ display: 'block' }}
                        />

                        {/* User's name rendered on the certificate */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '14%',
                                left: '33%',
                                fontSize: 'clamp(10px, 2vw, 18px)',
                                fontFamily: 'Arial, sans-serif',
                                color: '#374151',
                                fontWeight: '500'
                            }}
                        >
                            {userName}
                        </div>

                        {/* Overlay image on top */}
                        <img
                            src={selectedOverlay.src}
                            alt={selectedOverlay.name}
                            style={{
                                position: 'absolute',
                                width: '50%',
                                height: '60%',
                                bottom: '27%',
                                left: '20%',
                                transform: 'translateX(-50%)',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
                <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className={`px-8 py-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30 flex items-center gap-2 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {isGenerating ? 'Generating...' : 'Download'}
                </button>
                <button
                    onClick={handlePrint}
                    disabled={isGenerating}
                    className={`px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 flex items-center gap-2 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    {isGenerating ? 'Generating...' : 'Print'}
                </button>
                <button
                    onClick={handleStartOver}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30"
                >
                    Start Over
                </button>
            </div>
        </div>
    )
}

export default ResultPage
