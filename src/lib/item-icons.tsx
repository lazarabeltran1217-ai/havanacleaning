import {
  ChefHat, Bath, Sofa, BedDouble, Utensils, DoorOpen, Shirt,
  Fan, Columns, Archive, Warehouse, Square, Minus, Trash2, Sparkles,
} from "lucide-react";

const ITEM_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ChefHat,
  Bath,
  Sofa,
  BedDouble,
  Utensils,
  DoorOpen,
  Shirt,
  Fan,
  Columns,
  Archive,
  Warehouse,
  Square,
  Minus,
  Trash2,
  Sparkles,
};

export function ItemIcon({ icon, className }: { icon: string | null | undefined; className?: string }) {
  const Icon = (icon && ITEM_ICON_MAP[icon]) || Sparkles;
  return <Icon className={className} />;
}
