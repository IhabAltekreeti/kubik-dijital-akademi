import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react';
import type { RiskLevel, TeacherStudent } from '@/services/teacherService';

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toLocaleUpperCase('tr-TR');
}

export function fmtDate(d: Date | string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }): string {
  return new Date(d).toLocaleDateString('tr-TR', opts);
}

export function relTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1) return 'şimdi';
  if (diff < 60) return `${Math.round(diff)} dk önce`;
  if (diff < 60 * 24) return `${Math.round(diff / 60)} sa önce`;
  const days = Math.round(diff / 1440);
  return days === 1 ? 'dün' : `${days} gün önce`;
}

export function SectionTitle({ icon: Icon, title, right, subtitle }: { icon: LucideIcon; title: string; right?: ReactNode; subtitle?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-navy-900">{title}</h3>
          {subtitle && <p className="text-xs text-navy-400">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Avatar({ name, size = 'md', tone = 'navy' }: { name: string; size?: 'sm' | 'md' | 'lg'; tone?: 'navy' | 'brand' | 'accent' }) {
  const s = size === 'sm' ? 'h-7 w-7 text-[11px]' : size === 'lg' ? 'h-14 w-14 text-lg' : 'h-9 w-9 text-xs';
  const t = tone === 'brand' ? 'bg-brand-100 text-brand-700' : tone === 'accent' ? 'bg-accent-100 text-accent-700' : 'bg-navy-100 text-navy-700';
  return <div className={`flex shrink-0 items-center justify-center rounded-full font-bold ${s} ${t}`}>{initials(name)}</div>;
}

export function NetChange({ value, unit = 'net' }: { value: number; unit?: string }) {
  if (value === 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-navy-400">
        <Minus className="h-3.5 w-3.5" />0
      </span>
    );
  const up = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-success-600' : 'text-error-600'}`}>
      {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {up ? '+' : ''}
      {value} {unit}
    </span>
  );
}

export const riskStyles: Record<RiskLevel, string> = {
  high: 'bg-error-50 text-error-700 border-error-100',
  medium: 'bg-warning-50 text-warning-700 border-warning-100',
  low: 'bg-navy-50 text-navy-600 border-navy-100',
};

export function RiskChip({ level, label }: { level: RiskLevel; label: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${riskStyles[level]}`}>{label}</span>;
}

/** Yüzdeyi kırmızı→yeşil arka plana çevirir (ısı haritası). */
export function heatClass(pct: number): string {
  if (pct >= 85) return 'bg-success-500 text-white';
  if (pct >= 70) return 'bg-success-100 text-success-700';
  if (pct >= 60) return 'bg-warning-50 text-warning-700';
  if (pct >= 45) return 'bg-warning-100 text-warning-700';
  return 'bg-error-100 text-error-700';
}

export function barColor(pct: number): string {
  if (pct >= 75) return 'bg-success-500';
  if (pct >= 60) return 'bg-brand-500';
  if (pct >= 45) return 'bg-warning-500';
  return 'bg-error-500';
}

export function StudentLink({ s, sub }: { s: TeacherStudent; sub?: ReactNode }) {
  return (
    <Link to={`/teacher/students/${s.id}`} className="flex items-center gap-3 min-w-0 group">
      <Avatar name={s.name} tone={s.classId === '8-A' ? 'brand' : 'accent'} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-navy-900 truncate group-hover:text-brand-700">{s.name}</p>
        {sub ?? <p className="text-xs text-navy-400 truncate">{s.cls.name}</p>}
      </div>
    </Link>
  );
}

/** Basit net grafiği (sütun) */
export function NetBars({ values, labels, max, highlightLast = true, height = 'h-40' }: { values: number[]; labels: string[]; max: number; highlightLast?: boolean; height?: string }) {
  const minV = Math.max(0, Math.min(...values) - max * 0.25);
  return (
    <div className={`flex items-end gap-3 ${height} border-b border-navy-100`}>
      {values.map((v, i) => {
        const isLast = highlightLast && i === values.length - 1;
        const h = ((v - minV) / (max - minV)) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5 group" title={`${labels[i]} · ${v} net`}>
            <span className={`text-[11px] font-semibold ${isLast ? 'text-brand-700' : 'text-navy-500'}`}>{v}</span>
            <div
              className={`w-full max-w-[52px] rounded-t-lg ${isLast ? 'bg-gradient-to-t from-brand-600 to-brand-400' : 'bg-navy-200 group-hover:bg-navy-300'}`}
              style={{ height: `${Math.max(6, h)}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function KpiCard({ icon: Icon, tone, label, value, sub }: { icon: LucideIcon; tone: string; label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-navy-100 shadow-card p-5">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-xs text-navy-400">{label}</p>
      <p className="text-2xl font-bold text-navy-900">{value}</p>
      {sub && <div className="text-[11px] text-navy-400 mt-1">{sub}</div>}
    </div>
  );
}

/** AI metnini (paragraf + "- " madde) düzgün gösterir */
export function AIText({ text }: { text: string }) {
  const blocks = text.replace(/\*\*/g, '').split('\n');
  return (
    <div className="space-y-1.5 text-sm text-navy-700 leading-relaxed">
      {blocks.map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} className="h-1.5" />;
        if (/^[-•*]\s+/.test(t))
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              <span>{t.replace(/^[-•*]\s+/, '')}</span>
            </div>
          );
        if (t.endsWith(':') && t.length < 70) return <p key={i} className="pt-1 font-semibold text-navy-900">{t}</p>;
        return <p key={i}>{t}</p>;
      })}
    </div>
  );
}
