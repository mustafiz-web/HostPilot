/**
 * ISOLATED TEMPORARY MOCK DATA FOR ADMIN PANEL UI PROTOTYPING
 * No backend/database logic is implemented.
 */

export interface MockStudent {
  id: string;
  studentCode: string;
  name: string;
  email: string;
  phone: string;
  roomNumber: string;
  bedCode: string;
  guardianName: string;
  guardianPhone: string;
  status: 'ACTIVE' | 'INACTIVE';
  joinDate: string;
}

export const INITIAL_MOCK_STUDENTS: MockStudent[] = [
  {
    id: 'stu-1',
    studentCode: 'HP-STU-2026-001',
    name: 'তানভীর আহমেদ',
    email: 'tanvir@example.com',
    phone: '01712345678',
    roomNumber: '১০১',
    bedCode: 'A',
    guardianName: 'রফিকুল ইসলাম',
    guardianPhone: '01812345678',
    status: 'ACTIVE',
    joinDate: '০১ জানুয়ারি, ২০২৬',
  },
  {
    id: 'stu-2',
    studentCode: 'HP-STU-2026-002',
    name: 'মাহমুদুল হাসান',
    email: 'mahmud@example.com',
    phone: '01723456789',
    roomNumber: '১০২',
    bedCode: 'A',
    guardianName: 'হাসান আলী',
    guardianPhone: '01823456789',
    status: 'ACTIVE',
    joinDate: '১৫ জানুয়ারি, ২০২৬',
  },
  {
    id: 'stu-3',
    studentCode: 'HP-STU-2026-003',
    name: 'সাকিব আল হাসান',
    email: 'sakib@example.com',
    phone: '01734567890',
    roomNumber: '২০১',
    bedCode: 'A',
    guardianName: 'খন্দকার হাসান',
    guardianPhone: '01834567890',
    status: 'ACTIVE',
    joinDate: '০১ ফেব্রুয়ারি, ২০২৬',
  },
  {
    id: 'stu-4',
    studentCode: 'HP-STU-2026-004',
    name: 'আব্দুল্লাহ আল নোমান',
    email: 'noman@example.com',
    phone: '01745678901',
    roomNumber: '২০১',
    bedCode: 'B',
    guardianName: 'মোঃ আব্দুল্লাহ',
    guardianPhone: '01845678901',
    status: 'ACTIVE',
    joinDate: '১০ ফেব্রুয়ারি, ২০২৬',
  },
  {
    id: 'stu-5',
    studentCode: 'HP-STU-2025-089',
    name: 'জাফর ইকবাল',
    email: 'zafar@example.com',
    phone: '01756789012',
    roomNumber: '১০১',
    bedCode: 'A',
    guardianName: 'আনোয়ার হোসেন',
    guardianPhone: '01856789012',
    status: 'INACTIVE',
    joinDate: '০১ জুলাই, ২০২৫',
  },
];

export interface MockAdmissionApp {
  id: string;
  applicationNumber: string;
  applicantName: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  preferredRoomType: 'SINGLE' | 'DOUBLE' | 'QUAD';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
}

export const INITIAL_MOCK_ADMISSIONS: MockAdmissionApp[] = [
  {
    id: 'adm-101',
    applicationNumber: 'ADM-2026-8912',
    applicantName: 'জুবায়ের হোসেন',
    email: 'zubayer@example.com',
    phone: '01788990011',
    guardianName: 'মোঃ হোসেন আলী',
    guardianPhone: '01888990011',
    preferredRoomType: 'SINGLE',
    status: 'PENDING',
    appliedAt: '১৭ নভেম্বর, ২০২৬',
  },
  {
    id: 'adm-102',
    applicationNumber: 'ADM-2026-7845',
    applicantName: 'রাফসান আহমেদ',
    email: 'rafsan@example.com',
    phone: '01799001122',
    guardianName: 'কামাল আহমেদ',
    guardianPhone: '01899001122',
    preferredRoomType: 'DOUBLE',
    status: 'APPROVED',
    appliedAt: '১৬ নভেম্বর, ২০২৬',
  },
  {
    id: 'adm-103',
    applicationNumber: 'ADM-2026-6734',
    applicantName: 'আসিফ মাহমুদ',
    email: 'asif@example.com',
    phone: '01711223344',
    guardianName: 'মাহমুদ আলম',
    guardianPhone: '01811223344',
    preferredRoomType: 'QUAD',
    status: 'PENDING',
    appliedAt: '১৫ নভেম্বর, ২০২৬',
  },
  {
    id: 'adm-104',
    applicationNumber: 'ADM-2026-5621',
    applicantName: 'নাজমুল হুদা',
    email: 'nazmul@example.com',
    phone: '01722334455',
    guardianName: 'শামসুল হুদা',
    guardianPhone: '01822334455',
    preferredRoomType: 'DOUBLE',
    status: 'REJECTED',
    appliedAt: '১২ নভেম্বর, ২০২৬',
  },
];

export interface MockBed {
  id: string;
  bedCode: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  studentName?: string;
}

