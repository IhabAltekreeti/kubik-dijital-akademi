import { useState, type FormEvent } from 'react';
import { CalendarDays, CheckCircle2, Info, Megaphone, MessageSquareText, Send, Smartphone } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Select } from '@/components/ui/Input';
import AdminLayout, { DemoNote } from './AdminLayout';
import { SectionTitle, relTime } from '@/pages/teacher/shared';
import { recipientCount, smsSegments } from '@/services/adminService';
import { addAdminAnnouncement, audienceLabels, getAdminAnnouncements, type AdminAnnouncement, type AdminAudience } from '@/services/announcementStore';
import { demoAdmin } from '@/data/adminDemo';

const SENDER = 'KUBIKAKADMI';
const kindLabels: Record<AdminAnnouncement['kind'], string> = { info: 'Bilgilendirme', meeting: 'Toplantı', exam: 'Deneme sınavı' };

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<AdminAudience>('all');
  const [kind, setKind] = useState<AdminAnnouncement['kind']>('info');
  const [eventDate, setEventDate] = useState('');
  const [sms, setSms] = useState(true);
  const [error, setError] = useState('');
  const [sent, setSent] = useState<AdminAnnouncement | null>(null);
  const list = getAdminAnnouncements();

  const recipients = recipientCount(audience);
  const smsText = `Kübik Dijital Akademi: ${title.trim() || 'Duyuru başlığı'}${eventDate ? ` (${new Date(`${eventDate}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })})` : ''}. ${body.trim() || 'Duyuru metni burada görünecek.'}`;
  const segments = smsSegments(smsText);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3 || body.trim().length < 5) {
      setError('Başlık ve duyuru metnini yazın.');
      return;
    }
    const a = addAdminAnnouncement({
      title: title.trim(),
      body: body.trim(),
      audience,
      kind,
      eventDate: eventDate || null,
      sms,
      recipients,
      smsCount: sms ? recipients * segments : 0,
      createdBy: demoAdmin.displayName,
    });
    setSent(a);
    setTitle('');
    setBody('');
    setEventDate('');
    setError('');
  }

  return (
    <AdminLayout title="Duyurular" description="Velilere uygulama ve SMS ile duyuru">
      <div className="flex items-start gap-2 rounded-xl bg-warning-50 border border-warning-100 px-4 py-3">
        <Info className="h-4 w-4 text-warning-600 shrink-0 mt-0.5" />
        <p className="text-xs text-warning-700">Demo: duyuru veli panelinde görünür, ancak <b>gerçek SMS gitmez</b>. Canlıda SMS sağlayıcısı (ör. Netgsm, İleti Merkezi) bağlanacak.</p>
      </div>

      {sent && (
        <div className="flex items-center gap-2 rounded-xl bg-success-50 border border-success-100 px-4 py-3 text-sm text-success-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          "{sent.title}" {sent.recipients} veliye gönderildi{sent.sms ? ` · ${sent.smsCount} SMS (demo)` : ''}. Veli panelinde en üstte görünüyor.
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <SectionTitle icon={Megaphone} title="Yeni duyuru" />
          <form onSubmit={submit} className="space-y-4">
            <Input label="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Veli toplantısı" maxLength={80} />
            <div className="space-y-1.5">
              <label htmlFor="ann-body" className="block text-sm font-medium text-navy-700">Duyuru metni</label>
              <textarea
                id="ann-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={600}
                placeholder="Örn. Dönem ortası veli toplantımız Cumartesi 14:00'te dershanemizde yapılacaktır."
                className="w-full px-4 py-3 rounded-xl border border-navy-200 bg-white text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Select label="Kime" value={audience} onChange={(e) => setAudience(e.target.value as AdminAudience)} options={(Object.keys(audienceLabels) as AdminAudience[]).map((a) => ({ value: a, label: audienceLabels[a] }))} />
              <Select label="Tür" value={kind} onChange={(e) => setKind(e.target.value as AdminAnnouncement['kind'])} options={(Object.keys(kindLabels) as AdminAnnouncement['kind'][]).map((k) => ({ value: k, label: kindLabels[k] }))} />
              <Input label="Tarih (isteğe bağlı)" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
            <div className="rounded-xl border border-navy-100 p-3.5 space-y-2.5">
              <label className="flex items-center gap-2.5 text-sm text-navy-700">
                <input type="checkbox" checked readOnly className="h-4 w-4 rounded border-navy-300" />
                Uygulama (veli paneli)
              </label>
              <label className="flex items-center gap-2.5 text-sm text-navy-700 cursor-pointer">
                <input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} className="h-4 w-4 rounded border-navy-300 text-brand-600" />
                SMS de gönder <span className="text-xs text-navy-400">(demo)</span>
              </label>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-navy-500">
                <b className="text-navy-900">{recipients}</b> veli
                {sms && (
                  <>
                    {' '}· {smsText.length} karakter · {segments} SMS/kişi · toplam <b className="text-navy-900">{recipients * segments}</b> SMS
                  </>
                )}
              </p>
              {error && <p className="text-sm text-error-600">{error}</p>}
              <Button type="submit">
                <Send className="h-4 w-4" />
                Gönder
              </Button>
            </div>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle icon={Smartphone} title="SMS önizleme" subtitle="Velinin telefonunda böyle görünür" />
          <div className={`mx-auto w-full max-w-[280px] rounded-[2rem] border-[6px] border-navy-900 bg-navy-50 p-3 ${sms ? '' : 'opacity-40'}`}>
            <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-navy-900" />
            <p className="text-center text-[11px] font-semibold text-navy-500">{SENDER}</p>
            <div className="mt-2 rounded-2xl rounded-tl-sm bg-white border border-navy-100 p-3 text-[13px] leading-snug text-navy-800 shadow-sm">{smsText}</div>
            <p className="mt-1.5 text-[10px] text-navy-400">şimdi</p>
          </div>
          {!sms && <p className="mt-3 text-center text-xs text-navy-400">SMS kapalı: sadece veli panelinde görünecek.</p>}
          <p className="mt-3 text-center text-[11px] text-navy-400">Türkçe karakterli SMS: 155 karakter = 1 SMS (operatöre göre değişebilir)</p>
        </Card>
      </div>

      <Card>
        <SectionTitle icon={MessageSquareText} title="Gönderilen duyurular" subtitle={list.length ? `${list.length} duyuru` : undefined} />
        {list.length === 0 ? (
          <p className="py-4 text-center text-sm text-navy-400">Henüz duyuru gönderilmedi. İlk duyuruyu yukarıdan gönderin; veli panelinde en üstte görünür.</p>
        ) : (
          <div className="divide-y divide-navy-100">
            {list.map((a) => (
              <div key={a.id} className="py-3 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  {a.kind === 'meeting' || a.eventDate ? <CalendarDays className="h-4 w-4" /> : <Megaphone className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy-900">{a.title}</p>
                  <p className="text-xs text-navy-500">{a.body}</p>
                  <p className="mt-1 text-[11px] text-navy-400">
                    {audienceLabels[a.audience]} · {a.recipients} veli · {a.sms ? `uygulama + ${a.smsCount} SMS (demo)` : 'sadece uygulama'} · {relTime(a.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <DemoNote>Veli paneli testi: Demo → Veli (Fatma Yılmaz, Ayşe 8-A LGS). "Tüm veliler" veya "LGS velileri" duyuruları orada görünür.</DemoNote>
    </AdminLayout>
  );
}
