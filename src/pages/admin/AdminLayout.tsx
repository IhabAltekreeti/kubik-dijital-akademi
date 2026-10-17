import { type ReactNode } from 'react';
import RoleLayout from '@/layouts/RoleLayout';
import { newLeadCount } from '@/services/adminService';

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function AdminLayout({ title, description, children, actions }: Props) {
  return (
    <RoleLayout role="admin" pageTitle={title} pageDescription={description} actions={actions} navBadges={{ '/admin/enrollment': newLeadCount() }}>
      <div className="space-y-6 animate-fade-in">{children}</div>
    </RoleLayout>
  );
}

/** Basit yatay çubuk */
export function Bar({ pct, tone = 'bg-brand-500', h = 'h-2' }: { pct: number; tone?: string; h?: string }) {
  return (
    <div className={`w-full ${h} rounded-full bg-navy-100 overflow-hidden`}>
      <div className={`${h} rounded-full ${tone}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

export function LiveBadge({ title = 'Öğretmen panelinden canlı geliyor' }: { title?: string }) {
  return (
    <span title={title} className="inline-flex items-center gap-1 rounded-full bg-success-50 border border-success-100 px-1.5 py-0.5 text-[10px] font-semibold text-success-700">
      <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse" />
      canlı
    </span>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  return <p className="text-[11px] text-navy-400">{children}</p>;
}
