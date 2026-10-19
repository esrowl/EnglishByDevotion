import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speechService } from '../../services/speech';

interface AudioButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  rate?: number;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  className = '',
  size = 'md',
  rate = 0.9,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      speechService.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    await speechService.speak(text, rate);
    setIsPlaying(false);
  };

  const sizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-1.5 text-sm',
    lg: 'p-2.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={`Listen to pronunciation of "${text}"`}
      aria-label={`Pronounce ${text}`}
      className={`inline-flex items-center justify-center rounded-none transition-all duration-150 ${
        isPlaying
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-900/40 animate-pulse'
          : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/80 border border-zinc-700/60'
      } ${sizeClasses[size]} ${className}`}
    >
      {isPlaying ? (
        <VolumeX className={`${iconSizes[size]} text-emerald-400`} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
    </button>
  );
};
