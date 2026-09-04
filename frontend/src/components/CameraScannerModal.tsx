import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, AlertCircle, SwitchCamera, Upload } from 'lucide-react';
import { type Language, translations } from '../i18n/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  lang: Language;
}

export function CameraScannerModal({ isOpen, onClose, onCapture, lang }: Props) {
  const t = translations[lang];
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileFallbackRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    // Check if multiple camera devices exist
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      }).catch(() => {});
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    setIsInitializing(true);
    setError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsInitializing(false);
    } catch (err: any) {
      console.warn('Camera access error, falling back to default:', err);
      // Try fallback to any video stream without facingMode constraint
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
        setIsInitializing(false);
      } catch (fallbackErr: any) {
        setIsInitializing(false);
        setError(fallbackErr?.message || 'Unable to access camera device');
      }
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (blob) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const file = new File([blob], `camera_scan_${timestamp}.jpg`, { type: 'image/jpeg' });
        stopCamera();
        onClose();
        onCapture(file);
      }
    }, 'image/jpeg', 0.95);
  };

  const handleFallbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      stopCamera();
      onClose();
      onCapture(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-700 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0F2942] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Camera className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold tracking-wide">{t.cameraModalTitle}</h3>
              <p className="text-[11px] text-slate-300">{t.cameraModalSubtitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Scanner Body */}
        <div className="relative bg-slate-950 flex-1 min-h-[360px] flex items-center justify-center overflow-hidden">
          {isInitializing && (
            <div className="flex flex-col items-center text-white py-12">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-3" />
              <p className="text-xs font-semibold tracking-wide">Connecting Optical Camera Feed...</p>
            </div>
          )}

          {error ? (
            <div className="p-6 text-center max-w-md bg-slate-900/90 rounded-lg border border-rose-900/50 m-4">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">{t.cameraErrorTitle}</h4>
              <p className="text-xs text-slate-300 mb-4">{t.cameraErrorDesc}</p>
              
              <input
                ref={fileFallbackRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFallbackFile}
              />

              <button
                type="button"
                onClick={() => fileFallbackRef.current?.click()}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-md transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>{t.cameraSelectFileFallback}</span>
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain max-h-[460px]"
              />

              {/* Viewfinder Reticle Overlay */}
              {!isInitializing && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                  <div className="w-full max-w-md aspect-[4/3] border-2 border-dashed border-amber-400/80 rounded-lg relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                    {/* Corner Marks */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400 -mt-1 -ml-1 rounded-tl" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400 -mt-1 -mr-1 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400 -mb-1 -ml-1 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400 -mb-1 -mr-1 rounded-br" />

                    {/* Scan Guide Line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse opacity-80" />

                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] bg-black/70 text-amber-300 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                      Align Packaging Declarations
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Hidden Canvas for High-Resolution Snapshot extraction */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Modal Controls Footer */}
        <div className="bg-slate-900 px-5 py-3 flex items-center justify-between border-t border-slate-800">
          <div>
            {hasMultipleCameras && !error && (
              <button
                type="button"
                onClick={toggleFacingMode}
                className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                <SwitchCamera className="w-4 h-4 text-amber-400" />
                <span>{t.cameraSwitchBtn}</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              {t.cameraCloseBtn}
            </button>

            {!error && !isInitializing && (
              <button
                type="button"
                onClick={handleCapture}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4 text-amber-300" />
                <span>{t.cameraCaptureBtn}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
