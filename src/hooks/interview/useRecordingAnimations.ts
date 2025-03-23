
export function useRecordingAnimations() {
  // Animation variants for the recording indicator
  const pulseVariants = {
    recording: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    idle: {
      scale: 1,
      opacity: 1
    }
  };

  // Animation variants for the wave circles
  const waveVariants = {
    recording: (i: number) => ({
      scale: [1, 1.5, 1],
      opacity: [0, 0.3, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        delay: i * 0.2,
        ease: "easeInOut"
      }
    }),
    idle: {
      scale: 0,
      opacity: 0
    }
  };

  return {
    pulseVariants,
    waveVariants
  };
}
