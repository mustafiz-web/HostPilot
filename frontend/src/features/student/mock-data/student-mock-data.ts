export interface MockStudentProfile {
  id: string;
  studentCode: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  rollNumber: string;
  session: string;
  batch: string;
  bloodGroup: string;
  address: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  emergencyContact: string;
  avatarUrl?: string;
  joinedDate: string;
}

export interface MockRoommate {
  id: string;
  name: string;
  studentCode: string;
  bedCode: string;
  department: string;
  phone: string;
  isSelf: boolean;
}

export interface MockStudentAllocation {
  roomNumber: string;
  floor: number;
  floorName: string;
  roomType: 'SINGLE' | 'DOUBLE' | 'QUAD';
  bedCode: string;
  monthlyRent: number;
  allocatedDate: string;
  amenities: string[];
  blockName: string;
  roommates: MockRoommate[];
}

export interface MockStudentInvoice {
  id: string;
  receiptNumber: string;
  billingPeriod: string;
  amount: number;
  paidAmount: number;
  status: 'PAID' | 'DUE' | 'PARTIAL';
  paidAt?: string;
  paymentMethod?: 'BKASH' | 'NAGAD' | 'BANK_TRANSFER' | 'CASH';
  trxId?: string;
  description: string;
}

export interface MockStudentComplaint {
  id: string;
  title: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'CLEANING' | 'DINING' | 'WIFI' | 'FURNITURE' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  submittedAt: string;
  resolvedAt?: string;
  description: string;
  adminNote?: string;
}

export interface MockStudentNotice {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
  isPinned: boolean;
  content: string;
  author: string;
}

export const CURRENT_STUDENT_PROFILE: MockStudentProfile = {
  id: 'stu-current-001',
  studentCode: 'HP-STU-2026-001',
  name: 'তানভীর আহমেদ',
  email: 'tanvir.ahmed@campus.edu.bd',
  phone: '০১৭১১-২২৩৩৪৪',
  department: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (CSE)',
  rollNumber: '2022-CSE-045',
  session: '২০২২-২০২৩',
  batch: '২৩তম ব্যাচ',
  bloodGroup: 'B+',
  address: 'বাসা ১২, রোড ৪, সেক্টর ৭, উত্তরা, ঢাকা-১২৩০',
  guardianName: 'মো. রফিকুল ইসলাম',
  guardianRelation: 'পিতা',
  guardianPhone: '০১৮১১-৯৮৭৬৫৪',
  emergencyContact: '০১৮১১-৯৮৭৬৫৪',
  joinedDate: '০১ জানুয়ারি, ২০২৬',
};

export const CURRENT_STUDENT_ALLOCATION: MockStudentAllocation = {
  roomNumber: '১০১',
  floor: 1,
  floorName: '১ম তলা (গ্রাউন্ড ফ্লোরের উপরে)',
  roomType: 'DOUBLE',
  bedCode: 'A',
  monthlyRent: 8000,
  allocatedDate: '০১ জানুয়ারি, ২০২৬',
  blockName: 'নজরুল ব্লক (উত্তর উইং)',
  amenities: [
    'হাই-স্পিড অপটিক্যাল ফাইবার ওয়াইফাই',
    'স্বতন্ত্র রিডিং টেবিল ও আরামদায়ক চেয়ার',
    'ব্যক্তিগত তালাযুক্ত স্টিল আলমারি',
    'প্রাকৃতিক আলো-বাতাসযুক্ত প্রশস্ত বারান্দা',
    'সংযুক্ত টাইটেল ওয়াশরুম ও গিজার',
  ],
  roommates: [
    {
      id: 'rm-1',
      name: 'তানভীর আহমেদ',
      studentCode: 'HP-STU-2026-001',
      bedCode: 'A',
      department: 'CSE (২৩তম ব্যাচ)',
      phone: '০১৭১১-২২৩৩৪৪',
      isSelf: true,
    },
    {
      id: 'rm-2',
      name: 'মেহেদী হাসান',
      studentCode: 'HP-STU-2026-002',
      bedCode: 'B',
      department: 'EEE (২৪তম ব্যাচ)',
      phone: '০১৭২২-৩৩৪৪৫৫',
      isSelf: false,
    },
  ],
};

