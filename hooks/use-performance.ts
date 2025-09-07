'use client';

import { useEffect, useRef, useState } from 'react';

// Performance metrics interface
interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  renderTime: number;
  apiResponseTimes: Record<string, number>;
  errorCount: number;
}

// Hook for monitoring FPS
export function useFPS() {
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrame = useRef<number>();

  useEffect(() => {
    const calculateFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime.current;

      if (deltaTime >= 1000) {
        const currentFPS = Math.round((frameCount.current * 1000) / deltaTime);
        setFps(currentFPS);
        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationFrame.current = requestAnimationFrame(calculateFPS);
    };

    animationFrame.current = requestAnimationFrame(calculateFPS);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return fps;
}

// Hook for monitoring memory usage
export function useMemoryUsage() {
  const [memoryUsage, setMemoryUsage] = useState(0);

  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        // @ts-ignore - performance.memory is not in TypeScript types but exists in Chrome
        const memory = (performance as any).memory;
        const usedMemory = (memory as any).usedJSHeapSize / 1024 / 1024; // Convert to MB
        setMemoryUsage(Math.round(usedMemory));
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
}

// Hook for measuring API response times
export function useAPIPerformance() {
  const [responseTimes, setResponseTimes] = useState<Record<string, number>>({});
  const [averageResponseTime, setAverageResponseTime] = useState(0);

  const measureAPICall = async (url: string, apiCall: () => Promise<any>) => {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      setResponseTimes((prev) => {
        const newTimes = { ...prev, [url]: responseTime };
        const times = Object.values(newTimes);
        const average = times.reduce((sum, time) => sum + time, 0) / times.length;
        setAverageResponseTime(Math.round(average));
        return newTimes;
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      setResponseTimes((prev) => ({ ...prev, [url + '_error']: responseTime }));
      throw error;
    }
  };

  return { responseTimes, averageResponseTime, measureAPICall };
}

// Hook for measuring page load performance
export function usePagePerformance() {
  const [metrics, setMetrics] = useState<{
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
  } | null>(null);

  useEffect(() => {
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      let lcp = 0;
      let cls = 0;
      let fid = 0;

      // Measure LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Measure CLS (Cumulative Layout Shift)
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Measure FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          fid = entry.processingStart - entry.startTime;
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find((entry) => entry.name === 'first-paint')?.startTime || 0;
      const firstContentfulPaint =
        paintEntries.find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0;

      setMetrics({
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstPaint,
        firstContentfulPaint,
        largestContentfulPaint: lcp,
        cumulativeLayoutShift: cls,
        firstInputDelay: fid,
      });

      // Clean up observers after 10 seconds
      setTimeout(() => {
        lcpObserver.disconnect();
        clsObserver.disconnect();
        fidObserver.disconnect();
      }, 10000);
    };

    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  return metrics;
}

// Hook for comprehensive performance monitoring
export function usePerformanceMonitoring() {
  const fps = useFPS();
  const memoryUsage = useMemoryUsage();
  const pageMetrics = usePagePerformance();
  const { responseTimes, averageResponseTime, measureAPICall } = useAPIPerformance();
  const [errorCount, setErrorCount] = useState(0);

  // Error boundary tracking
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      setErrorCount((prev) => prev + 1);
      console.warn('Performance Monitor - JS Error:', event.error);
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      setErrorCount((prev) => prev + 1);
      console.warn('Performance Monitor - Unhandled Promise Rejection:', event.reason);
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    };
  }, []);

  const performanceMetrics: PerformanceMetrics = {
    fps,
    memoryUsage,
    loadTime: pageMetrics?.loadTime || 0,
    renderTime: pageMetrics?.firstContentfulPaint || 0,
    apiResponseTimes: responseTimes,
    errorCount,
  };

  const getPerformanceGrade = (): 'A' | 'B' | 'C' | 'D' | 'F' => {
    let score = 100;

    // FPS scoring (60fps = perfect)
    if (fps < 30) score -= 30;
    else if (fps < 45) score -= 15;
    else if (fps < 55) score -= 5;

    // Memory usage scoring
    if (memoryUsage > 100) score -= 20;
    else if (memoryUsage > 50) score -= 10;

    // Load time scoring
    if (pageMetrics?.loadTime) {
      if (pageMetrics.loadTime > 5000) score -= 25;
      else if (pageMetrics.loadTime > 3000) score -= 15;
      else if (pageMetrics.loadTime > 1000) score -= 5;
    }

    // API response time scoring
    if (averageResponseTime > 2000) score -= 20;
    else if (averageResponseTime > 1000) score -= 10;
    else if (averageResponseTime > 500) score -= 5;

    // Error penalty
    score -= errorCount * 5;

    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return {
    metrics: performanceMetrics,
    grade: getPerformanceGrade(),
    measureAPICall,
    isPerformant: fps >= 55 && memoryUsage < 50 && averageResponseTime < 500,
    warnings: {
      lowFPS: fps < 30,
      highMemory: memoryUsage > 100,
      slowAPI: averageResponseTime > 1000,
      hasErrors: errorCount > 0,
    },
  };
}
