import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function App() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Initialize scanner when component mounts
  useEffect(() => {
    if (!showScanner) return;

    // Create scanner instance if it doesn't exist
    if (!scannerRef.current) {
      try {
        scannerRef.current = new Html5Qrcode('reader');
      } catch (err) {
        console.error('Failed to initialize QR scanner:', err);
        setScannerError('Failed to initialize scanner. Please try again.');
        return;
      }
    }

    // Start scanning when isScanning is true
    if (isScanning) {
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      scannerRef.current
        .start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            setScanResult(decodedText);
            stopScanner();
          },
          (error) => {
            // Silent error handling for scanning process
            console.error('QR Code scanning error:', error);
          }
        )
        .catch((err) => {
          console.error('Failed to start scanner:', err);
          setScannerError('Failed to access camera. Please check permissions and try again.');
          setIsScanning(false);
        });
    }

    // Cleanup function
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch((error) => {
          console.error('Failed to stop scanner:', error);
        });
      }
    };
  }, [isScanning, showScanner]);

  // Clean up scanner on component unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  // Function to handle starting the scanner
  const startScanner = () => {
    setScannerError(null);
    setShowScanner(true);
    setIsScanning(true);
  };

  // Function to handle stopping the scanner
  const stopScanner = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          setIsScanning(false);
          // We don't hide the scanner component
        })
        .catch((error) => {
          console.error('Failed to stop scanner:', error);
          setIsScanning(false);
        });
    } else {
      setIsScanning(false);
    }
  };

  // Function to close the scanner view
  const closeScanner = () => {
    stopScanner();
    setShowScanner(false);
    // Clear the scanner instance when closing
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err: unknown) {
        console.error('Error clearing scanner:', err);
      }
      scannerRef.current = null;
    }
  };

  return (
    <div className='bg-white min-h-screen p-4 text-gray-800'>
      <div className='max-w-md mx-auto'>
        <h1 className='text-2xl font-bold mb-4'>QR Code Scanner</h1>

        {!showScanner && !scanResult && (
          <button onClick={startScanner} className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'>
            Start Scanning
          </button>
        )}

        {/* Show error message if there's an error */}
        {scannerError && (
          <div className='mt-4 p-3 bg-red-100 text-red-700 rounded-md'>
            {scannerError}
            <button onClick={() => setScannerError(null)} className='ml-2 text-red-700 font-bold'>
              ×
            </button>
          </div>
        )}

        {/* Show the scanner component when showScanner is true */}
        {showScanner && (
          <div className='mt-4'>
            <div id='reader' className='w-full' style={{ minHeight: '300px' }}></div>

            <div className='flex space-x-2 mt-4'>
              {!isScanning && (
                <button
                  onClick={() => setIsScanning(true)}
                  className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                >
                  Resume Scanning
                </button>
              )}

              <button onClick={closeScanner} className='bg-red-500 text-white px-4 py-2 rounded-md'>
                Close Scanner
              </button>
            </div>
          </div>
        )}

        {scanResult && (
          <div className='mt-4'>
            <h2 className='text-xl font-semibold'>Scan Result:</h2>
            <div className='p-4 bg-gray-100 rounded-md mt-2 break-all'>
              <p>{scanResult}</p>
            </div>
            <button
              onClick={() => {
                setScanResult(null);
                startScanner();
              }}
              className='bg-blue-500 text-white px-4 py-2 rounded-md mt-4'
            >
              Scan Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
