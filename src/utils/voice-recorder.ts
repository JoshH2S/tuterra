
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private recordingInterval: number | null = null;
  private maxRecordingTime: number = 120000; // 2 minutes default max
  private recordingStartTime: number = 0;

  constructor(
    private onStart?: () => void,
    private onStop?: (audioBlob: Blob) => void,
    private onError?: (error: Error) => void,
    private onRecordingProgress?: (timeElapsed: number) => void,
    private options?: {
      mimeType?: string;
      audioBitsPerSecond?: number;
      maxRecordingTime?: number;
    }
  ) {
    // Override default max recording time if provided
    if (options?.maxRecordingTime) {
      this.maxRecordingTime = options.maxRecordingTime;
    }
  }

  async start(): Promise<void> {
    try {
      this.audioChunks = [];
      
      // Request microphone access with enhanced settings
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 2 // Stereo recording
        } 
      });
      
      // Determine best supported mime type
      const mimeType = this.getSupportedMimeType() || this.options?.mimeType;
      
      // Create media recorder with enhanced options
      const recorderOptions: MediaRecorderOptions = {
        audioBitsPerSecond: this.options?.audioBitsPerSecond || 128000 // Default to higher quality
      };
      
      // Add mime type if supported
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }
      
      this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions);
      
      // Set up event handlers
      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      });
      
      this.mediaRecorder.addEventListener('stop', () => {
        // Clear the recording timer
        if (this.recordingInterval) {
          window.clearInterval(this.recordingInterval);
          this.recordingInterval = null;
        }
        
        // Get the appropriate mime type for the blob
        const blobMimeType = mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: blobMimeType });
        
        if (this.onStop) {
          this.onStop(audioBlob);
        }
        
        // Clean up
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
      });
      
      // Start recording
      this.mediaRecorder.start(1000); // Capture chunks every second for better streaming
      this.recordingStartTime = Date.now();
      
      // Set up recording time tracker for longer recordings
      this.recordingInterval = window.setInterval(() => {
        const timeElapsed = Date.now() - this.recordingStartTime;
        
        // Call progress callback if provided
        if (this.onRecordingProgress) {
          this.onRecordingProgress(timeElapsed);
        }
        
        // Auto-stop if reached max recording time
        if (timeElapsed >= this.maxRecordingTime) {
          console.log(`Max recording time of ${this.maxRecordingTime/1000}s reached, stopping automatically`);
          this.stop();
        }
      }, 500); // Update progress every 500ms
      
      if (this.onStart) {
        this.onStart();
      }
      
    } catch (error) {
      if (this.onError) {
        this.onError(error instanceof Error ? error : new Error(String(error)));
      } else {
        console.error('Voice recording error:', error);
      }
    }
  }

  stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  isRecording(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === 'recording';
  }

  isPaused(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === 'paused';
  }

  getElapsedTime(): number {
    if (!this.recordingStartTime) return 0;
    return Date.now() - this.recordingStartTime;
  }

  // Gets the best supported audio format
  private getSupportedMimeType(): string | null {
    const types = [
      'audio/webm;codecs=opus', 
      'audio/webm', 
      'audio/ogg;codecs=opus',
      'audio/mp4;codecs=aac',
      'audio/mpeg'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log(`Using audio format: ${type}`);
        return type;
      }
    }
    
    console.warn('None of the preferred audio types are supported by this browser');
    return null;
  }
}

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Helper function to convert audio format if needed
export const convertAudioFormat = async (
  audioBlob: Blob, 
  targetFormat: string = 'audio/webm'
): Promise<Blob> => {
  // If the blob is already in the target format, return it
  if (audioBlob.type === targetFormat) {
    return audioBlob;
  }

  // Use AudioContext to convert format
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Create an offline context for rendering
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);
    
    const renderedBuffer = await offlineContext.startRendering();
    
    // Convert to desired format
    const mediaStreamDest = audioContext.createMediaStreamDestination();
    const sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = renderedBuffer;
    sourceNode.connect(mediaStreamDest);
    sourceNode.start(0);
    
    const mediaRecorder = new MediaRecorder(mediaStreamDest.stream, { mimeType: targetFormat });
    const chunks: Blob[] = [];
    
    return new Promise((resolve) => {
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const newBlob = new Blob(chunks, { type: targetFormat });
        resolve(newBlob);
      };
      
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), renderedBuffer.duration * 1000 + 100);
    });
  } catch (error) {
    console.error('Audio format conversion failed:', error);
    // If conversion fails, return the original blob
    return audioBlob;
  }
};
