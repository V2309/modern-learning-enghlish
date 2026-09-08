'use client';

import React, { useRef, useLayoutEffect, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight, Play, Quote, X } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface TestimonialItem {
  id: number;
  year: string;
  name: string;
  role: string;
  image: string;
  quote: string;
  hasVideo?: boolean;
  score?: string;
}

const testimonials: TestimonialItem[] = [
  {
    id: 1,
    year: '2026',
    name: 'FRASCO ZA GANA',
    role: 'IELTS Band 8.0 · London',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    quote: 'Phương pháp Dictation AI giúp tôi bóc tách từng nối âm và ngữ điệu bài Speaking Part 2-3 chuẩn xác tuyệt đối.',
    hasVideo: true,
  },
  {
    id: 2,
    year: '2026',
    name: 'KIMME YONG UEN',
    role: 'Lead Tech Engineer · Singapore',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
    quote: 'Shadowing mỗi ngày 20 phút xóa bỏ hoàn toàn phản xạ dịch ngầm khi thảo luận kỹ thuật với đối tác toàn cầu.',
  },
  {
    id: 3,
    year: '2026',
    name: 'NADRE SHEON',
    role: 'Business Consultant · Sydney',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
    hasVideo: true,
    quote: 'Khóa Tiếng Anh Doanh Nghiệp đã trang bị cho tôi kỹ năng đàm phán thương mại và thuyết trình xuất sắc.',
  },
  {
    id: 4,
    year: '2026',
    name: 'IRRAD BRAJST',
    role: 'Product Director · Berlin',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    quote: 'Hệ thống Spaced Repetition phân bố chu kỳ từ vựng cực kỳ thông minh, học từ nào nhớ từ đó trọn đời.',
  },
  {
    id: 5,
    year: '2026',
    name: 'ELENA ROSTOVA',
    role: 'IELTS 8.5 Academic · Cambridge',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop',
    hasVideo: true,
    quote: 'Luyện nghe chép học thuật giúp tôi đạt điểm tối đa Listening ngay trong lần thi đầu tiên.',
  },
  {
    id: 6,
    year: '2026',
    name: 'MARCUS CHEN',
    role: 'Data Scientist · Melbourne',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    quote: 'Độ chính xác AI nhận diện âm vị học vượt xa mọi ứng dụng học tiếng Anh tôi từng thử nghiệm trước đây.',
  },
  {
    id: 7,
    year: '2026',
    name: 'SOPHIE LAURENT',
    role: 'Marketing Lead · Paris',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop',
    hasVideo: true,
    quote: 'Giao diện sang trọng, phương pháp khoa học chuẩn CEFR mang lại động lực học tập bền bỉ mỗi ngày.',
  },
];

