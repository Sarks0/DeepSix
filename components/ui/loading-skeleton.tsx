'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'rounded' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
  shimmer?: boolean;
  delay?: number;
}

type SafeHTMLProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragStart'
  | 'onDragEnter'
  | 'onDragExit'
  | 'onDragLeave'
  | 'onDragOver'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
  | 'onTransitionEnd'
>;

export function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  shimmer = true,
  delay = 0,
  ...props
}: SkeletonProps & SafeHTMLProps) {
  const baseClasses = 'bg-gray-800 animate-pulse';

  const variantClasses = {
    default: 'rounded',
    rounded: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded-sm h-4',
  };

  const shimmerClasses = shimmer
    ? 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-[shimmer_2s_infinite]'
    : '';

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.2 }}
      className={cn(baseClasses, variantClasses[variant], shimmerClasses, className)}
      style={style}
      {...props}
    />
  );
}

// Gallery grid skeleton
interface GallerySkeletonProps {
  count?: number;
  columns?: number;
  aspectRatio?: 'square' | 'video' | 'photo';
  shimmer?: boolean;
}

export function GallerySkeleton({
  count = 8,
  columns = 4,
  aspectRatio = 'square',
  shimmer = true,
}: GallerySkeletonProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-[4/3]',
  };

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridClasses[columns as keyof typeof gridClasses])}>
      {[...Array(count)].map((_, i) => (
        <Skeleton
          key={i}
          className={aspectClasses[aspectRatio]}
          shimmer={shimmer}
          delay={i * 0.05}
        />
      ))}
    </div>
  );
}

// Card skeleton
interface CardSkeletonProps {
  hasImage?: boolean;
  hasAvatar?: boolean;
  lines?: number;
  shimmer?: boolean;
}

export function CardSkeleton({
  hasImage = false,
  hasAvatar = false,
  lines = 3,
  shimmer = true,
}: CardSkeletonProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
      {hasImage && <Skeleton className="aspect-video mb-4" shimmer={shimmer} />}

      <div className="space-y-3">
        {hasAvatar && (
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" width={40} height={40} shimmer={shimmer} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="w-3/4" shimmer={shimmer} />
              <Skeleton variant="text" className="w-1/2" shimmer={shimmer} />
            </div>
          </div>
        )}

        {[...Array(lines)].map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            className={i === lines - 1 ? 'w-2/3' : 'w-full'}
            shimmer={shimmer}
            delay={i * 0.1}
          />
        ))}
      </div>
    </div>
  );
}

// List item skeleton
interface ListSkeletonProps {
  count?: number;
  hasAvatar?: boolean;
  shimmer?: boolean;
}

export function ListSkeleton({ count = 5, hasAvatar = false, shimmer = true }: ListSkeletonProps) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 bg-gray-900/30"
        >
          {hasAvatar && <Skeleton variant="circle" width={32} height={32} shimmer={shimmer} />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-3/4" shimmer={shimmer} delay={i * 0.05} />
            <Skeleton variant="text" className="w-1/2" shimmer={shimmer} delay={i * 0.05 + 0.1} />
          </div>
          <Skeleton width={60} height={20} shimmer={shimmer} delay={i * 0.05} />
        </div>
      ))}
    </div>
  );
}

// Status bar skeleton
interface StatusBarSkeletonProps {
  count?: number;
  shimmer?: boolean;
}

export function StatusBarSkeleton({ count = 4, shimmer = true }: StatusBarSkeletonProps) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton variant="text" className="w-1/3" shimmer={shimmer} delay={i * 0.1} />
            <Skeleton variant="text" className="w-1/4" shimmer={shimmer} delay={i * 0.1 + 0.05} />
          </div>
          <Skeleton height={8} className="rounded-full" shimmer={shimmer} delay={i * 0.1 + 0.1} />
        </div>
      ))}
    </div>
  );
}
