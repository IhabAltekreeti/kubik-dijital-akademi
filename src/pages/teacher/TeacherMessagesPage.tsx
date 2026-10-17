import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarClock, CheckCircle2, Inbox, MessageSquare, Send, Sparkles } from 'lucide-react';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import TeacherLayout from './TeacherLayout';
import { Avatar, NetChange, SectionTitle, fmtDate, relTime } from './shared';
import { getStudent, getTeacherMessages, markMessageRead, replyToMessage, type TeacherMessage } from '@/services/teacherService';
import { draftParentReply } from '@/services/teacherAIService';

type Filter = 'all' | 'unread' | 'meeting';

function MessageDetail({ m, onChange }: { m: TeacherMessage; onChange: () => void }) {
  const [text, setText] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const s = getStudent(m.studentId);

  async function draft() {
    setDrafting(true);
    const [r] = await Promise.all([draftParentReply(m), new Promise((res) => setTimeout(res, 700))]);
    setText(r.text);
    setAiUsed(true);
    setDrafting(false);
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    replyToMessage(m.id, text.trim());
    setText('');
    onChange();
  }

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-navy-100">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={m.parentName ?? 'V'} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy-900 truncate">{m.parentName}</p>
            <p className="text-xs text-navy-400 truncate">
              {m.studentName} velisi · {m.className}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            m.kind === 'meeting' ? 'bg-accent-50 text-accent-700' : 'bg-navy-100 text-navy-600'
          }`}
        >
          {m.kind === 'meeting' ? <CalendarClock className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
          {m.kind === 'meeting' ? 'Görüşme talebi' : 'Mesaj'}
        </span>
      </div>

      {s && (
        <Link to={`/teacher/students/${s.id}`} className="mt-4 grid grid-cols-4 gap-2 rounded-xl bg-navy-50 p-3 hover:bg-navy-100">
          <div>
            <p className="text-[10px] text-navy-400">Son net</p>
            <p className="text-sm font-bold text-navy-900">{s.lastNet}</p>
            <NetChange value={s.netChange} />
          </div>
          <div>
            <p className="text-[10px] text-navy-400">Devam</p>
            <p className="text-sm font-bold text-navy-900">%{s.attendanceRate}</p>
          </div>
          <div>
            <p className="text-[10px] text-navy-400">Ödev</p>
            <p className="text-sm font-bold text-navy-900">
              {s.homeworkDone}/{s.homeworkTotal}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-navy-400">Son çalışma</p>
            <p className="text-sm font-bold text-navy-900">{s.lastActiveDaysAgo === 0 ? 'Bugün' : `${s.lastActiveDaysAgo} gün`}</p>
          </div>
        </Link>
      )}

      <div className="mt-4 space-y-3">
        <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white border border-navy-100 px-4 py-3">
          <p className="text-sm text-navy-800 leading-relaxed whitespace-pre-line">{m.text}</p>
          <p className="mt-1.5 text-[11px] text-navy-400">{fmtDate(m.createdAt, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        {m.reply && (
          <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-navy-900 px-4 py-3 text-white">
            <p className="text-sm leading-relaxed whitespace-pre-line">{m.reply.text}</p>
            <p className="mt-1.5 flex items-center justify-end gap-1 text-[11px] text-navy-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Gönderildi · veli panelinde görünüyor · {relTime(m.reply.createdAt)}
            </p>
          </div>
        )}
      </div>

      {!m.reply && (
        <form onSubmit={send} className="mt-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-navy-500">Cevabınız</p>
            <button
              type="button"
              onClick={draft}
              disabled={drafting}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-brand-200 bg-brand-50 text-xs font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-60"
            >
              <Sparkles className={`h-3.5 w-3.5 ${drafting ? 'animate-pulse' : ''}`} />
              {drafting ? 'Kübik AI yazıyor…' : aiUsed ? 'Yeniden yaz' : 'Kübik AI ile taslak yaz'}
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Cevabınızı yazın veya Kübik AI'dan taslak isteyin…"
            className="w-full rounded-xl border border-navy-200 px-3.5 py-2.5 text-sm text-navy-800 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
          />
          {aiUsed && <p className="text-[11px] text-navy-400">Taslak öğrencinin güncel verilerine göre hazırlandı. Göndermeden önce düzenleyebilirsiniz.</p>}
          <button
            type="submit"
            disabled={!text.trim()}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 disabled:opacity-40"
          >
            <Send className="h-4 w-4" /> Veliye gönder
          </button>
        </form>
      )}
    </Card>
  );
}

export default function TeacherMessagesPage() {
  const [params, setParams] = useSearchParams();
  const [, force] = useState(0);
  const [filter, setFilter] = useState<Filter>('all');
  const all = getTeacherMessages();
  const selectedId = params.get('m') ?? all[0]?.id ?? null;
  const selected = all.find((m) => m.id === selectedId) ?? null;

  if (selected && selected.status === 'sent') {
    markMessageRead(selected.id);
    selected.status = 'read';
  }

  const list = all.filter((m) => (filter === 'unread' ? m.status === 'sent' || m.id === selectedId : filter === 'meeting' ? m.kind === 'meeting' : true));
  const unread = all.filter((m) => m.status === 'sent').length;

  return (
    <TeacherLayout title="Veli Mesajları" description="Velilerden gelen mesaj ve görüşme talepleri">
      {all.length === 0 ? (
        <Card padding="lg">
          <EmptyState icon={<Inbox className="h-7 w-7" />} title="Henüz mesaj yok" description="Veliler panelden size mesaj gönderdiğinde burada görünecek." />
        </Card>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-2" padding="sm">
            <div className="p-1">
              <SectionTitle icon={Inbox} title="Gelen Kutusu" subtitle={unread ? `${unread} okunmamış` : 'Hepsi okundu'} />
              <div className="inline-flex rounded-xl bg-navy-100 p-1 mb-3">
                {[
                  { k: 'all' as const, l: 'Tümü' },
                  { k: 'unread' as const, l: 'Okunmamış' },
                  { k: 'meeting' as const, l: 'Görüşme' },
                ].map((f) => (
                  <button
                    key={f.k}
                    onClick={() => setFilter(f.k)}
                    className={`px-3 h-8 rounded-lg text-xs font-semibold ${filter === f.k ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500'}`}
                  >
                    {f.l}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                {list.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setParams({ m: m.id })}
                    className={`w-full text-left flex gap-3 rounded-xl p-3 transition-colors ${
                      m.id === selectedId ? 'bg-brand-50 ring-1 ring-brand-200' : 'hover:bg-navy-50'
                    }`}
                  >
                    <Avatar name={m.parentName ?? 'V'} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${m.status === 'sent' ? 'font-bold text-navy-900' : 'font-medium text-navy-800'}`}>{m.parentName}</p>
                        <span className="shrink-0 text-[11px] text-navy-400">{relTime(m.createdAt)}</span>
                      </div>
                      <p className="text-[11px] text-navy-400">
                        {m.studentName} · {m.className}
                      </p>
                      <p className="mt-0.5 text-xs text-navy-500 line-clamp-1">{m.text}</p>
                      <div className="mt-1 flex gap-1.5">
                        {m.status === 'sent' && <span className="rounded-full bg-error-50 px-1.5 py-px text-[10px] font-semibold text-error-700">Yeni</span>}
                        {m.status === 'replied' && <span className="rounded-full bg-success-50 px-1.5 py-px text-[10px] font-semibold text-success-700">Cevaplandı</span>}
                        {m.kind === 'meeting' && <span className="rounded-full bg-accent-50 px-1.5 py-px text-[10px] font-semibold text-accent-700">Görüşme</span>}
                      </div>
                    </div>
                  </button>
                ))}
                {list.length === 0 && <p className="py-6 text-center text-sm text-navy-400">Bu filtrede mesaj yok.</p>}
              </div>
            </div>
          </Card>
          <div className="lg:col-span-3">
            {selected ? (
              <MessageDetail key={selected.id} m={selected} onChange={() => force((x) => x + 1)} />
            ) : (
              <Card padding="lg">
                <EmptyState icon={<MessageSquare className="h-7 w-7" />} title="Bir mesaj seçin" description="Soldaki listeden bir mesaj seçerek cevaplayabilirsiniz." />
              </Card>
            )}
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