export const INITIAL_STUDENT_INVOICES: MockStudentInvoice[] = [
  {
    id: 'inv-due-12',
    receiptNumber: 'INV-2026-1201',
    billingPeriod: 'ডিসেম্বর ২০২৬ (আসন্ন মাস)',
    amount: 8000,
    paidAmount: 0,
    status: 'DUE',
    description: '১০১ নম্বর রুমের (বেড A) মাসিক সিট ভাড়া ও ইউটিলিটি চার্জ',
  },
  {
    id: 'inv-nov-11',
    receiptNumber: 'RCP-2026-1101',
    billingPeriod: 'নভেম্বর ২০২৬',
    amount: 8000,
    paidAmount: 8000,
    status: 'PAID',
    paidAt: '০৩ নভেম্বর, ২০২৬',
    paymentMethod: 'BKASH',
    trxId: 'BK9X274LAQ',
    description: '১০১ নম্বর রুমের (বেড A) মাসিক সিট ভাড়া ও সার্ভিস চার্জ',
  },
  {
    id: 'inv-oct-10',
    receiptNumber: 'RCP-2026-1001',
    billingPeriod: 'অক্টোবর ২০২৬',
    amount: 8000,
    paidAmount: 8000,
    status: 'PAID',
    paidAt: '০২ অক্টোবর, ২০২৬',
    paymentMethod: 'BKASH',
    trxId: 'BK8W163KZP',
    description: '১০১ নম্বর রুমের (বেড A) মাসিক সিট ভাড়া ও সার্ভিস চার্জ',
  },
  {
    id: 'inv-sep-09',
    receiptNumber: 'RCP-2026-0901',
    billingPeriod: 'সেপ্টেম্বর ২০২৬',
    amount: 8000,
    paidAmount: 8000,
    status: 'PAID',
    paidAt: '০৪ সেপ্টেম্বর, ২০২৬',
    paymentMethod: 'BANK_TRANSFER',
    trxId: 'DBBL-TRX-55421',
    description: '১০১ নম্বর রুমের (বেড A) মাসিক সিট ভাড়া',
  },
];

export const INITIAL_STUDENT_COMPLAINTS: MockStudentComplaint[] = [
  {
    id: 'cmp-1',
    title: 'ওয়াশরুমের বেসিন ট্যাপ দিয়ে পানি পড়ছে',
    category: 'PLUMBING',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    submittedAt: '১৭ নভেম্বর, ২০২৬',
    description: '১০১ নম্বর রুমের বাথরুমের বেসিনের নিচের জয়েন্ট লুজ হয়ে ফোটা ফোটা পানি পড়ছে। ফলে মেঝে ভিজে যাচ্ছে। দ্রুত মেরামত প্রয়োজন।',
    adminNote: 'অভিযোগটি গ্রহণ করা হয়েছে। দায়িত্বপ্রাপ্ত প্লাম্বার মো. জসিম সাহেবকে পাঠানো হচ্ছে।',
  },
  {
    id: 'cmp-2',
    title: 'সিলিং ফ্যানের রেগুলেটর কাজ করছে না',
    category: 'ELECTRICAL',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    submittedAt: '০৫ নভেম্বর, ২০২৬',
    resolvedAt: '০৭ নভেম্বর, ২০২৬',
    description: 'ফ্যানের রেগুলেটর ঘুরালেও স্পিড নিয়ন্ত্রণে আসছে না, ফুল স্পিডে চলছে।',
    adminNote: 'ইলেকট্রিশিয়ান দ্বারা পুরাতন রেগুলেটর পরিবর্তন করে নতুন সুইচ বোর্ড স্থাপন করা হয়েছে।',
  },
  {
    id: 'cmp-3',
    title: 'ডাইনিং এ রাতের খাবার পরিবেশনের সময়সূচি নিয়ে সমস্যা',
    category: 'DINING',
    priority: 'LOW',
    status: 'RESOLVED',
    submittedAt: '১২ অক্টোবর, ২০২৬',
    resolvedAt: '১৩ অক্টোবর, ২০২৬',
    description: 'রাতের শিফটের ক্লাসের কারণে রাত ৯:৩০ এর মধ্যে খাবার পেতে একটু বিলম্ব হয়।',
    adminNote: 'ডাইনিং ম্যানেজারকে রাত ১০:০০ টা পর্যন্ত মিল কাউন্টার উন্মুক্ত রাখার নির্দেশনা প্রদান করা হয়েছে।',
  },
];

export const STUDENT_NOTICES: MockStudentNotice[] = [
  {
    id: 'sn-1',
    title: 'নতুন শিক্ষাবর্ষের হোস্টেল সিট নবায়ন ও আবেদন সংক্রান্ত বিজ্ঞপ্তি',
    category: 'ভর্তি ও সিট নবায়ন',
    publishedAt: '১৮ নভেম্বর, ২০২৬',
    isPinned: true,
    author: 'হোস্টেল প্রভোস্ট কার্যালয়',
    content: 'সকল আবাসিক শিক্ষার্থীদের জানানো যাচ্ছে যে, আগামী শিক্ষাবর্ষের জন্য বার্ষিক সিট নবায়ন প্রক্রিয়া শুরু হয়েছে। সকল বকেয়া পরিশোধ সাপেক্ষে আগামী ৩০ নভেম্বরের মধ্যে স্টুডেন্ট পোর্টাল থেকে নবায়ন আবেদন সম্পন্ন করতে হবে।',
  },
  {
    id: 'sn-2',
    title: 'হোস্টেল ডাইনিং মিল চার্জ ও শীতকালীন পুষ্টিকর মেনু হালনাগাদ',
    category: 'ডাইনিং ও খাদ্য',
    publishedAt: '১৫ নভেম্বর, ২০২৬',
    isPinned: true,
    author: 'ডাইনিং পরিচালনা কমিটি',
    content: 'আগামী ১ ডিসেম্বর থেকে শীতকালীন স্পেশাল মিল ডায়েট ও পুষ্টিকর মেনু কার্যকর হবে। শিক্ষার্থীদের মতামত নিয়ে নতুন তালিকা কমন ডাইনিং বোর্ডে টানানো হয়েছে। কোনো মিল বাতিল করতে হলে ১২ ঘণ্টা পূর্বে পোর্টালে অবহিত করতে হবে।',
  },
  {
    id: 'sn-3',
    title: 'শীতকালীন অবকাশে হোস্টেল চত্বর সংস্কার ও বিদ্যুৎ সাশ্রয় নির্দেশিকা',
    category: 'সাধারণ প্রশাসনিক',
    publishedAt: '১০ নভেম্বর, ২০২৬',
    isPinned: false,
    author: 'হোস্টেল সুপারিনটেনডেন্ট',
    content: 'আসন্ন শীতকালীন ছুটির সময়ে হোস্টেলের সার্বিক রং ও মেরামতের কাজ চলবে। রুম ছেড়ে যাওয়ার সময় ব্যক্তিগত মূল্যবান দ্রব্যাদি সুরক্ষিত রাখা এবং রুমের সকল লাইট, ফ্যান ও গিজার সুইচ বন্ধ রাখার জন্য কঠোর নির্দেশনা দেওয়া হচ্ছে।',
  },
];