export interface MockAdminRoom {
  id: string;
  roomNumber: string;
  floor: number;
  type: 'SINGLE' | 'DOUBLE' | 'QUAD';
  capacity: number;
  monthlyRent: number;
  status: 'AVAILABLE' | 'FULL' | 'MAINTENANCE';
  beds: MockBed[];
}

export const INITIAL_MOCK_ROOMS: MockAdminRoom[] = [
  {
    id: 'r-1',
    roomNumber: '১০১',
    floor: 1,
    type: 'SINGLE',
    capacity: 1,
    monthlyRent: 8000,
    status: 'FULL',
    beds: [{ id: 'b-101-a', bedCode: 'A', status: 'OCCUPIED', studentName: 'তানভীর আহমেদ' }],
  },
  {
    id: 'r-2',
    roomNumber: '১০২',
    floor: 1,
    type: 'DOUBLE',
    capacity: 2,
    monthlyRent: 5000,
    status: 'AVAILABLE',
    beds: [
      { id: 'b-102-a', bedCode: 'A', status: 'OCCUPIED', studentName: 'মাহমুদুল হাসান' },
      { id: 'b-102-b', bedCode: 'B', status: 'AVAILABLE' },
    ],
  },
  {
    id: 'r-3',
    roomNumber: '২০১',
    floor: 2,
    type: 'QUAD',
    capacity: 4,
    monthlyRent: 3500,
    status: 'AVAILABLE',
    beds: [
      { id: 'b-201-a', bedCode: 'A', status: 'OCCUPIED', studentName: 'সাকিব আল হাসান' },
      { id: 'b-201-b', bedCode: 'B', status: 'OCCUPIED', studentName: 'আব্দুল্লাহ আল নোমান' },
      { id: 'b-201-c', bedCode: 'C', status: 'AVAILABLE' },
      { id: 'b-201-d', bedCode: 'D', status: 'AVAILABLE' },
    ],
  },
  {
    id: 'r-4',
    roomNumber: '২০২',
    floor: 2,
    type: 'DOUBLE',
    capacity: 2,
    monthlyRent: 5000,
    status: 'MAINTENANCE',
    beds: [
      { id: 'b-202-a', bedCode: 'A', status: 'MAINTENANCE' },
      { id: 'b-202-b', bedCode: 'B', status: 'MAINTENANCE' },
    ],
  },
];

export interface MockAllocation {
  id: string;
  studentName: string;
  studentCode: string;
  roomNumber: string;
  bedCode: string;
  startDate: string;
  endDate: string | null;
  status: 'ACTIVE' | 'VACATED';
}

export const INITIAL_MOCK_ALLOCATIONS: MockAllocation[] = [
  {
    id: 'alloc-1',
    studentName: 'তানভীর আহমেদ',
    studentCode: 'HP-STU-2026-001',
    roomNumber: '১০১',
    bedCode: 'A',
    startDate: '০১ জানুয়ারি, ২০২৬',
    endDate: null,
    status: 'ACTIVE',
  },
  {
    id: 'alloc-2',
    studentName: 'মাহমুদুল হাসান',
    studentCode: 'HP-STU-2026-002',
    roomNumber: '১০২',
    bedCode: 'A',
    startDate: '১৫ জানুয়ারি, ২০২৬',
    endDate: null,
    status: 'ACTIVE',
  },
  {
    id: 'alloc-3',
    studentName: 'সাকিব আল হাসান',
    studentCode: 'HP-STU-2026-003',
    roomNumber: '২০১',
    bedCode: 'A',
    startDate: '০১ ফেব্রুয়ারি, ২০২৬',
    endDate: null,
    status: 'ACTIVE',
  },
  {
    id: 'alloc-4',
    studentName: 'জাফর ইকবাল (প্রাক্তন)',
    studentCode: 'HP-STU-2025-089',
    roomNumber: '১০১',
    bedCode: 'A',
    startDate: '০১ জুলাই, ২০২৫',
    endDate: '৩১ ডিসেম্বর, ২০২৫',
    status: 'VACATED',
  },
];

export interface MockPayment {
  id: string;
  receiptNumber: string;
  studentName: string;
  studentCode: string;
  roomNumber: string;
  billingPeriod: string;
  amount: number;
  paidAmount: number;
  status: 'PAID' | 'DUE' | 'PARTIAL';
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'BKASH';
  paidAt: string;
}

