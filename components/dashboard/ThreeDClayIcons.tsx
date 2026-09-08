'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ClayIconProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

/**
 * 3D Clay Medal / Badge for Vocabulary (Duolingo Green #58CC02)
 */
export function ClayMedalDuo({ size = 48, className = '', animate = true }: ClayIconProps) {
  return (
    <motion.div
      animate={animate ? { y: [-2, 2, -2], rotate: [-2, 2, -2] } : undefined}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_8px_12px_rgba(70,163,2,0.45)] overflow-visible"
      >
        <defs>
          {/* Main 3D Spherical Clay Radial Gradient */}
          <radialGradient id="clayDuoLight" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#9bf03b" />
            <stop offset="40%" stopColor="#58CC02" />
            <stop offset="80%" stopColor="#46A302" />
            <stop offset="100%" stopColor="#327502" />
          </radialGradient>
          {/* Bevel Rim Lighting */}
          <linearGradient id="clayDuoRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#295d01" stopOpacity="0.6" />
          </linearGradient>
          {/* Star / Ribbon Gold Fill */}
          <linearGradient id="clayGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>

        {/* 3D Bottom Base Drop Shading */}
        <rect x="12" y="16" width="76" height="76" rx="26" fill="#2d6801" />

        {/* 3D Puffy Clay Squircle Body */}
        <rect
          x="12"
          y="10"
          width="76"
          height="76"
          rx="26"
          fill="url(#clayDuoLight)"
          stroke="url(#clayDuoRim)"
          strokeWidth="2.5"
        />

        {/* Glossy Top Specular Highlight Reflections */}
        <ellipse cx="44" cy="24" rx="20" ry="8" fill="#ffffff" fillOpacity="0.65" filter="blur(1.5px)" transform="rotate(-10 44 24)" />
        <circle cx="28" cy="38" r="4" fill="#ffffff" fillOpacity="0.5" filter="blur(1px)" />

        {/* 3D Embossed Medal / Ribbon Emblem */}
        <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))">
          {/* Ribbon tails */}
          <path d="M 40 52 L 32 74 L 42 68 L 50 74 L 46 54 Z" fill="#eab308" />
          <path d="M 60 52 L 68 74 L 58 68 L 50 74 L 54 54 Z" fill="#ca8a04" />
          {/* Center Rosette Medal */}
          <circle cx="50" cy="44" r="16" fill="url(#clayGold)" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="50" cy="44" r="11" fill="#fef08a" fillOpacity="0.9" />
          {/* Star Icon in Center */}
          <path
            d="M 50 36 L 52.5 41.5 L 58.5 42.2 L 54 46.2 L 55.2 52 L 50 49 L 44.8 52 L 46 46.2 L 41.5 42.2 L 47.5 41.5 Z"
            fill="#a16207"
          />
        </g>
      </svg>
    </motion.div>
  );
}

/**
 * 3D Clay Book / Cap for Lessons (Coral Brand #f17463)
 */
export function ClayBookBrand({ size = 48, className = '', animate = true }: ClayIconProps) {
  return (
    <motion.div
      animate={animate ? { y: [-2, 2, -2], rotate: [2, -2, 2] } : undefined}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_8px_12px_rgba(241,116,99,0.45)] overflow-visible"
      >
        <defs>
          <radialGradient id="clayBrandLight" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffa599" />
            <stop offset="40%" stopColor="#f17463" />
            <stop offset="80%" stopColor="#d95847" />
            <stop offset="100%" stopColor="#a33425" />
          </radialGradient>
          <linearGradient id="clayBrandRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#802115" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* 3D Bottom Base Drop Shading */}
        <rect x="12" y="16" width="76" height="76" rx="26" fill="#802115" />

        {/* 3D Puffy Clay Squircle Body */}
        <rect
          x="12"
          y="10"
          width="76"
          height="76"
          rx="26"
          fill="url(#clayBrandLight)"
          stroke="url(#clayBrandRim)"
          strokeWidth="2.5"
        />

        {/* Glossy Top Specular Highlight */}
        <ellipse cx="44" cy="24" rx="20" ry="8" fill="#ffffff" fillOpacity="0.65" filter="blur(1.5px)" transform="rotate(-10 44 24)" />

        {/* 3D Book Icon */}
        <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))">
          <path
            d="M 32 36 C 38 34, 46 36, 50 40 C 54 36, 62 34, 68 36 L 68 62 C 62 60, 54 62, 50 66 C 46 62, 38 60, 32 62 Z"
            fill="#ffffff"
            stroke="#fed7aa"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M 50 40 L 50 66" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 36 44 C 40 42, 44 43, 47 45" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 36 50 C 40 48, 44 49, 47 51" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 53 45 C 56 43, 60 42, 64 44" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 53 51 C 56 49, 60 48, 64 50" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </svg>
    </motion.div>
  );
}

/**
 * 3D Clay Task Checkbox for Todo (Sky Blue #0ea5e9)
 */
export function ClayTodoSky({ size = 48, className = '', animate = true }: ClayIconProps) {
  return (
    <motion.div
      animate={animate ? { y: [-2, 2, -2], rotate: [-2, 2, -2] } : undefined}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_8px_12px_rgba(14,165,233,0.45)] overflow-visible"
      >
        <defs>
          <radialGradient id="claySkyLight" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="40%" stopColor="#0ea5e9" />
            <stop offset="80%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </radialGradient>
          <linearGradient id="claySkyRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#082f49" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* 3D Bottom Base Drop Shading */}
        <rect x="12" y="16" width="76" height="76" rx="26" fill="#0369a1" />

        {/* 3D Puffy Clay Squircle Body */}
        <rect
          x="12"
          y="10"
          width="76"
          height="76"
          rx="26"
          fill="url(#claySkyLight)"
          stroke="url(#claySkyRim)"
          strokeWidth="2.5"
        />

        {/* Glossy Top Specular Highlight */}
        <ellipse cx="44" cy="24" rx="20" ry="8" fill="#ffffff" fillOpacity="0.65" filter="blur(1.5px)" transform="rotate(-10 44 24)" />

        {/* 3D Checkmark Shield Icon */}
        <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))">
          <circle cx="50" cy="48" r="18" fill="#ffffff" />
          <path
            d="M 40 48 L 47 55 L 61 40"
            fill="none"
            stroke="#0284c7"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </motion.div>
  );
}
