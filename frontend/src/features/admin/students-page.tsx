import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Plus,
  Search,
  Eye,
  Pencil,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
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
import { formatNumber } from '@/lib/formatters';

interface StudentItem {
  id: string;
  studentCode: string;
  phone: string;
  department: string;
  rollNumber: string;
  session: string;
  batch: string;
  bloodGroup?: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
  user: {
    name: string;
    email: string;
  };
  activeAllocation?: {
    id: string;
    room?: { roomNumber: string };
    bed?: { bedCode: string };
  } | null;
  guardians: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
}

interface StudentsResponse {
  students: StudentItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const StudentsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const queryClient = useQueryClient();

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Form State: Add Student
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    studentCode: '',
    department: 'Computer Science and Engineering',
    rollNumber: '',
    session: '2023-24',
    batch: 'Batch 24',
    bloodGroup: 'B+',
    address: '',
    guardianName: '',
    guardianRelation: isEn ? 'Father' : 'পিতা',
    guardianPhone: '',
  });

  // Form State: Edit Student
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
  });

  // Query: Fetch Students with pagination and filters
  const {
    data: studentsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-students', { page, limit, status: statusFilter, search: searchTerm }],
    queryFn: async () => {
      const params: any = {
        page,
        limit,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchTerm.trim() || undefined,
      };
      const res = await apiClient.get<StudentsResponse>('/students', params);
      return res;
    },
    staleTime: 30 * 1000,
  });

  const students = studentsResponse?.data?.students || [];
  const meta = studentsResponse?.data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Mutation: Add Student
  const addStudentMutation = useMutation({
    mutationFn: async (payload: typeof newStudent) => {
      const res = await apiClient.post('/students', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      setAddModalOpen(false);
      setAddError(null);
      setNewStudent({
        name: '',
        email: '',
        phone: '',
        studentCode: '',
        department: 'Computer Science and Engineering',
        rollNumber: '',
        session: '2023-24',
        batch: 'Batch 24',
        bloodGroup: 'B+',
        address: '',
        guardianName: '',
        guardianRelation: isEn ? 'Father' : 'পিতা',
        guardianPhone: '',
      });
    },
    onError: (err: any) => {
      setAddError(err.message || t('common.error_occurred'));
    },
  });

  // Mutation: Update Student
  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: typeof editForm }) => {
      const res = await apiClient.patch(`/students/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      setEditingStudent(null);
      setEditError(null);
    },
    onError: (err: any) => {
      setEditError(err.message || t('common.error_occurred'));
    },
  });

  // Mutation: Toggle Status (Deactivate / Activate)
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, nextStatus }: { id: string; nextStatus: 'ACTIVE' | 'INACTIVE' }) => {
      const res = await apiClient.patch(`/students/${id}`, { status: nextStatus });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
    },
    onError: (err: any) => {
      alert(err.message || t('common.error_occurred'));
    },
  });

  const handleOpenEdit = (student: StudentItem) => {
    setEditingStudent(student);
    setEditForm({
      name: student.user?.name || '',
      phone: student.phone || '',
      department: student.department || '',
      rollNumber: student.rollNumber || '',
      session: student.session || '',
      batch: student.batch || '',
      bloodGroup: student.bloodGroup || '',
      address: student.address || '',
      guardianName: student.guardians?.[0]?.name || '',
      guardianRelation: student.guardians?.[0]?.relationship || '',
      guardianPhone: student.guardians?.[0]?.phone || '',
    });
    setEditError(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    addStudentMutation.mutate(newStudent);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setEditError(null);
    updateStudentMutation.mutate({ id: editingStudent.id, payload: editForm });
  };

  const handleToggleStatus = (student: StudentItem) => {
    const nextStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    toggleStatusMutation.mutate({ id: student.id, nextStatus });
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 text-xs text-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('common.refresh')}</span>
          </Button>
          <Button
            onClick={() => {
              setAddError(null);
              setAddModalOpen(true);
            }}
            className="gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.students.btn_add_student', 'Add Student')}</span>
          </Button>
        </div>
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
              <span>{t('common.loading')}</span>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm text-slate-700 font-medium">
              {(error as any)?.message || t('common.error_occurred')}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('common.retry')}</span>
            </Button>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">{t('admin.students.empty_students')}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? (isEn ? 'No records match your search criteria.' : 'আপনার সার্চ টার্মের সাথে মিল রেখে কোনো রেকর্ড পাওয়া যায়নি।')
                : (isEn ? 'No students registered currently. Click the button above to add a student.' : 'বর্তমানে কোনো শিক্ষার্থী নিবন্ধিত নেই। নতুন শিক্ষার্থী যুক্ত করতে ওপরের বাটন চাপুন।')}
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
                          {t('student.profile.roll_number')}: {student.rollNumber} • {student.session}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        {student.activeAllocation ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {t('student.room.room_number', { number: student.activeAllocation.room?.roomNumber })} ({t('student.room.bed')} {student.activeAllocation.bed?.bedCode})
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">{t('student.room.not_allocated')}</span>
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
                            title={isEn ? 'View Details' : 'বিস্তারিত দেখুন'}
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleOpenEdit(student)}
                            title={isEn ? 'Edit Information' : 'তথ্য পরিবর্তন করুন (Edit)'}
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
                            title={student.status === 'ACTIVE' ? t('admin.students.btn_deactivate') : t('admin.students.btn_activate')}
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
                  {isEn
                    ? `Showing ${((meta.page - 1) * meta.limit) + 1} - ${Math.min(meta.page * meta.limit, meta.total)} of ${formatNumber(meta.total)} students`
                    : `মোট ${meta.total} জন শিক্ষার্থীর মধ্যে ${((meta.page - 1) * meta.limit) + 1} - ${Math.min(meta.page * meta.limit, meta.total)} প্রদর্শিত হচ্ছে`}
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
                    <span>{isEn ? 'Previous' : 'পূর্ববর্তী'}</span>
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
                    <span>{isEn ? 'Next' : 'পরবর্তী'}</span>
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
              <Users className="w-5 h-5 text-emerald-600" />
              <span>{isEn ? 'Add New Student' : 'নতুন শিক্ষার্থী নিবন্ধন (Add Student)'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {isEn ? 'Create student profile and login user account in one step.' : 'শিক্ষার্থী প্রোফাইল এবং লগইন ইউজার অ্যাকাউন্ট একবারে তৈরি করা হবে।'}
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
                  {t('student.profile.full_name')} *
                </Label>
                <Input
                  id="stu-name"
                  required
                  placeholder={isEn ? 'e.g. Tanvir Ahmed' : 'e.g. তানভীর আহমেদ'}
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="stu-code" className="text-xs">
                  {t('auth.student_id_label')} *
                </Label>
                <Input
                  id="stu-code"
                  required
                  placeholder="e.g. STU-2024-001"
                  value={newStudent.studentCode}
                  onChange={(e) => setNewStudent({ ...newStudent, studentCode: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="stu-email" className="text-xs">
                  {t('student.profile.email')} *
                </Label>
                <Input
                  id="stu-email"
                  type="email"
                  required
                  placeholder="student@campus.edu.bd"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="stu-phone" className="text-xs">
                  {t('student.profile.phone')} *
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
                  {t('student.profile.department')} *
                </Label>
                <Input
                  id="stu-dept"
                  required
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="stu-roll" className="text-xs">
                  {t('student.profile.roll_number')} *
                </Label>
                <Input
                  id="stu-roll"
                  required
                  placeholder="e.g. 2024101"
                  value={newStudent.rollNumber}
                  onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="stu-session" className="text-xs">
                  {t('student.profile.session')} & {t('student.profile.batch')} *
                </Label>
                <Input
                  id="stu-session"
                  required
                  placeholder="e.g. 2022-23 (Batch 23)"
                  value={newStudent.session}
                  onChange={(e) => setNewStudent({ ...newStudent, session: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="stu-blood" className="text-xs">
                  {t('student.profile.blood_group')}
                </Label>
                <Input
                  id="stu-blood"
                  placeholder="e.g. A+, B+, O+"
                  value={newStudent.bloodGroup}
                  onChange={(e) => setNewStudent({ ...newStudent, bloodGroup: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="stu-addr" className="text-xs">
                {t('student.profile.address')} *
              </Label>
              <Input
                id="stu-addr"
                required
                placeholder={isEn ? 'Village/Street, Post, Thana & District' : 'গ্রাম/বাড়ি, ডাকঘর, থানা ও জেলা'}
                value={newStudent.address}
                onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            {/* Guardian Info */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">{t('student.profile.guardian_info')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="g-name" className="text-[11px]">
                    {t('student.profile.guardian_name')} *
                  </Label>
                  <Input
                    id="g-name"
                    required
                    placeholder={isEn ? 'Guardian Name' : 'নাম'}
                    value={newStudent.guardianName}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianName: e.target.value })}
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="g-rel" className="text-[11px]">
                    {isEn ? 'Relationship *' : 'সম্পর্ক *'}
                  </Label>
                  <Input
                    id="g-rel"
                    required
                    placeholder={isEn ? 'e.g. Father/Mother' : 'e.g. পিতা/মাতা'}
                    value={newStudent.guardianRelation}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianRelation: e.target.value })}
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="g-phone" className="text-[11px]">
                    {t('student.profile.guardian_phone')} *
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
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={addStudentMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {addStudentMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <span>{t('common.save')}</span>
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
                <span>{t('admin.students.dialog_detail_title')}</span>
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
                  <span className="text-[10px] text-slate-400 block uppercase">{t('admin.students.th_academic')}</span>
                  <p className="font-semibold text-slate-800">{selectedStudent.department}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{t('student.profile.roll_number')}: {selectedStudent.rollNumber}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">{t('admin.students.th_contact')}</span>
                  <p className="font-semibold text-slate-800">{selectedStudent.phone}</p>
                  <p className="text-[11px] text-slate-500 truncate">{selectedStudent.user?.email}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">{t('student.profile.blood_group')}</span>
                  <p className="font-semibold text-slate-800">{selectedStudent.bloodGroup || 'N/A'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block uppercase">{t('admin.students.th_room')}</span>
                  <p className="font-semibold text-slate-800">
                    {selectedStudent.activeAllocation
                      ? t('student.room.room_number', { number: selectedStudent.activeAllocation.room?.roomNumber })
                      : t('student.room.not_allocated')}
                  </p>
                </div>
              </div>

              {selectedStudent.guardians && selectedStudent.guardians.length > 0 && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-800 font-bold block uppercase mb-1">
                    {t('student.profile.guardian_info')}
                  </span>
                  <p className="font-semibold text-slate-900">
                    {selectedStudent.guardians[0].name} ({selectedStudent.guardians[0].relationship})
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono">
                    {t('student.profile.guardian_phone')}: {selectedStudent.guardians[0].phone}
                  </p>
                </div>
              )}

              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 block uppercase">{t('student.profile.address')}</span>
                <p className="text-slate-800">{selectedStudent.address}</p>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setSelectedStudent(null)}>
                {t('common.close')}
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
                <span>{isEn ? 'Edit Student Information' : 'শিক্ষার্থীর তথ্য পরিবর্তন (Edit Student Information)'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {isEn ? 'Update student personal, academic, and guardian records.' : 'শিক্ষার্থীর ব্যক্তিগত, অ্যাকাডেমিক এবং অভিভাবকের অনুমোদিত তথ্য আপডেট করুন।'}
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
                    {t('student.profile.full_name')} *
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
                    {t('student.profile.phone')} *
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
                    {t('student.profile.department')} *
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
                    {t('student.profile.roll_number')} *
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
                    {t('student.profile.session')} *
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
                    {t('student.profile.batch')} *
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
                    {t('student.profile.blood_group')}
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
                  {t('student.profile.address')} *
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
                <h4 className="text-xs font-bold text-slate-800">{t('student.profile.guardian_info')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="edit-g-name" className="text-[11px]">
                      {t('student.profile.guardian_name')}
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
                      {isEn ? 'Relationship' : 'সম্পর্ক'}
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
                      {t('student.profile.guardian_phone')}
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
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateStudentMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {updateStudentMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>{t('common.loading')}</span>
                    </>
                  ) : (
                    <span>{t('common.save')}</span>
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
