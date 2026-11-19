/**
 * TEMPORARY MOCK DATA FOR UI PROTOTYPING ONLY
 * This file contains strictly isolated mock records for public website demonstration.
 * No real persistence or backend logic is tied to this data.
 */

export interface MockRoom {
  id: string;
  roomNumber: string;
  floor: number;
  type: 'SINGLE' | 'DOUBLE' | 'QUAD';
  typeLabelEn: string;
  typeLabelBn: string;
  monthlyRent: number;
  totalBeds: number;
  availableBeds: number;
  featuresEn: string[];
  featuresBn: string[];
  descriptionEn: string;
  descriptionBn: string;
  imageUrl: string;
}

export const MOCK_ROOMS: MockRoom[] = [
  {
    id: 'room-101',
    roomNumber: '১০১',
    floor: 1,
    type: 'SINGLE',
    typeLabelEn: 'Single Bed Room',
    typeLabelBn: 'সিঙ্গেল বেড রুম',
    monthlyRent: 8000,
    totalBeds: 1,
    availableBeds: 1,
    featuresEn: ['Private Study Table & Chair', 'Attached Balcony', 'High-Speed Wi-Fi', 'Personal Wardrobe'],
    featuresBn: ['ব্যক্তিগত পড়ার টেবিল ও চেয়ার', 'সংযুক্ত বারান্দা', 'উচ্চগতির ওয়াইফাই', 'ব্যক্তিগত আলমিরা'],
    descriptionEn: 'Premium single-occupancy room designed for quiet academic focus and privacy.',
    descriptionBn: 'একক শিক্ষার্থীর জন্য উপযুক্ত প্রিমিয়াম রুম, যা নিরিবিলি পড়াশোনা ও ব্যক্তিগত স্বাচ্ছন্দ্য নিশ্চিত করে।',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'room-102',
    roomNumber: '১০২',
    floor: 1,
    type: 'DOUBLE',
    typeLabelEn: 'Double Shared Room (2 Beds)',
    typeLabelBn: 'ডাবল শেয়ার্ড রুম (২ বেড)',
    monthlyRent: 5000,
    totalBeds: 2,
    availableBeds: 1,
    featuresEn: ['Individual Study Desks', 'Spacious Lockers', 'Well-Ventilated Windows', 'Daily Cleaning'],
    featuresBn: ['পৃথক স্টাডি ডেস্ক', 'প্রশস্ত লকার', 'আলো-বাতাসপূর্ণ বড় জানালা', 'নিয়মিত পরিচ্ছন্নতা'],
    descriptionEn: 'Comfortable shared room for two students with ample natural lighting and storage.',
    descriptionBn: 'দুইজন শিক্ষার্থীর থাকার জন্য আরামদায়ক রুম, যেখানে পর্যাপ্ত আলো-বাতাস ও লকার সুবিধা রয়েছে।',
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'room-201',
    roomNumber: '২০১',
    floor: 2,
    type: 'QUAD',
    typeLabelEn: 'Quad Shared Room (4 Beds)',
    typeLabelBn: 'ফোর-বেড শেয়ার্ড রুম (৪ বেড)',
    monthlyRent: 3500,
    totalBeds: 4,
    availableBeds: 2,
    featuresEn: ['Dedicated Bedside Lockers', 'Common Study Corner', 'Ceiling Fans & LED Lights', 'Weekly Linen Wash'],
    featuresBn: ['ব্যক্তিগত বেডসাইড লকার', 'কমন স্টাডি কর্নার', 'সিলিং ফ্যান ও আধুনিক লাইটিং', 'সাপ্তাহিক বিছানার চাদর ধোয়া'],
    descriptionEn: 'Economical 4-bed room offering a collaborative and lively hostel experience.',
    descriptionBn: 'সাশ্রয়ী ভাড়ায় চারজন শিক্ষার্থীর থাকার উপযোগী রুম, যা বন্ধুত্বপূর্ণ ও চমৎকার পরিবেশ প্রদান করে।',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'room-202',
    roomNumber: '২০২',
    floor: 2,
    type: 'DOUBLE',
    typeLabelEn: 'Double Shared Room (2 Beds)',
    typeLabelBn: 'ডাবল শেয়ার্ড রুম (২ বেড)',
    monthlyRent: 5000,
    totalBeds: 2,
    availableBeds: 0,
    featuresEn: ['Individual Study Desks', 'Spacious Lockers', 'Attached Washroom', 'Daily Cleaning'],
    featuresBn: ['পৃথক স্টাডি ডেস্ক', 'প্রশস্ত লকার', 'সংযুক্ত ওয়াশরুম', 'নিয়মিত পরিচ্ছন্নতা'],
    descriptionEn: 'Corner double-bed room with attached washroom (currently fully occupied).',
    descriptionBn: 'সংযুক্ত ওয়াশরুম সহ কর্নার ডাবল রুম (বর্তমানে সম্পূর্ণ বরাদ্দকৃত)।',
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800',
  },
];

