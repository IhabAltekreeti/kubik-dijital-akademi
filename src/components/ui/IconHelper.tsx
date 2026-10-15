import {
  Calculator,
  FlaskConical,
  BookOpen,
  Landmark,
  Scroll,
  Moon,
  Languages,
  Leaf,
  Atom,
  TestTube,
  PenTool,
  GraduationCap,
  Pencil,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'calculator': Calculator,
  'flask-conical': FlaskConical,
  'book-open': BookOpen,
  'landmark': Landmark,
  'scroll': Scroll,
  'moon': Moon,
  'languages': Languages,
  'leaf': Leaf,
  'atom': Atom,
  'test-tube': TestTube,
  'pen-tool': PenTool,
  'graduation-cap': GraduationCap,
  'pencil': Pencil,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? BookOpen;
}
