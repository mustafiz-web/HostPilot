import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Plus,
  Eye,
  Pencil,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';

interface StudentRecord {
  id: string;
  studentCode: string;
  phone: string;
  department: string;
  rollNumber: string;
  session: string;
  batch: string;
  bloodGroup?: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'EXPELLED';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
  guardians: Array<{
    id: string;
    name: string;
    relationship: string;
    phone: string;
  }>;
  activeAllocation?: {
    id: string;
    room?: { roomNumber: string };
    bed?: { bedCode: string };
  };
}

export const StudentsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit Student Form State
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    department: '',
    rollNumber: '',
    session: '',
    batch: '',
    bloodGroup: '',
    address: '',
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    emergencyContact: '',
  });

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    studentCode: '',
    phone: '',
    department: 'CSE',
    rollNumber: '',
    session: '2022-23',
    batch: '23',
    bloodGroup: 'B+',
    address: '',
    guardianName: '',
    guardianRelation: 'পিতা',
    guardianPhone: '',
  });

  // Query: Fetch Students with real pagination & filtering from MySQL
  const {
    data: studentsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-students', { page, search: searchTerm, status: statusFilter }],
    queryFn: async () => {
      const res = await apiClient.get<StudentRecord[]>('/students', {
        page,
        limit: 10,
        search: searchTerm || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      return res;
    },
    staleTime: 60 * 1000,
  });

  const students = studentsResponse?.data || [];
  const meta = studentsResponse?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Mutation: Add new student
  const addStudentMutation = useMutation({
    mutationFn: async (payload: typeof newStudent) => {
      const res = await apiClient.post<StudentRecord>('/students', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      setAddModalOpen(false);
      setAddError(null);
      setNewStudent({
        name: '',
        email: '',
        studentCode: '',
        phone: '',
        department: 'CSE',
        rollNumber: '',
        session: '2022-23',
        batch: '23',
        bloodGroup: 'B+',
        address: '',
        guardianName: '',
        guardianRelation: 'পিতা',
        guardianPhone: '',
      });
    },
    onError: (err: any) => {
      setAddError(err.message || 'শিক্ষার্থী তৈরি করতে সমস্যা হয়েছে');
    },
  });

  // Mutation: Update existing student
  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: typeof editForm }) => {
      const res = await apiClient.patch<StudentRecord>(`/students/${id}`, payload);
      return res.data;
    },
    onSuccess: (updatedStudent) => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      setEditingStudent(null);
      setEditError(null);
      if (selectedStudent?.id === updatedStudent.id) {
        setSelectedStudent(updatedStudent);
      }
    },
    onError: (err: any) => {
      setEditError(err.message || 'শিক্ষার্থীর তথ্য আপডেট করতে সমস্যা হয়েছে');
    },
  });

  const handleOpenEdit = (student: StudentRecord) => {
    setEditingStudent(student);
    setEditError(null);
    const g = student.guardians?.[0];
    setEditForm({
      name: student.user?.name || '',
      phone: student.phone || '',
      department: student.department || '',
      rollNumber: student.rollNumber || '',
      session: student.session || '',
      batch: student.batch || '',
      bloodGroup: student.bloodGroup || '',
      address: student.address || '',
      guardianName: g?.name || '',
      guardianRelation: g?.relationship || '',
      guardianPhone: g?.phone || '',
      emergencyContact: (g as any)?.emergencyContact || '',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setEditError(null);
    updateStudentMutation.mutate({ id: editingStudent.id, payload: editForm });
  };

  // Mutation: Toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'ACTIVE' | 'INACTIVE' }) => {
      const res = await apiClient.patch<StudentRecord>(`/students/${id}/status`, {
        status: newStatus,
      });
      return res.data;
    },
    onSuccess: (updatedStudent) => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      if (selectedStudent?.id === updatedStudent.id) {
        setSelectedStudent((prev) => (prev ? { ...prev, status: updatedStudent.status } : null));
      }
    },
  });

  const handleToggleStatus = (student: StudentRecord) => {
    const nextStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    toggleStatusMutation.mutate({ id: student.id, newStatus: nextStatus });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    addStudentMutation.mutate(newStudent);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>{t('admin.students.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('admin.students.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => {
            setAddError(null);
            setAddModalOpen(true);
          }}
          className="gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.dashboard.quick_admissions')}</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder={t('admin.students.search_placeholder')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">{t('common.filter')}:</span>
          <Button
            size="sm"
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('ALL');
              setPage(1);
            }}
            className="text-xs rounded-full h-8"
          >
            {t('admin.students.filter_all')}
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('ACTIVE');
              setPage(1);
            }}
            className="text-xs rounded-full h-8"
          >
            {t('admin.students.filter_active')}
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'INACTIVE' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('INACTIVE');
              setPage(1);
            }}
            className="text-xs rounded-full h-8"
          >
            {t('admin.students.filter_inactive')}
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span>ডেটাবেজ থেকে শিক্ষার্থী তথ্য লোড হচ্ছে...</span>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm text-slate-700 font-medium">
              {(error as any)?.message || 'শিক্ষার্থী তালিকা লোড করা যায়নি'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>পুনরায় চেষ্টা করুন</span>
            </Button>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">কোনো শিক্ষার্থী পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? 'আপনার সার্চ টার্মের সাথে মিল রেখে কোনো রেকর্ড পাওয়া যায়নি।'
                : 'বর্তমানে কোনো শিক্ষার্থী নিবন্ধিত নেই। নতুন শিক্ষার্থী যুক্ত করতে ওপরের বাটন চাপুন।'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="font-semibold text-xs">{t('auth.student_id_label')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('admin.students.th_student')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('admin.students.th_academic')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('admin.students.th_room')}</TableHead>
                    <TableHead className="font-semibold text-xs">{t('admin.students.th_status')}</TableHead>
                    <TableHead className="font-semibold text-xs text-right">{t('admin.students.th_actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-mono text-xs font-semibold text-slate-700">
                        {student.studentCode}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-900">{student.user?.name}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {student.user?.email}
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {student.phone}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        <span className="font-medium">{student.department}</span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          রোল: {student.rollNumber} • {student.session}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        {student.activeAllocation ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            রুম {student.activeAllocation.room?.roomNumber} (বেড {student.activeAllocation.bed?.bedCode})
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">সিট বরাদ্দ নেই</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={student.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedStudent(student)}
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleOpenEdit(student)}
                            title="তথ্য পরিবর্তন করুন (Edit)"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={toggleStatusMutation.isPending}
                            className={`h-8 w-8 p-0 ${
                              student.status === 'ACTIVE'
                                ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            onClick={() => handleToggleStatus(student)}
                            title={student.status === 'ACTIVE' ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                          >
                            {student.status === 'ACTIVE' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <span>
                  মোট {meta.total} জন শিক্ষার্থীর মধ্যে {((meta.page - 1) * meta.limit) + 1} -{' '}
                  {Math.min(meta.page * meta.limit, meta.total)} প্রদর্শিত হচ্ছে
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 px-2 gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>পূর্ববর্তী</span>
                  </Button>
                  <span className="px-2 font-mono font-semibold">
                    {meta.page} / {meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    className="h-8 px-2 gap-1"
                  >
                    <span>পরবর্তী</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Student Modal Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>নতুন শিক্ষার্থী নিবন্ধন (Add Student)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              শিক্ষার্থী প্রোফাইল এবং লগইন ইউজার অ্যাকাউন্ট একবারে তৈরি করা হবে।
            </DialogDescription>
          </DialogHeader>

          {addError && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <AlertDescription>{addError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="stu-name" className="text-xs">
                  শিক্ষার্থীর পূর্ণ নাম *
                </Label>
                <Input
                  id="stu-name"
                  required
                  placeholder="e.g. তানভীর আহমেদ"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="stu-code" className="text-xs">
                  স্টুডেন্ট কোড / আইডি *
                </Label>
                <Input
                  id="stu-code"
                  required
                  placeholder="e.g. HP-STU-2026-002"
                  value={newStudent.studentCode}
                  onChange={(e) => setNewStudent({ ...newStudent, studentCode: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="stu-email" className="text-xs">
                  ইমেইল ঠিকানা (লগইনের জন্য) *
                </Label>
                <Input
                  id="stu-email"
                  type="email"
                  required
                  placeholder="student@campus.edu.bd"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="stu-phone" className="text-xs">
                  ১১ ডিজিটের মোবাইল নম্বর *
                </Label>
                <Input
                  id="stu-phone"
                  required
                  placeholder="017XXXXXXXX"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="stu-dept" className="text-xs">
                  বিভাগ (Department) *
                </Label>
                <Input
                  id="stu-dept"
                  required
                  placeholder="e.g. CSE / EEE / BBA"
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="stu-roll" className="text-xs">
                  ক্লাস রোল নম্বর *
                </Label>
                <Input
                  id="stu-roll"
                  required
                  placeholder="e.g. 2022-CSE-045"
                  value={newStudent.rollNumber}
                  onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="stu-session" className="text-xs">
                  সেশন ও ব্যাচ *
                </Label>
                <Input
                  id="stu-session"
                  required
                  placeholder="e.g. 2022-23 (ব্যাচ ২৩)"
                  value={newStudent.session}
                  onChange={(e) => setNewStudent({ ...newStudent, session: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="stu-blood" className="text-xs">
                  রক্তের গ্রুপ
                </Label>
                <Input
                  id="stu-blood"
                  placeholder="e.g. B+"
                  value={newStudent.bloodGroup}
                  onChange={(e) => setNewStudent({ ...newStudent, bloodGroup: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="stu-addr" className="text-xs">
                স্থায়ী ঠিকানা *
              </Label>
              <Input
                id="stu-addr"
                required
                placeholder="গ্রাম/বাড়ি, ডাকঘর, থানা ও জেলা"
                value={newStudent.address}
                onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            {/* Guardian Info */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">অভিভাবকের তথ্য (Primary Guardian)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="g-name" className="text-[11px]">
                    অভিভাবকের নাম *
                  </Label>
                  <Input
                    id="g-name"
                    required
                    placeholder="নাম"
                    value={newStudent.guardianName}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianName: e.target.value })}
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="g-rel" className="text-[11px]">
                    সম্পর্ক *
                  </Label>
                  <Input
                    id="g-rel"
                    required
                    placeholder="e.g. পিতা/মাতা"
                    value={newStudent.guardianRelation}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianRelation: e.target.value })}
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="g-phone" className="text-[11px]">
                    মোবাইল নম্বর *
                  </Label>
                  <Input
                    id="g-phone"
                    required
                    placeholder="018XXXXXXXX"
                    value={newStudent.guardianPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianPhone: e.target.value })}
                    className="h-8 text-xs bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddModalOpen(false)}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={addStudentMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {addStudentMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <span>শিক্ষার্থী সংরক্ষণ করুন</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>শিক্ষার্থী বিস্তারিত প্রোফাইল</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{selectedStudent.user?.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedStudent.studentCode}</p>
                </div>
                <StatusBadge status={selectedStudent.status} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">বিভাগ ও রোল</span>
                  <p className="font-semibold text-slate-800">{selectedStudent.department}</p>
                  <p className="text-[11px] text-slate-500 font-mono">রোল: {selectedStudent.rollNumber}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">যোগাযোগ</span>
                  <p className="font-semibold text-slate-800">{selectedStudent.phone}</p>
                  <p className="text-[11px] text-slate-500 truncate">{selectedStudent.user?.email}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">রক্তের গ্রুপ</span>
                  <p className="font-semibold text-slate-800">{selectedStudent.bloodGroup || 'অজানা'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">বর্তমান সিট</span>
                  <p className="font-semibold text-slate-800">
                    {selectedStudent.activeAllocation
                      ? `রুম ${selectedStudent.activeAllocation.room?.roomNumber}`
                      : 'বরাদ্দ নেই'}
                  </p>
                </div>
              </div>

              {selectedStudent.guardians && selectedStudent.guardians.length > 0 && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-800 font-bold block uppercase mb-1">
                    অভিভাবকের বিবরণ
                  </span>
                  <p className="font-semibold text-slate-900">
                    {selectedStudent.guardians[0].name} ({selectedStudent.guardians[0].relationship})
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono">
                    মোবাইল: {selectedStudent.guardians[0].phone}
                  </p>
                </div>
              )}

              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 block uppercase">স্থায়ী ঠিকানা</span>
                <p className="text-slate-800">{selectedStudent.address}</p>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setSelectedStudent(null)}>
                বন্ধ করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Student Modal Dialog */}
      {editingStudent && (
        <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <Pencil className="w-5 h-5 text-emerald-600" />
                <span>শিক্ষার্থীর তথ্য পরিবর্তন (Edit Student Information)</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                শিক্ষার্থীর ব্যক্তিগত, অ্যাকাডেমিক এবং অভিভাবকের অনুমোদিত তথ্য আপডেট করুন।
              </DialogDescription>
            </DialogHeader>

            {editError && (
              <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <AlertDescription>{editError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-name" className="text-xs">
                    পূর্ণ নাম *
                  </Label>
                  <Input
                    id="edit-name"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-phone" className="text-xs">
                    মোবাইল নম্বর *
                  </Label>
                  <Input
                    id="edit-phone"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-dept" className="text-xs">
                    বিভাগ (Department) *
                  </Label>
                  <Input
                    id="edit-dept"
                    required
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-roll" className="text-xs">
                    ক্লাস রোল নম্বর *
                  </Label>
                  <Input
                    id="edit-roll"
                    required
                    value={editForm.rollNumber}
                    onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-session" className="text-xs">
                    সেশন *
                  </Label>
                  <Input
                    id="edit-session"
                    required
                    value={editForm.session}
                    onChange={(e) => setEditForm({ ...editForm, session: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-batch" className="text-xs">
                    ব্যাচ *
                  </Label>
                  <Input
                    id="edit-batch"
                    required
                    value={editForm.batch}
                    onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-blood" className="text-xs">
                    রক্তের গ্রুপ
                  </Label>
                  <Input
                    id="edit-blood"
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-addr" className="text-xs">
                  স্থায়ী ঠিকানা *
                </Label>
                <Input
                  id="edit-addr"
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              {/* Guardian Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">অভিভাবকের তথ্য (Primary Guardian)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="edit-g-name" className="text-[11px]">
                      অভিভাবকের নাম
                    </Label>
                    <Input
                      id="edit-g-name"
                      value={editForm.guardianName}
                      onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })}
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edit-g-rel" className="text-[11px]">
                      সম্পর্ক
                    </Label>
                    <Input
                      id="edit-g-rel"
                      value={editForm.guardianRelation}
                      onChange={(e) => setEditForm({ ...editForm, guardianRelation: e.target.value })}
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edit-g-phone" className="text-[11px]">
                      মোবাইল নম্বর
                    </Label>
                    <Input
                      id="edit-g-phone"
                      value={editForm.guardianPhone}
                      onChange={(e) => setEditForm({ ...editForm, guardianPhone: e.target.value })}
                      className="h-8 text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingStudent(null)}
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateStudentMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {updateStudentMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>পরিবর্তন সংরক্ষণ করুন</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