export const HOSTEL_RULES_DATA = {
  gateClosingTime: 'রাত ১০:০০ টা (শুক্রবার ও ছুটির দিনে রাত ১০:৩০ টা)',
  diningTimes: [
    { meal: 'সকালের নাশতা (Breakfast)', time: 'সকাল ০৭:৩০ টা — সকাল ০৯:৩০ টা' },
    { meal: 'দুপুরের খাবার (Lunch)', time: 'দুপুর ১২:৩০ টা — দুপুর ০২:৩০ টা' },
    { meal: 'সান্ধ্য চা ও নাশতা (Evening Snacks)', time: 'বিকেল ০৫:৩০ টা — সন্ধ্যা ০৬:৩০ টা' },
    { meal: 'রাতের খাবার (Dinner)', time: 'রাত ০৮:০০ টা — রাত ১০:০০ টা' },
  ],
  rulesList: [
    'রাত ১০:০০ টার পর হোস্টেলের প্রধান ফটক বন্ধ থাকবে। বিশেষ প্রয়োজনে ওয়ার্ডেনের পূর্বানুমতি ব্যতিরেকে বিলম্ব গ্রহণযোগ্য নয়।',
    'রুমের ভেতর কোনো প্রকার অতিরিক্ত উচ্চ ক্ষমতাসম্পন্ন হিটার, ইন্ডাকশন চুলা বা অবৈধ ইলেকট্রিক সরঞ্জাম ব্যবহার সম্পূর্ণ নিষিদ্ধ।',
    'রাত ১১:০০ টা থেকে সকাল ০৬:০০ টা পর্যন্ত স্টাডি ও সাইলেন্স আওয়ার হিসেবে গণ্য হবে; কোনো ধরনের উচ্চশব্দ বা হইচই করা যাবে না।',
    'হোস্টেল চত্বর সম্পূর্ণ ধূমপান ও মাদকমুক্ত এলাকা। যে কোনো অসদাচরণের জন্য সিট বরাদ্দ বাতিল ও বহিষ্কারের শাস্তিমূলক ব্যবস্থা গ্রহণ করা হবে।',
    'বহিরাগত বা অনাবাসিক অতিথিকে রুমে রাখা সম্পূর্ণ বেআইনি। অভিভাবকগণ কেবল কমন লাউঞ্জে সাক্ষাৎ করতে পারবেন।',
    'মাসিক সিট ভাড়া ও সার্ভিস চার্জ প্রতি মাসের ৭ তারিখের মধ্যে পরিশোধ করতে হবে।',
  ],
  emergencyContacts: [
    { title: 'হোস্টেল সুপারিনটেনডেন্ট', name: 'অধ্যাপক ড. মুহাম্মদ আলমগীর', phone: '০১৭১১-১০০০০১', email: 'superintendent@campus.edu.bd' },
    { title: 'সহকারী ওয়ার্ডেন (প্রশাসন ও শৃঙ্খলা)', name: 'জনাব কাজী মোসাদ্দেক হোসেন', phone: '০১৮১১-২০০০০২', email: 'warden.admin@campus.edu.bd' },
    { title: 'ক্যাম্পাস মেডিকেল সেন্টার (২৪/৭ জরুরি)', name: 'মেডিকেল অফিসার অন-ডিউটি', phone: '০১৭২২-৩০০০০৩', email: 'medical@campus.edu.bd' },
    { title: 'হোস্টেল প্রধান সিকিউরিটি পোস্ট', name: 'নিরাপত্তা নিয়ন্ত্রণ কক্ষ', phone: '০১৯৩৩-৪০০০০৪', email: 'security@campus.edu.bd' },
  ],
};
