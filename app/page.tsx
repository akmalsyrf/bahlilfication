'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const ParticleTransition = dynamic(() => import('@/components/ParticleTransition'), {
  ssr: false,
});

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [finalProcessedUrl, setFinalProcessedUrl] = useState<string | null>(null);
  const [transitionImage, setTransitionImage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showingOriginal, setShowingOriginal] = useState(false); // NEW: show original before animation
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const animateTransition = useCallback((fromUrl: string, toUrl: string) => {
    // Use transparent target-face as the convergence mask for particles
    setTransitionImage(toUrl);
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Reset state
    setError(null);
    setProcessedImage(null);
    setTransitionImage(null);
    setIsTransitioning(false);
    setShowingOriginal(false);
    setTransitionProgress(0);
    setProcessingTime(null);

    // Show original image
    const reader = new FileReader();
    let currentOriginalImage: string | null = null;
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      currentOriginalImage = imageUrl;
      setOriginalImage(imageUrl);
    };
    reader.readAsDataURL(file);

    // Upload and process
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const startTime = Date.now();
      const response = await fetch('/api/bahlilfy', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Processing failed');
      }

      const blob = await response.blob();
      const finalUrl = URL.createObjectURL(blob);
      
      const time = Date.now() - startTime;
      setProcessingTime(time);
      
      // Processing complete! Show original image for 1 second
      setUploading(false);
      setShowingOriginal(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Start transition animation
      setShowingOriginal(false);
      setIsTransitioning(true);
      setFinalProcessedUrl(finalUrl);
      // Wait for originalImage to be set, then use it
      await new Promise(resolve => setTimeout(resolve, 100));
      animateTransition(currentOriginalImage || originalImage || '', '/target-face.png'); // use mask with transparent bg
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [animateTransition, originalImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const downloadImage = () => {
    if (!processedImage) return;
    const a = document.createElement('a');
    a.href = processedImage;
    a.download = `bahlilfied-${Date.now()}.png`;
    a.click();
  };

  const reset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setTransitionImage(null);
    setIsTransitioning(false);
    setTransitionProgress(0);
    setError(null);
    setProcessingTime(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            bahlilfication
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-2">
            Transform any image into bahlilfied
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Inspired by{' '}
            <a
              href="https://www.instagram.com/reel/DQl5qErDaBc/?igsh=MW5iMGgwaW1sOG5rYw=="
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-purple-600"
            >
              this reel
            </a>
          </p>
        </div>

        {/* Upload Area */}
        {!originalImage && (
          <div className="max-w-2xl mx-auto animate-slide-up">
            <div
              {...getRootProps()}
              className={`
                border-4 border-dashed rounded-2xl p-12 md:p-20 text-center cursor-pointer
                transition-all duration-300 ease-in-out
                ${
                  isDragActive
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-105'
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                    {isDragActive ? 'Drop your image here' : 'Drop an image or click to upload'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    JPEG, PNG, or WebP (max 10MB)
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Processing/Results */}
        {originalImage && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Original */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
                  Original
                </h2>
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-200 dark:border-gray-700">
                  <Image
                    src={originalImage}
                    alt="Original"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>

              {/* Processed */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
                  Bahlilfied
                  {isTransitioning && (
                    <span className="text-sm font-normal text-purple-600 ml-2">
                      ({Math.round(transitionProgress * 100)}%)
                    </span>
                  )}
                </h2>
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-500">
                  {uploading ? (
                    <div className="relative w-full h-full">
                      {/* Show original image in background while processing */}
                      <Image
                        src={originalImage!}
                        alt="Processing"
                        fill
                        className="object-cover opacity-50"
                        unoptimized
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="text-center space-y-4">
                          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
                          <p className="text-white font-semibold text-lg">
                            🎨 Rearranging pixels...
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : showingOriginal ? (
                    <div className="relative w-full h-full">
                      {/* Show clean original image after processing */}
                      <Image
                        src={originalImage!}
                        alt="Original - Ready for animation"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg animate-bounce">
                        ✓ Processing Complete! Starting animation...
                      </div>
                    </div>
                  ) : isTransitioning && transitionImage ? (
                    <div className="relative w-full h-full bg-white dark:bg-gray-900">
                      <ParticleTransition
                        fromImage={originalImage!}
                        toImage={transitionImage}
                        width={500}
                        height={500}
                        duration={3000}
                        onComplete={() => {
                          setIsTransitioning(false);
                          if (finalProcessedUrl) {
                            setProcessedImage(finalProcessedUrl);
                          }
                          setTransitionImage(null);
                        }}
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg">
                        ✨ Particles converging... 
                      </div>
                    </div>
                  ) : processedImage ? (
                    <Image
                      src={processedImage}
                      alt="Processed"
                      fill
                      className="object-cover animate-fade-in"
                      unoptimized
                    />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Actions */}
            {processedImage && (
              <div className="mt-8 text-center space-y-4 animate-slide-up">
                {processingTime && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Processed in {(processingTime / 1000).toFixed(2)}s
                  </p>
                )}
                <div className="flex gap-4 justify-center flex-wrap">
                  <button
                    onClick={downloadImage}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Download Result
                  </button>
                  <button
                    onClick={reset}
                    className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Upload Another
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
                <button
                  onClick={reset}
                  className="mt-4 mx-auto block px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Reference:{' '}
            <a
              href="https://www.instagram.com/reel/DQl5qErDaBc/?igsh=MW5iMGgwaW1sOG5rYw=="
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-purple-600"
            >
              Instagram reel
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}

