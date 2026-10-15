import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck, Plus, CheckCircle2, Circle, Clock, Trash2,
  BookOpen, AlertCircle, GraduationCap, User, Send, X,
  Calendar, FileText, Info,
} from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Input, { Select } from '@/components/ui/Input';
import { getCurrentUser } from '@/services/authService';
import {
  getTasks, getTodaysTasks, getCompletedTasks,
  completeTask, uncompleteTask, deleteTask, canModifyTask,
  createPersonalTask, createChangeRequest, hasPendingChangeRequest,
  getPendingAssignments, getCompletedAssignments,
  getUpcomingExams,
} from '@/services/studyPlanService';
import { subjectLabels } from '@/data/programs';
import type { StudyTask, TaskOrigin, TaskType, Subject } from '@/types';

const originLabels: Record<TaskOrigin, string> = {
  teacher: 'Öğretmen',
  counselor: 'Rehberlik',
  student: 'Kişisel',
  ai: 'AI Önerisi',
};

const originColors: Record<TaskOrigin, 'brand' | 'success' | 'warning' | 'neutral'> = {
  teacher: 'brand',
  counselor: 'success',
  student: 'neutral',
  ai: 'warning',
};

const typeIcons: Record<TaskType, typeof BookOpen> = {
  practice: BookOpen,
  reading: FileText,
  review: AlertCircle,
  exam: GraduationCap,
  assignment: FileText,
};

