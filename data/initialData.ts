import { Page, PageCover } from '../types/notion';

export const COVER_PRESETS: { name: string; value: string; type: PageCover['type'] }[] = [
  { name: 'Warm Dawn', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', type: 'gradient' },
  { name: 'Sunset Amber', value: 'linear-gradient(to right, #ff7e5f, #feb47b)', type: 'gradient' },
  { name: 'Sage Mist', value: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', type: 'gradient' },
  { name: 'Cosmic Ocean', value: 'linear-gradient(to right, #243949 0%, #517fa4 100%)', type: 'gradient' },
  { name: 'Lavender Dream', value: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)', type: 'gradient' },
  { name: 'Deep Slate', value: 'linear-gradient(to top, #1e293b 0%, #334155 100%)', type: 'gradient' },
  { name: 'Emerald Canopy', value: 'linear-gradient(to right, #0ba360, #3cba92)', type: 'gradient' },
  { name: 'Nordic Fog', value: 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)', type: 'gradient' },
  { name: 'Warm Terracotta', value: 'linear-gradient(to right, #f857a6, #ff5858)', type: 'gradient' },
  { name: 'Minimal Charcoal', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)', type: 'gradient' },
];

/**
 * Cleaned: All workspace pages are now loaded and synchronized directly from the real PostgreSQL database.
 */
export const INITIAL_PAGES: Page[] = [];
