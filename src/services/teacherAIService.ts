import { callEdgeFunction } from './geminiService';
import {
  getAttentionList,
  getClassStats,
  getSlotsForDay,
  getStudent,
  type TeacherMessage,
  type TeacherStudent,
} from './teacherService';
import { demoParents } from '@/data/parentDemo';
import { weeklySchedule, type ClassId } from '@/data/teacherDemo';

export interface AIResult {
  text: string;
  source: 'gemini' | 'local';
}

const topicWhy: Record<string, string> = {
  'Basınç': 'LGS fen sorularının sık geldiği, grafik ve deney yorumlu bir konu',
  'Kuvvet ve Hareket': 'temel kavram hataları ileriki ünitelere de taşınıyor',
  'Madde ve Endüstri': 'pH ve tepkime türleri sözel yorum istiyor',
  'Basit Makineler': 'hesaplama ve şekil yorumunu birlikte istiyor',
  'DNA ve Genetik Kod': 'çaprazlama soruları adım adım çözüm gerektiriyor',
  'Mevsimler ve İklim': 'görsel yorum ağırlıklı, hızlı toparlanabilir',
  'Bitki Biyolojisi': 'AYT\'de her yıl 2-3 soru çıkıyor ve ezber yükü fazla',
  'Protein Sentezi': 'genetik ile birleşik sorularda zorluk yaratıyor',
  'Sistemler': 'AYT biyolojinin en geniş ünitesi',
  'Genetik': 'AYT\'de soru sayısı yüksek, işlem hatasına açık',
  'Ekoloji': 'grafik yorumlu sorular içeriyor',
  'Hücre Bölünmesi': 'mayoz–mitoz karşılaştırması sık soruluyor',
};

const femaleNames = new Set(['Fatma', 'Zehra', 'Selin', 'Aylin', 'Burcu', 'Nurcan', 'Derya', 'Filiz', 'Ayşe', 'Elif', 'Zeynep']);

function honorific(fullName: string): string {
  const meta = demoParents.find((p) => p.displayName === fullName);
  const first = fullName.split(' ')[0];
  if (meta) return `${first} ${meta.honorific}`;
  return `${first} ${femaleNames.has(first) ? 'Hanım' : 'Bey'}`;
}

/* ------------------------------------------------------------------ */
/* şube analizi                                                        */
/* ------------------------------------------------------------------ */

