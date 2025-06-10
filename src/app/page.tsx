'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Paintbrush, Palette, Users, Circle, Square, Triangle, Plus, Minus, X } from 'lucide-react';

interface DataPoint {
  id: number;
  title: string;
  description: string;
  x: number;
  y: number;
  size: number;
  connections: number[];
}

const dataPoints: DataPoint[] = [
  {
    id: 1,
    title: "Natural Pigments",
    description: "Earth-derived colors from minerals and soils",
    x: 30,
    y: 40,
    size: 80,
    connections: [2, 4]
  },
  {
    id: 2,
    title: "Plant Dyes",
    description: "Colors extracted from leaves, flowers, and roots",
    x: 60,
    y: 30,
    size: 100,
    connections: [1, 3]
  },
  {
    id: 3,
    title: "Traditional Methods",
    description: "Ancient techniques of color creation",
    x: 70,
    y: 60,
    size: 90,
    connections: [2, 4]
  },
  {
    id: 4,
    title: "Modern Applications",
    description: "Contemporary uses of natural colors",
    x: 40,
    y: 70,
    size: 70,
    connections: [1, 3]
  }
];

const BackgroundPattern = () => {
  const [patterns, setPatterns] = useState<Array<{
    left: number,
    top: number,
    rotation: number,
    scale: number,
    shape: string,
    opacity: number
  }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const newPatterns = Array.from({ length: 30 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 1.5,
      shape: ['circle', 'square', 'triangle', 'line'][Math.floor(Math.random() * 4)],
      opacity: 0.05 + Math.random() * 0.15
    }));
    setPatterns(newPatterns);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full">
        {patterns.map((pattern, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: pattern.opacity,
              scale: pattern.scale,
              rotate: pattern.rotation
            }}
            transition={{ 
              duration: 1,
              delay: i * 0.1,
              ease: "easeOut"
            }}
            className="absolute"
            style={{
              left: `${pattern.left}%`,
              top: `${pattern.top}%`,
            }}
          >
            {pattern.shape === 'circle' && (
              <div className="w-12 h-12 border-2 border-[#2C3E50] rounded-full" />
            )}
            {pattern.shape === 'square' && (
              <div className="w-12 h-12 border-2 border-[#2C3E50]" />
            )}
            {pattern.shape === 'triangle' && (
              <div className="w-0 h-0 border-l-[24px] border-r-[24px] border-b-[40px] border-[#2C3E50]" style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent' }} />
            )}
            {pattern.shape === 'line' && (
              <div className="w-16 h-0.5 bg-[#2C3E50]" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const DataVisualization = () => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 500;
  
  // Convert percentage to absolute coordinates
  const toAbsoluteX = (percentage: number) => (percentage / 100) * SVG_WIDTH;
  const toAbsoluteY = (percentage: number) => (percentage / 100) * SVG_HEIGHT;

  // Generate consistent control points for organic grid lines
  const gridControlPoints = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      cp1x: 100,
      cp1y: (i + 1) * 60 + 5,
      cp2x: 500,
      cp2y: (i + 1) * 60 - 5
    }));
  }, []);

  // Generate consistent offsets for connection curves
  const connectionOffsets = useMemo(() => {
    const offsets = new Map();
    dataPoints.forEach(point => {
      point.connections.forEach(connId => {
        const key = `${Math.min(point.id, connId)}-${Math.max(point.id, connId)}`;
        if (!offsets.has(key)) {
          offsets.set(key, {
            x: 10,
            y: 10
          });
        }
      });
    });
    return offsets;
  }, []);

  return (
    <div className="relative w-full max-w-5xl h-[500px] mx-auto mt-16">
      <motion.svg 
        className="w-full h-full"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {/* Organic Grid Lines */}
        {gridControlPoints.map((points, i) => (
          <motion.path
            key={`grid-h-${i}`}
            d={`M 0 ${(i + 1) * 60} C ${points.cp1x} ${points.cp1y}, ${points.cp2x} ${points.cp2y}, ${SVG_WIDTH} ${(i + 1) * 60}`}
            stroke="#2C3E50"
            strokeWidth="0.5"
            strokeDasharray="4"
            fill="none"
            opacity="0.1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: i * 0.2 }}
          />
        ))}

        {/* Connection Lines with hand-drawn effect */}
        {dataPoints.map(point => 
          point.connections.map(connId => {
            const connPoint = dataPoints.find(p => p.id === connId);
            if (!connPoint) return null;
            
            const key = `${Math.min(point.id, connId)}-${Math.max(point.id, connId)}`;
            const offset = connectionOffsets.get(key);
            
            const x1 = toAbsoluteX(point.x);
            const y1 = toAbsoluteY(point.y);
            const x2 = toAbsoluteX(connPoint.x);
            const y2 = toAbsoluteY(connPoint.y);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            return (
              <motion.path
                key={`${point.id}-${connId}`}
                d={`M ${x1} ${y1} Q ${midX + offset.x} ${midY + offset.y} ${x2} ${y2}`}
                stroke={hoveredPoint === point.id || hoveredPoint === connId ? '#D4A373' : '#2C3E50'}
                strokeWidth={hoveredPoint === point.id || hoveredPoint === connId ? '2' : '1'}
                strokeDasharray="4 2"
                fill="none"
                opacity={hoveredPoint === point.id || hoveredPoint === connId ? '0.8' : '0.2'}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
              />
            );
          })
        )}

        {/* Data Points */}
        {dataPoints.map(point => (
          <g key={point.id}>
            <motion.circle
              cx={toAbsoluteX(point.x)}
              cy={toAbsoluteY(point.y)}
              r={point.size / 4}
              fill={hoveredPoint === point.id ? '#D4A373' : '#E9EDC9'}
              stroke="#2C3E50"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              onMouseEnter={() => setHoveredPoint(point.id)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer"
            />
            <motion.text
              x={toAbsoluteX(point.x)}
              y={toAbsoluteY(point.y + 8)}
              textAnchor="middle"
              className="font-mono text-xs fill-[#2C3E50]"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredPoint === point.id ? 1 : 0 }}
            >
              {point.title}
            </motion.text>
          </g>
        ))}
      </motion.svg>
    </div>
  );
};

