import { useEffect, useRef, useState, useCallback } from 'react';

export default function useWebcam() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [faceDetected, setFaceDetected] = useState(true); // mock: always true by default

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsActive(true);
      setError(null);

      // Simulate face detection checks
      const faceCheckInterval = setInterval(() => {
        setFaceDetected(Math.random() > 0.05); // 95% of the time face is detected
      }, 3000);

      return () => clearInterval(faceCheckInterval);
    } catch (err) {
      setError(err.message || 'Camera access denied');
      setIsActive(false);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg');
  }, []);

  useEffect(() => {
    return () => stopWebcam();
  }, [stopWebcam]);

  return { videoRef, isActive, error, faceDetected, startWebcam, stopWebcam, captureFrame };
}
