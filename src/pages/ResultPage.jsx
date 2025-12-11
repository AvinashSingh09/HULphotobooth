import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { toPng } from 'html-to-image'

function ResultPage({ selectedImage, selectedOverlay, userName }) {
    const navigate = useNavigate()
    const certificateRef = useRef(null)

    const handleStartOver = () => {
        navigate('/')
    }

    const handleDownload = async () => {
        if (certificateRef.current) {
            try {
                const dataUrl = await toPng(certificateRef.current, {
                    quality: 1.0,
                    pixelRatio: 2,
                    skipAutoScale: true,
                    filter: (node) => {
                        // Skip any nodes that might cause issues
                        return true
                    }
                })
                const link = document.createElement('a')
                link.download = `certificate-${userName || 'user'}.png`
                link.href = dataUrl
                link.click()
            } catch (error) {
                console.error('Error generating image:', error)
                // Fallback: try again with simpler settings
                try {
                    const dataUrl = await toPng(certificateRef.current)
                    const link = document.createElement('a')
                    link.download = `certificate-${userName || 'user'}.png`
                    link.href = dataUrl
                    link.click()
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError)
                    alert('Unable to download. Please take a screenshot instead.')
                }
            }
        }
    }

    const handlePrint = async () => {
        if (certificateRef.current) {
            try {
                const dataUrl = await toPng(certificateRef.current, {
                    quality: 1.0,
                    pixelRatio: 2
                })
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
                                <img src="${dataUrl}" />
                            </body>
                        </html>
                    `)
                    printWindow.document.close()
                    printWindow.onload = () => {
                        printWindow.print()
                    }
                }
            } catch (error) {
                console.error('Error printing:', error)
                alert('Unable to print. Please take a screenshot instead.')
            }
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
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
                <button
                    onClick={handleDownload}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                </button>
                <button
                    onClick={handlePrint}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
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
