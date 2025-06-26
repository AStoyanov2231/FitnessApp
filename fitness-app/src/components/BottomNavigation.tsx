'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BottomNavigation() {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'stretching' | 'retracting'>('idle');

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      )
    },
    {
      name: 'Workouts',
      href: '/workouts',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
        </svg>
      )
    },
    {
      name: 'Metrics',
      href: '/metrics',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v4h8V3h-8z"/>
        </svg>
      )
    }
  ];

  // Update active index when pathname changes
  useEffect(() => {
    const newIndex = navItems.findIndex(item => item.href === pathname);
    if (newIndex !== -1 && newIndex !== activeIndex) {
      setPreviousIndex(activeIndex);
      setIsAnimating(true);
      setAnimationPhase('stretching');
      
      // Phase 1: Stretch towards target (200ms for snappier animation)
      const stretchTimer = setTimeout(() => {
        setActiveIndex(newIndex);
        setAnimationPhase('retracting');
        
        // Phase 2: Retract from original position (150ms)
        const retractTimer = setTimeout(() => {
          setAnimationPhase('idle');
          setIsAnimating(false);
        }, 150);
        
        return () => clearTimeout(retractTimer);
      }, 200);
      
      return () => clearTimeout(stretchTimer);
    }
  }, [pathname, activeIndex, navItems]);

  const handleNavClick = (index: number) => {
    if (index !== activeIndex) {
      setPreviousIndex(activeIndex);
      setIsAnimating(true);
      setAnimationPhase('stretching');
      
      // Phase 1: Stretch towards target
      const stretchTimer = setTimeout(() => {
        setActiveIndex(index);
        setAnimationPhase('retracting');
        
        // Phase 2: Retract from original position
        const retractTimer = setTimeout(() => {
          setAnimationPhase('idle');
          setIsAnimating(false);
        }, 150);
        
        return () => clearTimeout(retractTimer);
      }, 200);
    }
  };

  // Calculate animation properties
  const getIndicatorStyle = () => {
    const baseTransform = activeIndex * 72 - (navItems.length - 1) * 36;
    
    switch (animationPhase) {
      case 'stretching': {
        // Use previousIndex for stretching calculation
        const targetIndex = navItems.findIndex(item => item.href === pathname) !== -1 
          ? navItems.findIndex(item => item.href === pathname) 
          : activeIndex;
        const startIndex = previousIndex;
        const distance = Math.abs(targetIndex - startIndex) * 72;
        const direction = targetIndex > startIndex ? 1 : -1;
        
        // Use much more subtle stretching for a smoother look
        const maxStretch = Math.min(distance * 0.4, 40); // Much smaller stretch - max 40px
        const stretchWidth = 48 + maxStretch;
        
        // Use more subtle border radius changes for a sleeker look
        const borderRadius = direction > 0 
          ? '50% 35% 35% 50% / 50% 50% 50% 50%' // Subtle rightward stretch
          : '35% 50% 50% 35% / 50% 50% 50% 50%'; // Subtle leftward stretch
        
        // Calculate position - move smoothly towards target
        const originalTransform = startIndex * 72 - (navItems.length - 1) * 36;
        const targetTransform = targetIndex * 72 - (navItems.length - 1) * 36;
        const moveAmount = (targetTransform - originalTransform) * 0.2; // Reduced movement
        
        return {
          width: `${stretchWidth}px`,
          height: '48px',
          borderRadius: borderRadius,
          transform: direction > 0 
            ? `translateX(${originalTransform + moveAmount}px)` 
            : `translateX(${originalTransform + moveAmount - (stretchWidth - 48)}px)`,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        };
      }
      case 'retracting': {
        return {
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          transform: `translateX(${baseTransform}px)`,
          transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        };
      }
      default: {
        return {
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          transform: `translateX(${baseTransform}px)`,
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        };
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100
    }}>
      {/* Navigation Container */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        background: 'rgba(104, 104, 104, 0.29)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px',
        padding: '12px 24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        minWidth: '280px',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Animated Background Indicator */}
        <div
          style={{
            position: 'absolute',
            background: 'linear-gradient(135deg, #C4FF4A 0%, #D4FF5A 100%)',
            zIndex: 1,
            ...getIndicatorStyle()
          }}
        />
        
        {navItems.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => handleNavClick(index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                color: isActive ? '#1A1A1A' : '#9CA3AF',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                position: 'relative',
                zIndex: 2
              }}
            >
              {item.icon}
            </Link>
          );
        })}
      </div>
    </div>
  );
} 