
'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScrollAnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animationClassName?: string; // e.g., 'animate-fadeInUp'
  threshold?: number;
  triggerOnce?: boolean;
}

export function ScrollAnimatedSection({
  children,
  className,
  animationClassName = 'animate-fadeInUp',
  threshold = 0.1,
  triggerOnce = true,
}: ScrollAnimatedSectionProps) {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentRef = sectionRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.unobserve(currentRef);
          }
        } else {
          if (!triggerOnce) {
            setIsInView(false); // Reset if not triggerOnce
          }
        }
      },
      { threshold }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [threshold, triggerOnce, animationClassName]); // animationClassName added to deps if it affects observer logic, though it usually doesn't

  return (
    <div
      ref={sectionRef}
      className={cn(
        className,
        // Start with opacity-0 if the animation itself doesn't handle the initial state.
        // The animation class (e.g., animate-fadeInUp) should handle the transition to opacity-1.
        isInView ? animationClassName : 'opacity-0' 
      )}
    >
      {children}
    </div>
  );
}
