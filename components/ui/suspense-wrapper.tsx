'use client';

import { Suspense, ReactNode } from 'react';
import { CardSkeleton, GallerySkeleton, ListSkeleton } from '@/components/ui/loading-skeleton';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: 'card' | 'gallery' | 'list' | 'custom' | ReactNode;
  fallbackProps?: {
    count?: number;
    columns?: number;
    hasImage?: boolean;
    hasAvatar?: boolean;
    lines?: number;
  };
}

function getFallbackComponent(type: string, props: any = {}) {
  switch (type) {
    case 'card':
      return (
        <CardSkeleton
          hasImage={props.hasImage}
          hasAvatar={props.hasAvatar}
          lines={props.lines || 3}
          shimmer={true}
        />
      );
    case 'gallery':
      return (
        <GallerySkeleton
          count={props.count || 8}
          columns={props.columns || 4}
          aspectRatio="square"
          shimmer={true}
        />
      );
    case 'list':
      return <ListSkeleton count={props.count || 5} hasAvatar={props.hasAvatar} shimmer={true} />;
    default:
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      );
  }
}

export function SuspenseWrapper({
  children,
  fallback = 'custom',
  fallbackProps = {},
}: SuspenseWrapperProps) {
  const fallbackComponent =
    typeof fallback === 'string' ? getFallbackComponent(fallback, fallbackProps) : fallback;

  return <Suspense fallback={fallbackComponent}>{children}</Suspense>;
}

// Specialized wrappers for common use cases
export function SuspenseGallery({
  children,
  count = 8,
  columns = 4,
}: {
  children: ReactNode;
  count?: number;
  columns?: number;
}) {
  return (
    <SuspenseWrapper fallback="gallery" fallbackProps={{ count, columns }}>
      {children}
    </SuspenseWrapper>
  );
}

export function SuspenseCard({
  children,
  hasImage,
  hasAvatar,
  lines,
}: {
  children: ReactNode;
  hasImage?: boolean;
  hasAvatar?: boolean;
  lines?: number;
}) {
  return (
    <SuspenseWrapper fallback="card" fallbackProps={{ hasImage, hasAvatar, lines }}>
      {children}
    </SuspenseWrapper>
  );
}

export function SuspenseList({
  children,
  count = 5,
  hasAvatar,
}: {
  children: ReactNode;
  count?: number;
  hasAvatar?: boolean;
}) {
  return (
    <SuspenseWrapper fallback="list" fallbackProps={{ count, hasAvatar }}>
      {children}
    </SuspenseWrapper>
  );
}