export interface MockNotice {
  id: string;
  titleEn: string;
  titleBn: string;
  category: 'GENERAL' | 'ADMISSION' | 'DINING' | 'HOLIDAY';
  categoryLabelEn: string;
  categoryLabelBn: string;
  publishedDate: string;
  isPinned: boolean;
  contentEn: string;
  contentBn: string;
}

export const MOCK_NOTICES: MockNotice[] = [
  {
    id: 'notice-1',
    titleEn: 'Admission Applications Open for New Academic Semester',
    titleBn: 'নতুন শিক্ষাবর্ষের হোস্টেল ভর্তি আবেদন শুরু',
    category: 'ADMISSION',
    categoryLabelEn: 'Admission',
    categoryLabelBn: 'ভর্তি',
    publishedDate: '১৮ নভেম্বর, ২০২৬',
    isPinned: true,
    contentEn: 'Applications for seat allocations for the upcoming semester are now being accepted online. Prospective students can apply through the admission portal before the deadline.',
    contentBn: 'আসন্ন সেমিস্টারের শিক্ষার্থীদের জন্য হোস্টেলের অনলাইন সিট বরাদ্দ আবেদন শুরু হয়েছে। আগ্রহী প্রার্থীরা ভর্তি পোর্টালের মাধ্যমে নির্দিষ্ট তারিখের পূর্বে আবেদন করতে পারবেন।',
  },
  {
    id: 'notice-2',
    titleEn: 'Hostel Dining Meal Schedule and Revised Monthly Menu',
    titleBn: 'হোস্টেল ডাইনিং মিল চার্জ ও মেনু হালনাগাদ সংক্রান্ত',
    category: 'DINING',
    categoryLabelEn: 'Dining',
    categoryLabelBn: 'ডাইনিং',
    publishedDate: '১৫ নভেম্বর, ২০২৬',
    isPinned: false,
    contentEn: 'The dining committee has published the updated nutritious meal schedule for the current month. Students can check breakfast, lunch, and dinner timings on the board.',
    contentBn: 'ডাইনিং কমিটি চলতি মাসের জন্য উন্নত ও পুষ্টিকর খাদ্য তালিকা প্রকাশ করেছে। সকল আবাসিক ছাত্রকে নির্দিষ্ট সময়ে ডাইনিং হলে উপস্থিত থাকার অনুরোধ করা হচ্ছে।',
  },
  {
    id: 'notice-3',
    titleEn: 'Hostel Gate Timings & Code of Conduct Reminder',
    titleBn: 'হোস্টেল গেটের সময়সূচী ও আচরণবিধি মেনে চলা সংক্রান্ত নির্দেশনা',
    category: 'GENERAL',
    categoryLabelEn: 'General',
    categoryLabelBn: 'সাধারণ',
    publishedDate: '১০ নভেম্বর, ২০২৬',
    isPinned: false,
    contentEn: 'All residents are strictly reminded that the main hostel gate closes promptly at 9:30 PM. Any late entry requires prior written approval from the hostel warden.',
    contentBn: 'সকল আবাসিক শিক্ষার্থীকে স্মরণ করিয়ে দেওয়া হচ্ছে যে রাত ৯:৩০ টায় হোস্টেলের মূল ফটক বন্ধ হবে। বিশেষ প্রয়োজনে দেরিতে প্রবেশ করতে হলে ওয়ার্ডেনের পূর্বানুমতি আবশ্যক।',
  },
];

export interface MockTeamMember {
  nameEn: string;
  nameBn: string;
  roleEn: string;
  roleBn: string;
  phone: string;
  email: string;
  imageUrl: string;
}

export const MOCK_TEAM: MockTeamMember[] = [
  {
    nameEn: 'Dr. Shahinur Rahman',
    nameBn: 'ড. শাহিনুর রহমান',
    roleEn: 'Chief Warden',
    roleBn: 'প্রধান হোস্টেল সুপার / ওয়ার্ডেন',
    phone: '+880 1711-XXXXXX',
    email: 'warden@hostpilot.com',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  },
  {
    nameEn: 'Md. Kamrul Hasan',
    nameBn: 'মো. কামরুল হাসান',
    roleEn: 'Assistant Warden & Admin',
    roleBn: 'সহকারী ওয়ার্ডেন ও প্রশাসন',
    phone: '+880 1812-XXXXXX',
    email: 'admin@hostpilot.com',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  },
  {
    nameEn: 'Abdul Hannan',
    nameBn: 'আব্দুল হান্নান',
    roleEn: 'Hostel Supervisor & Caretaker',
    roleBn: 'কেয়ারটেকার ও হোস্টেল তত্ত্বাবধায়ক',
    phone: '+880 1913-XXXXXX',
    email: 'supervisor@hostpilot.com',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
  },
];