export const INITIAL_MOCK_PAYMENTS: MockPayment[] = [
  {
    id: 'pay-1',
    receiptNumber: 'RCP-2026-1045',
    studentName: 'তানভীর আহমেদ',
    studentCode: 'HP-STU-2026-001',
    roomNumber: '১০১',
    billingPeriod: 'নভেম্বর ২০২৬',
    amount: 8000,
    paidAmount: 8000,
    status: 'PAID',
    paymentMethod: 'BKASH',
    paidAt: '০২ নভেম্বর, ২০২৬',
  },
  {
    id: 'pay-2',
    receiptNumber: 'RCP-2026-1046',
    studentName: 'মাহমুদুল হাসান',
    studentCode: 'HP-STU-2026-002',
    roomNumber: '১০২',
    billingPeriod: 'নভেম্বর ২০২৬',
    amount: 5000,
    paidAmount: 5000,
    status: 'PAID',
    paymentMethod: 'CASH',
    paidAt: '০৩ নভেম্বর, ২০২৬',
  },
  {
    id: 'pay-3',
    receiptNumber: 'RCP-2026-1047',
    studentName: 'সাকিব আল হাসান',
    studentCode: 'HP-STU-2026-003',
    roomNumber: '২০১',
    billingPeriod: 'নভেম্বর ২০২৬',
    amount: 3500,
    paidAmount: 2000,
    status: 'PARTIAL',
    paymentMethod: 'CASH',
    paidAt: '০৫ নভেম্বর, ২০২৬',
  },
  {
    id: 'pay-4',
    receiptNumber: 'RCP-2026-1048',
    studentName: 'আব্দুল্লাহ আল নোমান',
    studentCode: 'HP-STU-2026-004',
    roomNumber: '২০১',
    billingPeriod: 'নভেম্বর ২০২৬',
    amount: 3500,
    paidAmount: 0,
    status: 'DUE',
    paymentMethod: 'CASH',
    paidAt: '—',
  },
];

export interface MockExpense {
  id: string;
  title: string;
  category: 'UTILITIES' | 'MAINTENANCE' | 'FOOD' | 'STAFF_SALARY' | 'OTHER';
  categoryLabel: string;
  amount: number;
  expenseDate: string;
  recordedBy: string;
}

export const INITIAL_MOCK_EXPENSES: MockExpense[] = [
  {
    id: 'exp-1',
    title: 'অক্টোবর মাসের বিদ্যুৎ বিল',
    category: 'UTILITIES',
    categoryLabel: 'বিদ্যুৎ ও গ্যাস',
    amount: 42500,
    expenseDate: '০৫ নভেম্বর, ২০২৬',
    recordedBy: 'Admin (Md. Kamrul)',
  },
  {
    id: 'exp-2',
    title: '২য় তলার ওয়াশরুম প্লাম্বিং মেরামত',
    category: 'MAINTENANCE',
    categoryLabel: 'রক্ষণাবেক্ষণ',
    amount: 6800,
    expenseDate: '০৮ নভেম্বর, ২০২৬',
    recordedBy: 'Admin (Md. Kamrul)',
  },
  {
    id: 'exp-3',
    title: 'ডাইনিং রেশনের চাল ও ডাল ক্রয়',
    category: 'FOOD',
    categoryLabel: 'খাদ্য ও ডাইনিং',
    amount: 78000,
    expenseDate: '১০ নভেম্বর, ২০২৬',
    recordedBy: 'Caretaker (Abdul Hannan)',
  },
  {
    id: 'exp-4',
    title: 'ফাইবার অপটিক ওয়াইফাই মাসিক বিল',
    category: 'UTILITIES',
    categoryLabel: 'ইন্টারনেট',
    amount: 12000,
    expenseDate: '১২ নভেম্বর, ২০২৬',
    recordedBy: 'Admin (Md. Kamrul)',
  },
];

export interface MockComplaint {
  id: string;
  ticketNo: string;
  studentName: string;
  roomNumber: string;
  subject: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

export const INITIAL_MOCK_COMPLAINTS: MockComplaint[] = [
  {
    id: 'comp-1',
    ticketNo: 'CMP-2026-081',
    studentName: 'তানভীর আহমেদ',
    roomNumber: '১০১',
    subject: 'সিলিং ফ্যানের রেগুলেটর সমস্যা',
    description: 'রুমের সিলিং ফ্যানের রেগুলেটর কাজ করছে না, সর্বদা সর্বোচ্চ গতিতে ঘুরছে।',
    status: 'IN_PROGRESS',
    createdAt: '১৭ নভেম্বর, ২০২৬',
  },
  {
    id: 'comp-2',
    ticketNo: 'CMP-2026-079',
    studentName: 'মাহমুদুল হাসান',
    roomNumber: '১০২',
    subject: '১ম তলার ওয়াশরুমের পানির ট্যাপ লিকেজ',
    description: 'ট্যাপ দিয়ে অনবরত পানি পড়ছে, জরুরি মেরামত প্রয়োজন।',
    status: 'RESOLVED',
    createdAt: '১৫ নভেম্বর, ২০২৬',
  },
  {
    id: 'comp-3',
    ticketNo: 'CMP-2026-075',
    studentName: 'সাকিব আল হাসান',
    roomNumber: '২০১',
    subject: 'স্টাডি কর্নারে টিউবলাইট পরিবর্তন',
    description: '২০১ নং রুমের টেবিলের টিউবলাইটটি নষ্ট হয়ে গেছে।',
    status: 'PENDING',
    createdAt: '১৮ নভেম্বর, ২০২৬',
  },
];
