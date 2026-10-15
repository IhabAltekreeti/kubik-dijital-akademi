import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { getCurrentUser } from '@/services/authService';
import { getProgram, subjectLabels, subjectIcons, subjectTopics } from '@/data/programs';
import { getIcon } from '@/components/ui/IconHelper';
import { sampleQuestions } from '@/data/questions';
import type { Subject } from '@/types';

export default function CoursesPage() {
  const user = getCurrentUser();
  if (!user) return null;

  const programInfo = getProgram(user.program);
  const programSubjects = programInfo?.subjects ?? [];
  const availableTopics = subjectTopics.filter((t) => programSubjects.includes(t.subject));
  const questionCountByTopic = (subject: Subject, topic: string) =>
    sampleQuestions.filter((q) => q.subject === subject && q.topic === topic).length;

  const groupedBySubject = availableTopics.reduce(
    (acc, topic) => {
      if (!acc[topic.subject]) acc[topic.subject] = [];
      acc[topic.subject].push(topic);
      return acc;
    },
    {} as Record<Subject, typeof availableTopics>
  );

  return (
    <AppLayout
      pageTitle="Dersler"
      pageDescription={programInfo ? `${programInfo.name} · Konu bazlı çalışma` : 'Konu bazlı çalışma'}
    >
      <div className="space-y-6 animate-fade-in">
        {programSubjects.length === 0 ? (
          <Card>
            <EmptyState
              icon={<BookOpen className="h-7 w-7" />}
              title="Henüz ders içeriği yok"
              description="Seçtiğin program için içerik hazırlanıyor. Yakında burada olacak."
            />
          </Card>
        ) : (
          Object.entries(groupedBySubject).map(([subject, topics]) => {
            const subjectKey = subject as Subject;
            const Icon = getIcon(subjectIcons[subjectKey]);
            return (
              <div key={subject}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-navy-900">{subjectLabels[subjectKey]}</h2>
                    <p className="text-sm text-navy-400">{topics.length} konu</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics.map((topic) => {
                    const qCount = questionCountByTopic(topic.subject, topic.topic);
                    return (
                      <Card key={`${topic.subject}-${topic.topic}`} hover className="flex flex-col">
                        <h3 className="text-base font-semibold text-navy-900 mb-1.5">{topic.topic}</h3>
                        <p className="text-sm text-navy-500 leading-relaxed mb-4 flex-1">
                          {topic.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge color="neutral">{qCount} soru</Badge>
                          <Link to={`/app/practice?subject=${topic.subject}&topic=${encodeURIComponent(topic.topic)}`}>
                            <Button variant="ghost" size="sm">
                              Pratik Yap
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}