export default function StudyPlanPage() {
  const user = getCurrentUser();

  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState<StudyTask | null>(null);
  const [requestReason, setRequestReason] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    subject: '' as string,
    estimatedMinutes: '30',
    dueDate: '',
  });

  if (!user) return null;

  const refresh = () => setRefreshKey((k) => k + 1);

  const todaysTasks = getTodaysTasks(user.id);
  const allTasks = getTasks(user.id);
  const completedTasks = getCompletedTasks(user.id);
  const pendingAssignments = getPendingAssignments(user.id);
  const completedAssignments = getCompletedAssignments(user.id);
  const upcomingExams = getUpcomingExams(user.id);

  void refreshKey;

  function handleComplete(taskId: string) {
    completeTask(taskId);
    refresh();
  }

  function handleUncomplete(taskId: string) {
    uncompleteTask(taskId);
    refresh();
  }

  function handleDelete(taskId: string) {
    if (deleteTask(taskId, user!.id)) {
      refresh();
    }
  }

  function handleAddTask() {
    if (newTask.title.trim().length < 3) return;
    createPersonalTask(user!.id, {
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      subject: newTask.subject ? (newTask.subject as Subject) : undefined,
      estimatedMinutes: Number(newTask.estimatedMinutes) || 30,
      dueDate: newTask.dueDate || null,
    });
    setNewTask({ title: '', description: '', subject: '', estimatedMinutes: '30', dueDate: '' });
    setShowAddForm(false);
    refresh();
  }

  function handleSubmitRequest() {
    if (!showRequestModal || requestReason.trim().length < 5) return;
    createChangeRequest(showRequestModal.id, user!.id, 'extend_deadline', requestReason.trim());
    setRequestReason('');
    setShowRequestModal(null);
    refresh();
  }

  const pendingTasks = allTasks.filter((t) => t.status !== 'completed');

  return (
    <AppLayout
      pageTitle="Çalışma Planı"
      pageDescription="Günlük görevlerin, ödevlerin ve sınav takvimin"
      actions={
        <Button variant="primary" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4" />
          Görev Ekle
        </Button>
      }
    >
      <div className="space-y-6 animate-fade-in">
        {/* Add task form */}
        {showAddForm && (
          <Card padding="lg" className="animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-navy-900">Yeni Kişisel Görev</h3>
              <button onClick={() => setShowAddForm(false)} className="text-navy-400 hover:text-navy-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <Input
                label="Görev Başlığı"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Örn: Matematik denklemler tekrar"
              />
              <Input
                label="Açıklama"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Kısa açıklama (opsiyonel)"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Ders"
                  options={[{ value: '', label: 'Ders seç (opsiyonel)' }, ...Object.entries(subjectLabels).map(([v, l]) => ({ value: v, label: l }))]}
                  value={newTask.subject}
                  onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                />
                <Select
                  label="Süre (dakika)"
                  options={[
                    { value: '15', label: '15 dk' },
                    { value: '30', label: '30 dk' },
                    { value: '45', label: '45 dk' },
                    { value: '60', label: '60 dk' },
                    { value: '90', label: '90 dk' },
                  ]}
                  value={newTask.estimatedMinutes}
                  onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: e.target.value })}
                />
                <Input
                  label="Son Tarih"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="primary" onClick={handleAddTask}>
                  <CheckCircle2 className="h-4 w-4" />
                  Görevi Ekle
                </Button>
                <Button variant="ghost" onClick={() => setShowAddForm(false)}>İptal</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Today's tasks */}
        <Card padding="lg">
          <div className="flex items-center gap-2.5 mb-4">
            <CalendarCheck className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-semibold text-navy-900">Bugünün Görevleri</h3>
            {todaysTasks.length > 0 && (
              <Badge color="brand">{todaysTasks.length}</Badge>
            )}
          </div>
          {todaysTasks.length > 0 ? (
            <div className="space-y-2">
              {todaysTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onUncomplete={handleUncomplete}
                  onDelete={handleDelete}
                  onRequestChange={() => setShowRequestModal(task)}
                  hasPendingRequest={hasPendingChangeRequest(user.id, task.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<CalendarCheck className="h-7 w-7" />}
              title="Bugün için görev yok"
              description="Yeni bir kişisel görev ekleyebilir veya pratik yaparak ilerleyebilirsin."
              action={
                <Link to="/app/practice">
                  <Button variant="primary" size="sm">
                    <BookOpen className="h-4 w-4" />
                    Pratiğe Başla
                  </Button>
                </Link>
              }
            />
          )}
        </Card>

        {/* Assignments + Exams grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assignments */}
          <Card padding="lg">
            <div className="flex items-center gap-2.5 mb-4">
              <FileText className="h-5 w-5 text-navy-600" />
              <h3 className="text-base font-semibold text-navy-900">Ödevler</h3>
            </div>
            {pendingAssignments.length > 0 || completedAssignments.length > 0 ? (
              <div className="space-y-2">
                {pendingAssignments.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-navy-50 border border-navy-100">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-navy-600 shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-900 truncate">{a.title}</p>
                      <p className="text-xs text-navy-400">
                        {subjectLabels[a.subject]} · {a.assignedByName} · {a.questionCount} soru
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge color={a.status === 'in_progress' ? 'warning' : 'neutral'}>
                        {a.status === 'in_progress' ? 'Devam ediyor' : 'Başlanmadı'}
                      </Badge>
                      <p className="text-xs text-navy-400 mt-1">
                        Son: {new Date(a.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
                {completedAssignments.slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-success-50 border border-success-100">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-success-600 shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-900 truncate">{a.title}</p>
                      <p className="text-xs text-navy-400">{subjectLabels[a.subject]}</p>
                    </div>
                    {a.score !== null && (
                      <Badge color={a.score >= 70 ? 'success' : a.score >= 50 ? 'brand' : 'error'}>
                        {a.score}/{a.maxScore ?? 100}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-navy-400 text-center py-6">Henüz ödev atanmadı.</p>
            )}
          </Card>

          {/* Exams */}
          <Card padding="lg">
            <div className="flex items-center gap-2.5 mb-4">
              <Calendar className="h-5 w-5 text-navy-600" />
              <h3 className="text-base font-semibold text-navy-900">Yaklaşan Sınavlar</h3>
            </div>
            {upcomingExams.length > 0 ? (
              <div className="space-y-2">
                {upcomingExams.map((exam) => {
                  const daysLeft = Math.ceil((new Date(exam.examDate).getTime() - Date.now()) / 86400000);
                  return (
                    <div key={exam.id} className="flex items-center gap-3 p-3 rounded-xl bg-navy-50 border border-navy-100">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-navy-600 shrink-0">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-900 truncate">{exam.title}</p>
                        <p className="text-xs text-navy-400">
                          {subjectLabels[exam.subject]} · {exam.topics.join(', ')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge color={daysLeft <= 7 ? 'warning' : 'neutral'}>
                          {daysLeft} gün
                        </Badge>
                        <p className="text-xs text-navy-400 mt-1">
                          {new Date(exam.examDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-navy-400 text-center py-6">Yaklaşan sınav yok.</p>
            )}
          </Card>
        </div>

        {/* All pending tasks */}
        {pendingTasks.length > 0 && (
          <Card padding="lg">
            <h3 className="text-base font-semibold text-navy-900 mb-4">Tüm Bekleyen Görevler</h3>
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onUncomplete={handleUncomplete}
                  onDelete={handleDelete}
                  onRequestChange={() => setShowRequestModal(task)}
                  hasPendingRequest={hasPendingChangeRequest(user.id, task.id)}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <Card padding="lg">
            <h3 className="text-base font-semibold text-navy-900 mb-4">Tamamlanan Görevler</h3>
            <div className="space-y-2">
              {completedTasks.slice(0, 10).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-success-50 border border-success-100 opacity-75">
                  <CheckCircle2 className="h-5 w-5 text-success-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-700 line-through truncate">{task.title}</p>
                    <p className="text-xs text-navy-400">
                      {originLabels[task.origin]} · {task.completedAt && new Date(task.completedAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Change request modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={() => setShowRequestModal(null)} />
          <Card padding="lg" className="relative max-w-md w-full animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-navy-900">Görev Değişiklik Talebi</h3>
              <button onClick={() => setShowRequestModal(null)} className="text-navy-400 hover:text-navy-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-navy-500 mb-4">
              "{showRequestModal.title}" görevi için son tarih uzatma talebi gönderebilirsin.
              Talebin öğretmenine iletilecektir.
            </p>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-navy-700">Talep Nedeni</label>
              <textarea
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="Neden daha fazla zamana ihtiyacın olduğunu kısaca açıkla..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-navy-200 bg-white text-navy-900 text-sm placeholder:text-navy-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="primary" onClick={handleSubmitRequest}>
                <Send className="h-4 w-4" />
                Talebi Gönder
              </Button>
              <Button variant="ghost" onClick={() => setShowRequestModal(null)}>İptal</Button>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}

function TaskRow({
  task, onComplete, onUncomplete, onDelete, onRequestChange, hasPendingRequest,
}: {
  task: StudyTask;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
  onDelete: (id: string) => void;
  onRequestChange: () => void;
  hasPendingRequest: boolean;
}) {
  const Icon = typeIcons[task.type] ?? BookOpen;
  const isCompleted = task.status === 'completed';
  const canModify = canModifyTask(task);
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && !isCompleted && dueDate < new Date();

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
      isCompleted ? 'bg-success-50 border-success-100' : isOverdue ? 'bg-error-50 border-error-100' : 'bg-navy-50 border-navy-100'
    }`}>
      <button
        onClick={() => isCompleted ? onUncomplete(task.id) : onComplete(task.id)}
        className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
        aria-label={isCompleted ? 'Görevi geri al' : 'Görevi tamamla'}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-success-600" />
        ) : (
          <Circle className="h-5 w-5 text-navy-300 hover:text-navy-500" />
        )}
      </button>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-navy-600 shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isCompleted ? 'text-navy-500 line-through' : 'text-navy-900'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 flex-wrap mt-0.5">
          <Badge color={originColors[task.origin]}>{originLabels[task.origin]}</Badge>
          {task.subject && <span className="text-xs text-navy-400">{subjectLabels[task.subject]}</span>}
          <span className="flex items-center gap-1 text-xs text-navy-400">
            <Clock className="h-3 w-3" />
            {task.estimatedMinutes} dk
          </span>
          {dueDate && (
            <span className={`text-xs ${isOverdue ? 'text-error-600 font-medium' : 'text-navy-400'}`}>
              Son: {dueDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </span>
          )}
          {task.assignedByName && (
            <span className="flex items-center gap-1 text-xs text-navy-400">
              <User className="h-3 w-3" />
              {task.assignedByName}
            </span>
          )}
          {hasPendingRequest && (
            <Badge color="warning">Talep bekliyor</Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {task.practiceLink && !isCompleted && (
          <Link to={task.practiceLink}>
            <Button variant="ghost" size="sm">
              <BookOpen className="h-4 w-4" />
            </Button>
          </Link>
        )}
        {!canModify && !hasPendingRequest && !isCompleted && (
          <button
            onClick={onRequestChange}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-100"
            aria-label="Değişiklik talep et"
            title="Son tarih uzatma talep et"
          >
            <Info className="h-4 w-4" />
          </button>
        )}
        {canModify && !isCompleted && (
          <button
            onClick={() => onDelete(task.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-error-50 hover:text-error-600"
            aria-label="Görevi sil"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