export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<TestimonialItem | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Editorial Typography Split & Reveal
      const titleLines = titleWrapperRef.current?.querySelectorAll('.split-line-inner');
      if (titleLines && titleLines.length > 0) {
        gsap.fromTo(
          titleLines,
          { yPercent: 105, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 2. Responsive MatchMedia for Pin & Scrub Horizontal Gallery
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        const track = trackRef.current;
        const container = containerRef.current;
        if (!track || !container) return;

        const totalScrollWidth = track.scrollWidth - window.innerWidth + 120;

        // Main Horizontal Track Scroll & Pin
        const scrollTween = gsap.to(track, {
          x: -totalScrollWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: () => `+=${totalScrollWidth * 1.15}`,
            pin: true,
            scrub: 1.2,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 3. Subtle Optical Parallax on Inner Media Images
        const mediaImages = track.querySelectorAll('.parallax-media-img');
        mediaImages.forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: 10, scale: 1.06 },
            {
              xPercent: -10,
              scale: 1.02,
              ease: 'none',
              scrollTrigger: {
                trigger: container,
                start: 'top top',
                end: () => `+=${totalScrollWidth * 1.15}`,
                scrub: 1.2,
              },
            }
          );
        });

        // 4. Subtle Card Scale & Depth Shift when passing center
        const cards = track.querySelectorAll('.testimonial-card');
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { scale: 0.98, opacity: 0.92 },
            {
              scale: 1.02,
              opacity: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                containerAnimation: scrollTween,
                start: 'left 80%',
                end: 'right 20%',
                scrub: true,
              },
            }
          );
        });
      });

      // Mobile / Tablet Fallback
      mm.add('(max-width: 1023px)', () => {
        const cards = trackRef.current?.querySelectorAll('.testimonial-card');
        if (cards) {
          gsap.fromTo(
            cards,
            { y: 25, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: trackRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (trackRef.current) {
      const scrollAmount = 320;
      trackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      ref={containerRef}
      className="w-full bg-white dark:bg-[#0f1115] border-b border-[#e5e7eb] dark:border-[#1f2937] relative flex flex-col overflow-hidden"
    >
      {/* ── Top Header Bar — 7/12 Title & 5/12 Controls Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[#e5e7eb] dark:border-[#1f2937]">

        {/* Left column (7/12): Main headline */}
        <div
          ref={titleWrapperRef}
          className="lg:col-span-7 px-8 sm:px-12 lg:px-16 py-10 lg:py-12 border-b lg:border-b-0 lg:border-r border-[#e5e7eb] dark:border-[#1f2937] flex flex-col justify-center bg-white dark:bg-[#0f1115]"
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9ca3af] dark:text-[#6b7280] block mb-2 font-semibold">
            04 · Đánh giá &amp; Trải nghiệm
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] dark:text-white tracking-tight leading-[1.1]">
            Học viên bứt phá
            <br />
            <span className="text-[#f28500]">phản xạ thực tế.</span>
          </h2>
        </div>

        {/* Right column (5/12): Descriptor text + Navigation controls */}
        <div className="lg:col-span-5 px-8 sm:px-12 lg:px-16 py-10 lg:py-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#fafafa] dark:bg-[#14171b]">
          <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#6b7280] dark:text-[#9ca3af] leading-relaxed max-w-xs">
            Trải nghiệm thực tế từ hơn 400,000+ học viên đạt chuẩn phản xạ tự nhiên &amp; bứt phá band điểm toàn cầu.
          </p>

          {/* Nav arrows */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleScroll('left')}
              aria-label="Đánh giá trước"
              className="w-11 h-11 border border-[#e5e7eb] dark:border-[#333638] bg-white dark:bg-[#16191d] hover:bg-[#f3f4f6] dark:hover:bg-[#22272e] active:scale-95 text-[#111827] dark:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              aria-label="Đánh giá tiếp theo"
              className="w-11 h-11 bg-[#f28500] hover:bg-[#e07500] active:scale-95 text-white transition-all flex items-center justify-center cursor-pointer shadow-xs"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* ── Carousel Slider of Square Portraits with Smooth Pin-and-Scrub ── */}
      <div className="w-full lg:h-[68vh] flex items-center overflow-hidden py-10 lg:py-0">
        <div
          ref={trackRef}
          className="flex gap-6 lg:gap-8 px-8 sm:px-12 lg:px-16 w-full lg:w-max overflow-x-auto lg:overflow-visible scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="testimonial-card w-[240px] sm:w-[270px] md:w-[290px] shrink-0 group cursor-pointer flex flex-col justify-between"
            >
              {/* Square Portrait Photo Container — Original layout with rich FX */}
              <div className="relative aspect-square w-full overflow-hidden bg-[#f3f4f6] dark:bg-[#1a1d21] mb-3 border border-[#e5e7eb]/80 dark:border-[#1f2937] shadow-xs">
                {/* Parallax Image Layer */}
                <div className="parallax-media-img relative w-[112%] h-[112%] -left-[6%] -top-[6%]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover object-center grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                    sizes="(max-width: 768px) 240px, 290px"
                  />
                </div>

                {/* Light Sweep Sheen */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none z-20" />

                {/* Technical Corner Crosshairs */}
                <span className="absolute top-2 left-2 text-[10px] font-mono text-white/50 pointer-events-none z-10">+</span>
                <span className="absolute top-2 right-2 text-[10px] font-mono text-white/50 pointer-events-none z-10">+</span>

                {/* Live Equalizer indicator for video */}
                {item.hasVideo && (
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2 py-0.5 bg-black/75 backdrop-blur-md border border-white/10 text-white">
                    <div className="flex items-end gap-[2px] h-2.5">
                      <span className="w-[2px] h-1.5 bg-[#f28500] animate-pulse" />
                      <span className="w-[2px] h-2.5 bg-[#f28500] animate-pulse delay-75" />
                      <span className="w-[2px] h-1 bg-[#f28500] animate-pulse delay-150" />
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-widest font-bold">Video</span>
                  </div>
                )}

                {/* Play video badge overlay (if applicable) */}
                {item.hasVideo && (
                  <div className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center text-[#111827] dark:text-white shadow-sm group-hover:scale-110 group-hover:bg-[#f28500] group-hover:text-white transition-all z-10">
                    <Play size={12} className="ml-0.5 fill-current" />
                  </div>
                )}

                {/* Hover quote preview badge */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <span className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center text-[10px]">
                    <Quote size={11} />
                  </span>
                </div>
              </div>

              {/* Metadata Footer: Year on left, Name on right — Exactly like original */}
              <div className="flex items-center justify-between text-[11px] font-mono tracking-widest pt-1">
                <span className="text-[#9ca3af] dark:text-[#6b7280]">{item.year}</span>
                <span className="font-bold uppercase text-[#111827] dark:text-white group-hover:text-[#f28500] transition-colors truncate max-w-[180px] text-right">
                  {item.name}
                </span>
              </div>

              {/* Short snippet — Exactly like original */}
              <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] line-clamp-2 mt-2 leading-relaxed font-sans">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Testimonial Detail Modal / Drawer ── */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#111418] border border-[#e5e7eb] dark:border-[#1f2937] max-w-lg w-full p-8 sm:p-10 relative shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 text-[#9ca3af] hover:text-[#111827] dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-16 h-16 shrink-0 overflow-hidden border border-[#e5e7eb] dark:border-[#333638]">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-wider text-[#111827] dark:text-white text-base">
                  {selectedItem.name}
                </h3>
                <p className="text-xs text-[#f28500] font-mono mt-0.5">{selectedItem.role}</p>
                <p className="text-[10px] text-[#9ca3af] font-mono">{selectedItem.year} · Học viên xác thực</p>
              </div>
            </div>

            <blockquote className="text-lg sm:text-xl font-normal text-[#111827] dark:text-white leading-relaxed border-l-2 border-[#f28500] pl-4 italic mb-6">
              &ldquo;{selectedItem.quote}&rdquo;
            </blockquote>

            <div className="pt-4 border-t border-[#e5e7eb] dark:border-[#1f2937] flex items-center justify-between text-xs text-[#9ca3af] font-mono">
              <span>PHƯƠNG PHÁP CHUẨN CEFR</span>
              <span className="text-[#f28500] font-bold">100% Phản Xạ Thực Chiến</span>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
