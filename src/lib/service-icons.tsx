import {
  Home, Sparkles, Package, Building2, Hammer, Leaf, Repeat,
} from "lucide-react";

const SERVICE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "\u{1F3E0}": Home,       // 🏠
  "\u2728": Sparkles,      // ✨
  "\u{1F4E6}": Package,    // 📦
  "\u{1F3E2}": Building2,  // 🏢
  "\u{1F528}": Hammer,     // 🔨
  "\u{1F33F}": Leaf,       // 🌿
  "\u{1F504}": Repeat,     // 🔄
};

export function ServiceIcon({ emoji, className }: { emoji: string | null | undefined; className?: string }) {
  const Icon = (emoji && SERVICE_ICON_MAP[emoji]) || Sparkles;
  return <Icon className={className} />;
}