export function classContextText(classId: ClassId): string {
  const st = getClassStats(classId);
  const att = getAttentionList(classId);
  const lines = [
    `Şube: ${st.cls.name} · Ders: ${st.cls.subjectLabel} · ${st.studentCount} öğrenci`,
    `${st.cls.examType} ${st.cls.subjectLabel} net ortalamaları (eskiden yeniye, ${st.cls.netMax} soru üzerinden): ${st.avgNets.join(', ')}`,
    `Devam ortalaması %${st.attendanceAvg}, ödev teslim oranı %${st.homeworkRate}`,
    `Konu ortalamaları: ${st.topicAvgs.map((t) => `${t.topic} %${t.avg} (${t.struggling} öğrenci %60 altı)`).join('; ')}`,
    `İlgi gereken öğrenciler: ${att.map((a) => `${a.student.name} (${a.reasons.map((r) => r.label).join(', ')})`).join('; ') || 'yok'}`,
    `Haftalık ders programı: ${weeklySchedule.filter((s) => s.classId === classId).map((s) => `${['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][s.day]} ${s.start} ${s.kind}`).join(', ')}`,
  ];
  return lines.join('\n');
}

export function localClassAnalysis(classId: ClassId): string {
  const st = getClassStats(classId);
  const att = getAttentionList(classId);
  const weak = [...st.topicAvgs].sort((a, b) => a.avg - b.avg);
  const strong = weak[weak.length - 1];
  const slots = weeklySchedule.filter((s) => s.classId === classId);
  const dn = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const sign = st.change >= 0 ? '+' : '';

  const out: string[] = [];
  out.push(
    `${st.cls.name} şubesinin son ${st.cls.examType} denemesindeki ${st.cls.subjectLabel} ortalaması ${st.lastAvg} net (${sign}${st.change} net). ` +
      `En güçlü konu ${strong.topic} (%${strong.avg}); devam ortalaması %${st.attendanceAvg}, ödev teslim oranı %${st.homeworkRate}. ` +
      (st.change >= 0 ? 'Genel eğilim olumlu; asıl kazanç zayıf iki konuyu toparlamakta.' : 'Ortalama geriledi; birkaç öğrencideki düşüş şubeyi aşağı çekiyor.'),
  );
  out.push('');
  out.push('Sınıfın en çok zorlandığı konular:');
  for (const t of weak.slice(0, 2)) {
    out.push(`- ${t.topic}: ortalama %${t.avg}, ${t.struggling}/${st.studentCount} öğrenci %60'ın altında. ${topicWhy[t.topic] ? `(${topicWhy[t.topic]})` : ''}`.trim());
  }
  out.push('');
  if (att.length) {
    out.push('Bireysel ilgi gereken öğrenciler:');
    for (const a of att.slice(0, 4)) out.push(`- ${a.student.name}: ${a.reasons.map((r) => r.label).join(', ')}`);
    out.push('');
  }
  out.push('Önümüzdeki hafta için öneri:');
  const s1 = slots[0];
  const s2 = slots[1] ?? slots[0];
  out.push(`- ${dn[s1.day]} ${s1.start} dersinin ilk 20 dakikasını ${weak[0].topic} tekrarına ayırın; kısa bir kavram yanılgısı testiyle başlayın.`);
  out.push(`- ${dn[s2.day]} ${s2.kind.toLowerCase()} saatinde ${weak[1].topic} için seviye grupları kurun; ${st.topStudent.name.split(' ')[0]} gibi güçlü öğrenciler akran rehberi olabilir.`);
  out.push(`- ${weak[0].topic} konusundan 10 soruluk bir ödev atayın; teslim sonrası sonuçlar bu panele otomatik düşer.`);
  if (att.length) {
    out.push(`- ${att.slice(0, 2).map((a) => a.student.name.split(' ')[0]).join(' ve ')} ile 10'ar dakikalık birebir görüşme yapıp velilerine kısa bir not bırakın.`);
  }
  return out.join('\n');
}

export async function analyzeClass(classId: ClassId): Promise<AIResult> {
  const r = await callEdgeFunction({ mode: 'teacher_class_analysis', contextText: classContextText(classId) }, 15000);
  if (r.ok && typeof r.data?.content === 'string' && r.data.content.trim()) {
    return { text: r.data.content.trim(), source: 'gemini' };
  }
  return { text: localClassAnalysis(classId), source: 'local' };
}

/* ------------------------------------------------------------------ */
/* veli mesajına taslak cevap                                          */
/* ------------------------------------------------------------------ */

function studentContext(s: TeacherStudent): string {
  const weakIdx = s.topicScores.indexOf(Math.min(...s.topicScores));
  const strongIdx = s.topicScores.indexOf(Math.max(...s.topicScores));
  return [
    `Öğrenci: ${s.name}, ${s.cls.name}, ders: ${s.cls.subjectLabel}`,
    `${s.cls.examType} netleri (eskiden yeniye): ${s.nets.join(', ')} / ${s.cls.netMax}`,
    `En güçlü konu: ${s.cls.topics[strongIdx]} %${s.topicScores[strongIdx]}, en zayıf konu: ${s.cls.topics[weakIdx]} %${s.topicScores[weakIdx]}`,
    `Devam %${s.attendanceRate}, ödev ${s.homeworkDone}/${s.homeworkTotal}, son çalışma ${s.lastActiveDaysAgo === 0 ? 'bugün' : `${s.lastActiveDaysAgo} gün önce`}`,
  ].join('\n');
}

function nextSlotText(classId: ClassId, kind?: string): string {
  const dn = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const today = new Date().getDay();
  for (let i = 1; i <= 7; i++) {
    const d = (today + i) % 7;
    const slot = getSlotsForDay(d).find((s) => s.classId === classId && (!kind || s.kind === kind));
    if (slot) return `${dn[d]} ${slot.end}`;
  }
  return 'bu hafta içinde';
}

export function localParentReply(m: TeacherMessage): string {
  const s = getStudent(m.studentId);
  const hi = `${honorific(m.parentName ?? 'Sayın Veli')} merhaba,`;
  const sign = '\n\nSevgilerimle,\nAli Hoca';
  if (!s) return `${hi}\n\nMesajınız için teşekkür ederim. En kısa sürede detaylı dönüş yapacağım.${sign}`;

  const first = s.name.split(' ')[0];
  const weakIdx = s.topicScores.indexOf(Math.min(...s.topicScores));
  const weak = s.cls.topics[weakIdx];
  const t = m.text.toLocaleLowerCase('tr-TR');
  const trend = s.netChange >= 0 ? `son denemede ${s.cls.subjectLabel.toLocaleLowerCase('tr-TR')} netini ${s.lastNet}'e çıkardı (+${s.netChange})` : `son denemede ${s.cls.subjectLabel.toLocaleLowerCase('tr-TR')} neti ${s.lastNet} oldu (${s.netChange})`;

  if (m.kind === 'meeting' || t.includes('görüş') || t.includes('uygun')) {
    return `${hi}\n\n${first} ${trend}; çalışma düzeni hedefiyle uyumlu ilerliyor. Planı birlikte konuşmak çok iyi olur. ${nextSlotText(s.classId)} dersten sonra 20 dakika ayırabilirim; dilerseniz Cumartesi 15:00'te dershanede de görüşebiliriz. Hangisi size uygunsa yazmanız yeterli.${sign}`;
  }
  if (t.includes('kaynak') || t.includes('kitap') || t.includes('öner')) {
    return `${hi}\n\nGüzel sözleriniz için teşekkür ederim, ${first} gerçekten emek veriyor ve ${trend}. Evde ${weak} için ders kitabındaki ünite sonu soruları ve dershanemizin konu tarama fasikülü yeterli olacaktır. Panelde ${first}'e bu konudan 10 soruluk bir ödev de tanımlıyorum; günde 15 dakikalık kısa tekrarlar en verimli yöntem.${sign}`;
  }
  if (t.includes('hasta') || t.includes('gelemedi') || t.includes('kaçırdı') || t.includes('telafi')) {
    return `${hi}\n\nGeçmiş olsun. ${first}'in kaçırdığı konuları telafi etmesi için ${nextSlotText(s.classId, 'Etüt')} etüt saatine bekliyorum; ders notlarını ve konu özet videosunu da panelinden paylaşacağım. Şu an devam oranı %${s.attendanceRate}, bu hafta toparlarsak sorun olmayacaktır.${sign}`;
  }
  if (t.includes('çalışmıyor') || t.includes('düş') || t.includes('endişe') || t.includes('kötü')) {
    return `${hi}\n\nEndişenizi anlıyorum, paylaştığınız için teşekkür ederim. Verilere baktığımda ${first} ${trend}; son platform çalışması ${s.lastActiveDaysAgo === 0 ? 'bugün' : `${s.lastActiveDaysAgo} gün önce`}, ödev teslimi ise ${s.homeworkDone}/${s.homeworkTotal}. Özellikle ${weak} konusunda desteğe ihtiyacı var. Bu hafta kendisiyle birebir görüşüp küçük, günlük hedefler belirleyeceğim; evde de günde 20-30 dakikalık düzenli çalışma saatine destek olursanız kısa sürede toparlanacağına inanıyorum.${sign}`;
  }
  return `${hi}\n\nMesajınız için teşekkür ederim. ${first} ${trend}. Önümüzdeki dönemde ${weak} konusuna ağırlık vereceğiz. Aklınıza takılan her konuda buradan yazabilirsiniz.${sign}`;
}

export async function draftParentReply(m: TeacherMessage): Promise<AIResult> {
  const s = getStudent(m.studentId);
  const r = await callEdgeFunction(
    {
      mode: 'parent_reply_draft',
      userMessage: `${m.parentName} (${m.kind === 'meeting' ? 'görüşme talebi' : 'mesaj'}): ${m.text}`,
      contextText: s ? `${studentContext(s)}\nVeli: ${m.parentName}, hitap: ${honorific(m.parentName ?? '')}` : '',
    },
    15000,
  );
  if (r.ok && typeof r.data?.content === 'string' && r.data.content.trim()) {
    return { text: r.data.content.trim(), source: 'gemini' };
  }
  return { text: localParentReply(m), source: 'local' };
}
