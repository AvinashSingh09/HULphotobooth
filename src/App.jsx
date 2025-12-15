import { useState, useCallback } from 'react';
import TemplateSelector from './components/TemplateSelector';
import CameraCapture from './components/CameraCapture';
import ImageComposer from './components/ImageComposer';
import OutputActions from './components/OutputActions';

function App() {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen toggle error:', err);
    }
  }, []);

  // Step 1: Template Selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setStep(2);
  };

  // Step 2: Camera Capture
  const handleCapture = (file) => {
    setCapturedFile(file);
    setStep(3);
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setStep(1);
  };

  // Step 3: Composition & Output
  const handleCompositionComplete = (dataUrl) => {
    setFinalImage(dataUrl);
  };

  const handleRetake = () => {
    setCapturedFile(null);
    setFinalImage(null);
    setStep(2);
  };

  const handleRestart = () => {
    setStep(1);
    setSelectedTemplate(null);
    setCapturedFile(null);
    setFinalImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 flex flex-col items-center py-8 px-4 font-sans">

      {/* Header */}
      <header className="mb-8 text-center">
        <h1
          onClick={toggleFullscreen}
          className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 mb-2 cursor-pointer hover:scale-105 transition-transform select-none"
          title={isFullscreen ? "Click to exit fullscreen" : "Click to enter fullscreen"}
        >
          Photo Booth
        </h1>
        <p className="text-purple-200/70">Create your personalized frame in seconds</p>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-grow flex flex-col items-center justify-center">

        {step === 1 && (
          <TemplateSelector onSelect={handleTemplateSelect} />
        )}

        {step === 2 && (
          <CameraCapture
            onCapture={handleCapture}
            onBack={handleBackToTemplates}
          />
        )}

        {step === 3 && selectedTemplate && capturedFile && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <ImageComposer
              templateSrc={selectedTemplate.src}
              capturedFile={capturedFile}
              onCompositionComplete={handleCompositionComplete}
              onRetake={handleRetake}
            />

            {/* Show actions only when image is ready */}
            {finalImage && (
              <OutputActions
                finalImageSrc={finalImage}
                onRestart={handleRestart}
              />
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-12 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Photo Frame App
      </footer>

    </div>
  );
}

export default App;
