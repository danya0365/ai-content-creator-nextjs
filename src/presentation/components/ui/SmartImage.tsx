'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface SmartImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackEmoji?: string;
  containerClassName?: string;
  emojiClassName?: string;
}

/**
 * SmartImage Component
 * 
 * A wrapper around Next.js Image that gracefully falls back to an emoji
 * if the image fails to load or no src is provided.
 * It also automatically bypasses optimization for local development IPs.
 */
export function SmartImage({
  src,
  fallbackEmoji = '🎨',
  containerClassName = 'w-full h-full flex items-center justify-center',
  emojiClassName = 'text-4xl group-hover:scale-125 transition-transform duration-500',
  alt = 'Image',
  ...props
}: SmartImageProps) {
  const [imgError, setImgError] = useState(false);

  // Determine if we need to skip optimization to avoid SSRF restrictions on localhost
  const shouldUnoptimize = src ? (
    src.includes('127.0.0.1') || 
    src.includes('localhost') || 
    src.includes('api.dicebear.com') || 
    src.endsWith('.svg')
  ) : false;

  if (!src || imgError) {
    return (
      <div className={containerClassName}>
        <span className={emojiClassName}>
          {fallbackEmoji}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={shouldUnoptimize}
      onError={() => setImgError(true)}
      {...props}
    />
  );
}
