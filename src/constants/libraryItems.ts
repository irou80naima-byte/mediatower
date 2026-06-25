// =============================================
// Library Items — مكتبة العناصر (wireframe, shapes, social)
// =============================================

import {
  Globe,
  Share2,
  Layout,
  FileText,
  Mail as MailIcon,
  Image as ImageIcon,
  List,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  Star,
  Tag,
  Zap,
  BarChart,
  Table as TableIcon,
  MessageSquare,
  LogIn,
  UserPlus,
  AlertCircle,
  User,
  CheckCircle,
  Circle as CircleIcon,
  Square,
  Diamond,
  Triangle as TriangleIcon,
  Facebook,
  Instagram,
  Linkedin,
  Github as GithubIcon,
  Youtube as YoutubeIcon,
  Slack as SlackIcon,
  Twitter,
  Video,
  Search,
  Sparkles,
  Download,
  Notebook,
} from 'lucide-react';
import type { LibraryItem, LibraryCategory } from '../types/project';

export const LIBRARY_ITEMS: Record<LibraryCategory, LibraryItem[]> = {
  wireframe: [
    { label: 'Website', icon: Globe },
    { label: 'Social Post', icon: Share2 },
    { label: 'Landing', icon: Layout },
    { label: 'About Us', icon: FileText },
    { label: 'Contact', icon: MailIcon },
    { label: 'Blog', icon: FileText },
    { label: 'Portfolio', icon: ImageIcon },
    { label: 'Files', icon: FileText },
    { label: 'AI', icon: Sparkles },
    { label: 'AI 2', icon: Sparkles },
    { label: 'Search', icon: Search },
    { label: 'Product List', icon: List },
    { label: 'Product', icon: ShoppingBag },
    { label: 'Shopping Cart', icon: ShoppingCart },
    { label: 'Payment', icon: CreditCard },
    { label: 'Review', icon: Star },
    { label: 'Pricing', icon: Tag },
    { label: 'Call to Action', icon: Zap },
    { label: 'Survey', icon: MessageSquare },
    { label: 'Video', icon: Video },
    { label: 'Map', icon: Globe },
    { label: 'Calendar', icon: Layout },
    { label: 'Dashboard', icon: BarChart },
    { label: 'Table', icon: TableIcon },
    { label: 'Comments', icon: MessageSquare },
    { label: 'Download', icon: Download },
    { label: 'Sign In', icon: LogIn },
    { label: 'Register', icon: UserPlus },
    { label: '404', icon: AlertCircle },
    { label: 'Error Page', icon: AlertCircle },
    { label: 'User', icon: User },
    { label: 'Thank You', icon: CheckCircle },
    { label: 'Form', icon: FileText },
    { label: 'Upload Image', icon: ImageIcon, variant: 'image' },
    { label: 'YouTube Video', icon: YoutubeIcon, variant: 'video' },
    { label: 'Upload Video', icon: Video, variant: 'video_upload' },
    { label: 'Notepad', icon: Notebook, variant: 'notepad' },
  ],

  shape: [
    { label: 'Circle', icon: CircleIcon, shape: 'circle' },
    { label: 'Diamond', icon: Diamond, shape: 'diamond' },
    { label: 'Rectangle', icon: Square, shape: 'rectangle' },
    { label: 'Triangle', icon: TriangleIcon, shape: 'triangle' },
    { label: 'Round Rectangle', icon: Square, shape: 'round-rectangle' },
  ],

  social: [
    { label: 'Facebook', icon: Facebook },
    { label: 'Gmail', icon: MailIcon },
    { label: 'Instagram', icon: Instagram },
    { label: 'Discord', icon: MessageSquare },
    { label: 'LinkedIn', icon: Linkedin },
    { label: 'Flickr', icon: ImageIcon },
    { label: 'Pinterest', icon: ImageIcon },
    { label: 'Twitch', icon: YoutubeIcon },
    { label: 'Skype', icon: MessageSquare },
    { label: 'Github', icon: GithubIcon },
    { label: 'Medium', icon: FileText },
    { label: 'Threads', icon: MessageSquare },
    { label: 'Tik Tok', icon: YoutubeIcon },
    { label: 'Telegram', icon: MessageSquare },
    { label: 'Quora', icon: MessageSquare },
    { label: 'Etsy', icon: ShoppingBag },
    { label: 'Whatsup', icon: MessageSquare },
    { label: 'Reddit', icon: MessageSquare },
    { label: 'X', icon: Twitter },
    { label: 'Youtube', icon: YoutubeIcon },
    { label: 'Vimeo', icon: YoutubeIcon },
    { label: 'Slack', icon: SlackIcon },
    { label: 'Snapchat', icon: MessageSquare },
  ],
};

/**
 * Find the icon component for a given label by searching all categories.
 * Used when deserializing nodes from DB (icons can't be serialized to JSON).
 */
export function findIcon(label: string) {
  for (const category in LIBRARY_ITEMS) {
    const item = LIBRARY_ITEMS[category as LibraryCategory].find(
      (i) => i.label === label
    );
    if (item?.icon) return item.icon;
  }
  return null;
}

/**
 * Get YouTube thumbnail from a YouTube URL
 */
export const getYoutubeThumbnail = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`
    : null;
};
