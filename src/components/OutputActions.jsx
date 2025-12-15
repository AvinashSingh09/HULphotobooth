import PropTypes from 'prop-types';
import printJS from 'print-js';

function OutputActions({ finalImageSrc, onRestart }) {

  const handleDownload = () => {
    if (!finalImageSrc) return;
    const link = document.createElement('a');
    link.href = finalImageSrc;
    link.download = 'framed-photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Method 1: Using print-js library (recommended for photos)
  const handlePrint = () => {
    if (!finalImageSrc) return;

    printJS({
      printable: finalImageSrc,
      type: 'image',
      imageStyle: 'width:100%;height:100%;object-fit:contain;',
      style: '@page { size: auto; margin: 0; } body { margin: 0; padding: 0; }',
      header: null,
      showModal: true,
      modalMessage: 'Preparing photo for printing...'
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto mt-6">
      <button
        onClick={handleDownload}
        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Image
      </button>

      <button
        onClick={handlePrint}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print Photo
      </button>

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
