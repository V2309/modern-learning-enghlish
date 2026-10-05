import React from 'react';
import {
  BookOpen,
  Rocket,
  Target,
  Brain,
  Zap,
  FileText,
  Building2,
  Calendar,
  CheckSquare,
  Sparkles,
  Code2,
  Users,
  Palette,
  Lightbulb,
  Flame,
  Folder,
  Bookmark,
  Bug,
  Kanban,
  Heart,
  Compass,
  Coffee,
  Sun,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const LUCIDE_ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number | string }>> = {
  // Named keys
  BookOpen,
  Rocket,
  Target,
  Brain,
  Zap,
  FileText,
  Building2,
  Calendar,
  CheckSquare,
  Sparkles,
  Code2,
  Users,
  Palette,
  Lightbulb,
  Flame,
  Folder,
  Bookmark,
  Bug,
  Kanban,
  Heart,
  Compass,
  Coffee,
  Sun,
  Layers,
  HelpCircle,

  // Fallback mappings from emojis to Lucide icons
  '📔': BookOpen,
  '📖': BookOpen,
  '📚': BookOpen,
  '🚀': Rocket,
  '🎯': Target,
  '🧠': Brain,
  '⚡': Zap,
  '📄': FileText,
  '📝': FileText,
  '📋': FileText,
  '🏛️': Building2,
  '📅': Calendar,
  '💪': CheckSquare,
  '✅': CheckSquare,
  '✨': Sparkles,
  '💻': Code2,
  '👥': Users,
  '🎨': Palette,
  '💡': Lightbulb,
  '🔥': Flame,
  '📁': Folder,
  '🏷️': Bookmark,
  '🐛': Bug,
  '📊': Kanban,
  '❤️': Heart,
  '🧭': Compass,
  '☕': Coffee,
  '☀️': Sun,
  '🔮': Layers,
  '👋': Users,
  '⌨️': Code2,
};

export const POPULAR_LUCIDE_ICONS = [
  { name: 'BookOpen', label: 'Journal & Book', icon: BookOpen },
  { name: 'FileText', label: 'Document', icon: FileText },
  { name: 'Target', label: 'Goal & Target', icon: Target },
  { name: 'Rocket', label: 'Product & Launch', icon: Rocket },
  { name: 'Brain', label: 'Knowledge & Ideas', icon: Brain },
  { name: 'Zap', label: 'Habits & Fast', icon: Zap },
  { name: 'CheckSquare', label: 'To-do & Task', icon: CheckSquare },
  { name: 'Calendar', label: 'Schedule & Date', icon: Calendar },
  { name: 'Building2', label: 'Company & Team', icon: Building2 },
  { name: 'Code2', label: 'Engineering', icon: Code2 },
  { name: 'Sparkles', label: 'Vision & Notes', icon: Sparkles },
  { name: 'Lightbulb', label: 'Inspiration', icon: Lightbulb },
  { name: 'Users', label: 'Meetings & People', icon: Users },
  { name: 'Palette', label: 'Design & Art', icon: Palette },
  { name: 'Flame', label: 'Priority & Streak', icon: Flame },
  { name: 'Bookmark', label: 'Bookmark & Tag', icon: Bookmark },
  { name: 'Folder', label: 'Category & Project', icon: Folder },
  { name: 'Bug', label: 'Issue & Fix', icon: Bug },
  { name: 'Kanban', label: 'Board & Roadmap', icon: Kanban },
  { name: 'Coffee', label: 'Personal & Rest', icon: Coffee },
];

interface IconRendererProps {
  icon?: string;
  className?: string;
  fallback?: React.ReactNode;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  icon,
  className = 'w-4 h-4',
  fallback,
}) => {
  if (!icon) {
    return <FileText className={className} />;
  }

  const IconComponent = LUCIDE_ICON_MAP[icon];
  if (IconComponent) {
    return <IconComponent className={className} />;
  }

  // If it's a standard text/emoji that didn't match a direct map
  return <span className="inline-flex items-center justify-center leading-none">{icon}</span>;
};