export default function HomePage() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  return (
    <div className="min-h-screen bg-[#FFFCF5] overflow-hidden">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        <BackgroundPattern />
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={controls}
          className="text-center z-10 px-4 max-w-6xl mx-auto"
        >
          <div className="mb-8">
          <br></br>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 mx-auto border-2 border-[#2C3E50] relative mb-6 bg-[#E3D5CA] transform rotate-3"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Palette className="w-12 h-12 text-[#2C3E50]" />
              </div>
              <div className="absolute -inset-1 border-2 border-[#2C3E50] opacity-50 transform -rotate-3" />
            </motion.div>
            <motion.h1 
              className="text-6xl md:text-8xl font-serif text-[#2C3E50] mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              CAreScape
            </motion.h1>
            <motion.h2 
              className="text-xl md:text-2xl font-serif text-[#2C3E50] mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Caring Archive of
              <br />
              Landscape Colors
            </motion.h2>
          </div>

          <motion.div 
            className="max-w-3xl mx-auto mb-8 space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-lg md:text-xl font-mono text-[#2C3E50] leading-relaxed">
              A visual journey through natural colors and their stories, connecting place, process, and pigment.
            </p>
            <p className="font-mono text-sm text-[#2C3E50] leading-relaxed">
              Every color has a story. From the earth beneath our feet to the plants that surround us, nature provides an endless palette of possibilities. Join us in exploring and documenting these chromatic narratives.
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-col md:flex-row items-center justify-center gap-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link
              href="/colors"
              className="inline-block bg-[#D4A373] text-[#2C3E50] px-8 py-4 font-mono text-sm hover:bg-[#2C3E50] hover:text-[#FFFCF5] border-2 border-[#2C3E50] transition-colors relative group transform hover:rotate-1"
            >
              <span>Explore Colors</span>
              <div className="absolute top-0 left-0 w-full h-full border border-[#2C3E50] -m-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform -rotate-1" />
            </Link>
            <Link
              href="/map"
              className="inline-block bg-[#E9EDC9] text-[#2C3E50] px-8 py-4 font-mono text-sm hover:bg-[#2C3E50] hover:text-[#FFFCF5] border-2 border-[#2C3E50] transition-colors relative group transform hover:-rotate-1"
            >
              <span>View Map</span>
              <div className="absolute top-0 left-0 w-full h-full border border-[#2C3E50] -m-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform rotate-1" />
            </Link>
          </motion.div>

          <DataVisualization />
        </motion.div>
      </div>

      {/* Process Section */}
      <div className="py-24 px-4 bg-[#FFFCF5] border-b-2 border-[#2C3E50] relative">
        <BackgroundPattern />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-16 max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-serif text-[#2C3E50] mb-8">Color Creation Process</h2>
            <p className="font-mono text-sm text-[#2C3E50] leading-relaxed">
              Every color in our collection follows a meticulous documentation process. From initial discovery to final application, we track each step to preserve traditional knowledge and inspire new creations.
            </p>
          </div>
          <div className="relative w-full h-[400px]">
            <Image
              src="/images/art/lupi-process.svg"
              alt="Color creation process visualization"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-2 border-[#2C3E50] p-8 bg-[#CCD5AE] relative group"
            >
              <div className="absolute -inset-1 border-2 border-[#2C3E50] opacity-0 group-hover:opacity-100 transition-opacity" />
              <Paintbrush className="w-12 h-12 text-[#2C3E50] mb-6" />
              <h3 className="font-serif text-2xl text-[#2C3E50] mb-4">Natural Colors</h3>
              <p className="font-mono text-sm text-[#2C3E50]">
                Discover and document colors derived from natural sources, preserving traditional knowledge and techniques.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="border-2 border-[#2C3E50] p-8 bg-[#E9EDC9] relative group"
            >
              <div className="absolute -inset-1 border-2 border-[#2C3E50] opacity-0 group-hover:opacity-100 transition-opacity" />
              <Users className="w-12 h-12 text-[#2C3E50] mb-6" />
              <h3 className="font-serif text-2xl text-[#2C3E50] mb-4">Community</h3>
              <p className="font-mono text-sm text-[#2C3E50]">
                Join a global community of color enthusiasts sharing their discoveries and knowledge.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="border-2 border-[#2C3E50] p-8 bg-[#FEFAE0] relative group"
            >
              <div className="absolute -inset-1 border-2 border-[#2C3E50] opacity-0 group-hover:opacity-100 transition-opacity" />
              <Palette className="w-12 h-12 text-[#2C3E50] mb-6" />
              <h3 className="font-serif text-2xl text-[#2C3E50] mb-4">Visual Stories</h3>
              <p className="font-mono text-sm text-[#2C3E50]">
                Experience color through beautiful visualizations and immersive storytelling.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
