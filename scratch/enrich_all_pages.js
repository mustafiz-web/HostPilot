const fs = require('fs');
const path = require('path');

const bnPath = path.resolve('frontend/src/i18n/locales/bn/translation.json');
const enPath = path.resolve('frontend/src/i18n/locales/en/translation.json');

const bn = JSON.parse(fs.readFileSync(bnPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Helper to set nested key
function setKey(obj, pathArr, value) {
  let curr = obj;
  for (let i = 0; i < pathArr.length - 1; i++) {
    const k = pathArr[i];
    if (!curr[k] || typeof curr[k] !== 'object') {
      curr[k] = {};
    }
    curr = curr[k];
  }
  curr[pathArr[pathArr.length - 1]] = value;
}

// Keys to enrich
const additions = [
  // Student Payments
  {
    path: ['student', 'payments', 'online_payment'],
    bn: 'অনলাইন ফি পরিশোধ',
    en: 'Online Fee Payment',
  },
  {
    path: ['student', 'payments', 'total_paid'],
    bn: 'সর্বমোট পরিশোধিত',
    en: 'Total Paid',
  },
  {
    path: ['student', 'payments', 'paid_in_current_session'],
    bn: 'চলতি সেশনে পরিশোধকৃত ফি',
    en: 'Fees paid in current session',
  },
  {
    path: ['student', 'payments', 'current_due'],
    bn: 'বর্তমান বকেয়া ফি',
    en: 'Current Due Fees',
  },
  {
    path: ['student', 'payments', 'no_due'],
    bn: 'কোনো বকেয়া নেই',
    en: 'No dues pending',
  },
  {
    path: ['student', 'payments', 'due_for'],
    bn: '{{period}} এর বকেয়া',
    en: 'Due for {{period}}',
  },
  {
    path: ['student', 'payments', 'monthly_rent'],
    bn: 'মাসিক নির্ধারিত ভাড়া',
    en: 'Monthly Allocated Rent',
  },
  {
    path: ['student', 'payments', 'room_rent_note'],
    bn: 'রুম {{room}} (বেড {{bed}}) • প্রতি মাসের ১০ তারিখের মধ্যে প্রদেয়',
    en: 'Room {{room}} (Bed {{bed}}) • Payable by 10th of every month',
  },
  {
    path: ['student', 'payments', 'no_allocation'],
    bn: 'সিট বরাদ্দ সক্রিয় নেই',
    en: 'No active room allocation',
  },
  {
    path: ['student', 'payments', 'payment_history'],
    bn: 'ভাড়া পরিশোধের ইতিহাস',
    en: 'Rent Payment History',
  },
  {
    path: ['student', 'payments', 'error_loading'],
    bn: 'পেমেন্ট হিস্ট্রি লোড করতে সমস্যা হয়েছে',
    en: 'Failed to load payment history',
  },
  {
    path: ['student', 'payments', 'no_records'],
    bn: 'এখনও কোনো পেমেন্ট রেকর্ড নেই',
    en: 'No payment records found',
  },
  {
    path: ['student', 'payments', 'no_records_desc'],
    bn: 'আপনার পরিশোধিত বা বকেয়া ফি এখানে প্রদর্শিত হবে।',
    en: 'Your paid and pending fees will appear here.',
  },
  {
    path: ['student', 'payments', 'th_receipt_no'],
    bn: 'রশিদ / ইনভয়েস নং',
    en: 'Receipt / Invoice No',
  },
  {
    path: ['student', 'payments', 'th_billing_period'],
    bn: 'বিলিং সময়কাল',
    en: 'Billing Period',
  },
  {
    path: ['student', 'payments', 'th_monthly_rent'],
    bn: 'নির্ধারিত ভাড়া',
    en: 'Allocated Rent',
  },
  {
    path: ['student', 'payments', 'th_paid_amount'],
    bn: 'পরিশোধিত টাকা',
    en: 'Paid Amount',
  },
  {
    path: ['student', 'payments', 'th_method'],
    bn: 'পেমেন্ট মাধ্যম',
    en: 'Payment Method',
  },
  {
    path: ['student', 'payments', 'th_paid_date'],
    bn: 'পরিশোধের তারিখ',
    en: 'Payment Date',
  },
  {
    path: ['student', 'payments', 'pending_status'],
    bn: 'অপেক্ষমান',
    en: 'Pending',
  },
  {
    path: ['student', 'payments', 'view_receipt'],
    bn: 'রসিদ দেখুন',
    en: 'View Receipt',
  },
  {
    path: ['student', 'payments', 'pay_now'],
    bn: 'এখন পে করুন',
    en: 'Pay Now',
  },
  {
    path: ['student', 'payments', 'receipt_title'],
    bn: 'হোস্টেল ফি আদায় রসিদ (Official Receipt)',
    en: 'Hostel Fee Official Receipt',
  },
  {
    path: ['student', 'payments', 'receipt_subtitle'],
    bn: 'Host Pilot অনুমোদিত ডিজিটাল পেমেন্ট স্বীকৃতি',
    en: 'Host Pilot Verified Digital Payment Receipt',
  },
  {
    path: ['student', 'payments', 'student_lbl'],
    bn: 'শিক্ষার্থী',
    en: 'Student',
  },
  {
    path: ['student', 'payments', 'id_lbl'],
    bn: 'আইডি',
    en: 'ID',
  },
  {
    path: ['student', 'payments', 'dept_lbl'],
    bn: 'ডিপার্টমেন্ট',
    en: 'Department',
  },
  {
    path: ['student', 'payments', 'hostel_seat'],
    bn: 'হোস্টেল সীট',
    en: 'Hostel Seat',
  },
  {
    path: ['student', 'payments', 'billing_period_lbl'],
    bn: 'বিলিং সময়কাল:',
    en: 'Billing Period:',
  },
  {
    path: ['student', 'payments', 'payment_date_lbl'],
    bn: 'পরিশোধের তারিখ:',
    en: 'Payment Date:',
  },
  {
    path: ['student', 'payments', 'payment_method_lbl'],
    bn: 'পেমেন্ট মেথড:',
    en: 'Payment Method:',
  },
  {
    path: ['student', 'payments', 'trx_lbl'],
    bn: 'ট্রানজেকশন আইডি (TrxID):',
    en: 'Transaction ID (TrxID):',
  },
  {
    path: ['student', 'payments', 'total_collected'],
    bn: 'সর্বমোট আদায়কৃত টাকা:',
    en: 'Total Amount Paid:',
  },
  {
    path: ['student', 'payments', 'verified_notice'],
    bn: '✓ পেমেন্ট অনুমোদিত ও ডাটাবেজে সংরক্ষিত (PAID & VERIFIED)',
    en: '✓ Payment Verified & Recorded in Database (PAID & VERIFIED)',
  },
  {
    path: ['student', 'payments', 'print_receipt'],
    bn: 'রসিদ প্রিন্ট করুন',
    en: 'Print Receipt',
  },
  {
    path: ['student', 'payments', 'pay_modal_title'],
    bn: 'অনলাইন ফি পরিশোধ (Pay Hostel Rent)',
    en: 'Pay Hostel Rent Online',
  },
  {
    path: ['student', 'payments', 'pay_modal_desc'],
    bn: 'বিকাশ, নগদ বা ব্যাংক ট্রান্সফারের মাধ্যমে সিট ভাড়া পরিশোধ নিশ্চিত করুন।',
    en: 'Confirm your hostel rent payment via bKash, Nagad, or Bank Transfer.',
  },
  {
    path: ['student', 'payments', 'billing_period_field'],
    bn: 'বিলিং সময়কাল (মাস/বছর)',
    en: 'Billing Period (Month/Year)',
  },
  {
    path: ['student', 'payments', 'amount_field'],
    bn: 'পরিশোধের পরিমাণ (টাকা)',
    en: 'Payment Amount (BDT)',
  },
  {
    path: ['student', 'payments', 'select_method'],
    bn: 'পেমেন্ট মেথড নির্বাচন করুন',
    en: 'Select Payment Method',
  },
  {
    path: ['student', 'payments', 'sender_phone'],
    bn: 'প্রেরকের মোবাইল নম্বর',
    en: 'Sender Mobile Number',
  },
  {
    path: ['student', 'payments', 'trx_id_field'],
    bn: 'ট্রানজেকশন আইডি (TrxID)',
    en: 'Transaction ID (TrxID)',
  },
  {
    path: ['student', 'payments', 'trx_placeholder'],
    bn: 'যেমন: BK9X274LAQ',
    en: 'e.g., BK9X274LAQ',
  },
  {
    path: ['student', 'payments', 'confirm_payment'],
    bn: 'পেমেন্ট নিশ্চিত করুন',
    en: 'Confirm Payment',
  },
  {
    path: ['student', 'payments', 'err_invalid_amount'],
    bn: 'অনুগ্রহ করে সঠিক টাকার পরিমাণ উল্লেখ করুন',
    en: 'Please enter a valid payment amount',
  },
  {
    path: ['student', 'payments', 'err_payment_failed'],
    bn: 'পেমেন্ট সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
    en: 'Payment could not be completed. Please try again.',
  },

  // Student Complaints
  {
    path: ['student', 'complaints', 'btn_new'],
    bn: 'নতুন অভিযোগ দাখিল',
    en: 'Submit New Complaint',
  },
  {
    path: ['student', 'complaints', 'filter_all'],
    bn: 'সকল',
    en: 'All',
  },
  {
    path: ['student', 'complaints', 'filter_pending'],
    bn: 'অপেক্ষমান',
    en: 'Pending',
  },
  {
    path: ['student', 'complaints', 'filter_in_progress'],
    bn: 'চলমান',
    en: 'In Progress',
  },
  {
    path: ['student', 'complaints', 'filter_resolved'],
    bn: 'সমাধানকৃত',
    en: 'Resolved',
  },
  {
    path: ['student', 'complaints', 'modal_title'],
    bn: 'নতুন অভিযোগ নিবন্ধন করুন',
    en: 'Register New Complaint',
  },
  {
    path: ['student', 'complaints', 'modal_desc'],
    bn: 'আপনার রুমের সুবিধা বা হোস্টেল সংক্রান্ত সমস্যা বিশদভাবে জানান। দ্রুত সমাধান করা হবে।',
    en: 'Describe your room or hostel-related issue in detail. It will be addressed promptly.',
  },
  {
    path: ['student', 'complaints', 'title_field'],
    bn: 'অভিযোগের শিরোনাম',
    en: 'Complaint Title',
  },
  {
    path: ['student', 'complaints', 'title_placeholder'],
    bn: 'যেমন: বাথরুমের পানির ট্যাপ নষ্ট / ওয়াইফাই কানেকশন ডাউন',
    en: 'e.g., Bathroom faucet leaking / Wi-Fi disconnected',
  },
  {
    path: ['student', 'complaints', 'category_field'],
    bn: 'ক্যাটাগরি',
    en: 'Category',
  },
  {
    path: ['student', 'complaints', 'cat_plumbing'],
    bn: 'প্লাম্বিং / পাইপলাইন / পানি',
    en: 'Plumbing / Water Supply',
  },
  {
    path: ['student', 'complaints', 'cat_electrical'],
    bn: 'বৈদ্যুতিক / ফ্যান / লাইট',
    en: 'Electrical / Fan / Lights',
  },
  {
    path: ['student', 'complaints', 'cat_internet'],
    bn: 'ইন্টারনেট / ওয়াইফাই সংযোগ',
    en: 'Internet / Wi-Fi Connectivity',
  },
  {
    path: ['student', 'complaints', 'cat_furniture'],
    bn: 'আসবাবপত্র / সিট সমস্যা',
    en: 'Furniture / Bed Issue',
  },
  {
    path: ['student', 'complaints', 'cat_cleaning'],
    bn: 'পরিচ্ছন্নতা ও আবর্জনা',
    en: 'Cleanliness & Garbage',
  },
  {
    path: ['student', 'complaints', 'cat_security'],
    bn: 'নিরাপত্তা ও শৃঙ্খলা',
    en: 'Security & Discipline',
  },
  {
    path: ['student', 'complaints', 'cat_other'],
    bn: 'অন্যান্য সমস্যা',
    en: 'Other Issues',
  },
  {
    path: ['student', 'complaints', 'priority_field'],
    bn: 'জরুরি মাত্রা (Priority)',
    en: 'Priority Level',
  },
  {
    path: ['student', 'complaints', 'prio_low'],
    bn: 'সাধারণ (Low)',
    en: 'Low',
  },
  {
    path: ['student', 'complaints', 'prio_medium'],
    bn: 'মধ্যম (Medium)',
    en: 'Medium',
  },
  {
    path: ['student', 'complaints', 'prio_high'],
    bn: 'উচ্চ / জরুরি (High)',
    en: 'High / Urgent',
  },
  {
    path: ['student', 'complaints', 'desc_field'],
    bn: 'সমস্যার বিস্তারিত বিবরণ',
    en: 'Detailed Problem Description',
  },
  {
    path: ['student', 'complaints', 'desc_placeholder'],
    bn: 'সমস্যাটি কখন থেকে হচ্ছে এবং কীভাবে সমাধান প্রয়োজন তা বিস্তারিত লিখুন...',
    en: 'Describe when the problem started and details needed for resolution...',
  },
  {
    path: ['student', 'complaints', 'submit_btn'],
    bn: 'অভিযোগ দাখিল করুন',
    en: 'Submit Complaint',
  },
  {
    path: ['student', 'complaints', 'submitting'],
    bn: 'দাখিল হচ্ছে...',
    en: 'Submitting...',
  },
  {
    path: ['student', 'complaints', 'error_load'],
    bn: 'অভিযোগের তালিকা লোড করতে সমস্যা হয়েছে',
    en: 'Failed to load complaints list',
  },
  {
    path: ['student', 'complaints', 'no_complaints'],
    bn: 'কোনো অভিযোগের রেকর্ড পাওয়া যায়নি',
    en: 'No complaints records found',
  },
  {
    path: ['student', 'complaints', 'no_complaints_desc'],
    bn: 'আপনার কোনো অভিযোগ থাকলে উপরের বাটনে ক্লিক করে নতুন অভিযোগ নিবন্ধন করুন।',
    en: 'If you have any issues, click the button above to register a complaint.',
  },
  {
    path: ['student', 'complaints', 'card_submitted'],
    bn: 'দাখিলের তারিখ:',
    en: 'Submitted Date:',
  },
  {
    path: ['student', 'complaints', 'card_category'],
    bn: 'বিভাগ:',
    en: 'Category:',
  },
  {
    path: ['student', 'complaints', 'card_priority'],
    bn: 'মাত্রা:',
    en: 'Priority:',
  },
  {
    path: ['student', 'complaints', 'admin_response'],
    bn: 'কর্তৃপক্ষের মন্তব্য ও সমাধান নোট:',
    en: 'Admin Response & Resolution Note:',
  },
  {
    path: ['student', 'complaints', 'err_submit'],
    bn: 'অভিযোগ দাখিল করতে সমস্যা হয়েছে',
    en: 'Failed to submit complaint',
  },

  // Student Dashboard
  {
    path: ['student', 'dashboard', 'welcome_badge'],
    bn: 'শিক্ষার্থী পোর্টাল',
    en: 'Student Portal',
  },
  {
    path: ['student', 'dashboard', 'active_seat'],
    bn: 'সক্রিয় সীট বরাদ্দ',
    en: 'Active Seat Allocation',
  },
  {
    path: ['student', 'dashboard', 'unallocated'],
    bn: 'সীট বরাদ্দ নেই',
    en: 'No Seat Allocated',
  },
  {
    path: ['student', 'dashboard', 'unallocated_desc'],
    bn: 'আপনার আবেদনের অনুমোদন বা সিট বরাদ্দের জন্য প্রশাসন অফিসে যোগাযোগ করুন।',
    en: 'Please contact the administration office for application approval or seat allocation.',
  },
  {
    path: ['student', 'dashboard', 'allocated_since'],
    bn: 'বরাদ্দের তারিখ: {{date}}',
    en: 'Allocated Since: {{date}}',
  },
  {
    path: ['student', 'dashboard', 'quick_actions'],
    bn: 'কুইক অ্যাকশন',
    en: 'Quick Actions',
  },
  {
    path: ['student', 'dashboard', 'action_pay'],
    bn: 'ফি পরিশোধ',
    en: 'Pay Fees',
  },
  {
    path: ['student', 'dashboard', 'action_complaint'],
    bn: 'অভিযোগ দাখিল',
    en: 'Submit Complaint',
  },
  {
    path: ['student', 'dashboard', 'action_room'],
    bn: 'রুমের বিবরণ',
    en: 'Room Details',
  },
  {
    path: ['student', 'dashboard', 'action_rules'],
    bn: 'হোস্টেল নিয়মাবলী',
    en: 'Hostel Rules',
  },
  {
    path: ['student', 'dashboard', 'recent_notices'],
    bn: 'সাম্প্রতিক নোটিশ',
    en: 'Recent Notices',
  },
  {
    path: ['student', 'dashboard', 'all_notices'],
    bn: 'সকল নোটিশ দেখুন',
    en: 'View All Notices',
  },
  {
    path: ['student', 'dashboard', 'no_notices'],
    bn: 'আপাতত কোনো নতুন নোটিশ নেই',
    en: 'No new notices at this time',
  },

  // Student Profile
  {
    path: ['student', 'profile', 'academic_info'],
    bn: 'একাডেমিক তথ্য',
    en: 'Academic Information',
  },
  {
    path: ['student', 'profile', 'personal_info'],
    bn: 'ব্যক্তিগত ও যোগাযোগ তথ্য',
    en: 'Personal & Contact Information',
  },
  {
    path: ['student', 'profile', 'guardian_info'],
    bn: 'অভিভাবকের তথ্য ও জরুরি যোগাযোগ',
    en: 'Guardian & Emergency Contact Information',
  },
  {
    path: ['student', 'profile', 'full_name'],
    bn: 'পূর্ণ নাম',
    en: 'Full Name',
  },
  {
    path: ['student', 'profile', 'student_id'],
    bn: 'শিক্ষার্থী আইডি',
    en: 'Student ID',
  },
  {
    path: ['student', 'profile', 'roll_number'],
    bn: 'রোল নম্বর',
    en: 'Roll Number',
  },
  {
    path: ['student', 'profile', 'department'],
    bn: 'বিভাগ (Department)',
    en: 'Department',
  },
  {
    path: ['student', 'profile', 'session'],
    bn: 'শিক্ষাবর্ষ (Session)',
    en: 'Session',
  },
  {
    path: ['student', 'profile', 'batch'],
    bn: 'ব্যাচ',
    en: 'Batch',
  },
  {
    path: ['student', 'profile', 'email'],
    bn: 'ইমেইল অ্যাড্রেস',
    en: 'Email Address',
  },
  {
    path: ['student', 'profile', 'phone'],
    bn: 'মোবাইল নম্বর',
    en: 'Phone Number',
  },
  {
    path: ['student', 'profile', 'guardian_name'],
    bn: 'অভিভাবকের নাম',
    en: 'Guardian Name',
  },
  {
    path: ['student', 'profile', 'guardian_phone'],
    bn: 'অভিভাবকের মোবাইল',
    en: 'Guardian Phone',
  },
  {
    path: ['student', 'profile', 'emergency_contact'],
    bn: 'জরুরি যোগাযোগ নম্বর',
    en: 'Emergency Contact',
  },
  {
    path: ['student', 'profile', 'address'],
    bn: 'স্থায়ী ঠিকানা',
    en: 'Permanent Address',
  },
  {
    path: ['student', 'profile', 'blood_group'],
    bn: 'রক্তের গ্রুপ',
    en: 'Blood Group',
  },
  {
    path: ['student', 'profile', 'status_label'],
    bn: 'বর্তমান অ্যাকাউন্টিং স্ট্যাটাস',
    en: 'Current Account Status',
  },
  {
    path: ['student', 'profile', 'edit_note'],
    bn: 'প্রোফাইলের তথ্য পরিবর্তন বা সংশোধনের জন্য হোস্টেল প্রশাসনের সাথে যোগাযোগ করুন।',
    en: 'Please contact the hostel administration office to request any profile updates.',
  },

  // Student Notices
  {
    path: ['student', 'notices', 'title'],
    bn: 'হোস্টেল নোটিশ বোর্ড',
    en: 'Hostel Notice Board',
  },
  {
    path: ['student', 'notices', 'subtitle'],
    bn: 'কর্তৃপক্ষ কর্তৃক প্রকাশিত অফিসিয়াল নোটিশ ও জরুরি নির্দেশনা',
    en: 'Official notices and urgent announcements published by hostel administration',
  },
  {
    path: ['student', 'notices', 'filter_all'],
    bn: 'সকল নোটিশ',
    en: 'All Notices',
  },
  {
    path: ['student', 'notices', 'filter_general'],
    bn: 'সাধারণ নোটিশ',
    en: 'General',
  },
  {
    path: ['student', 'notices', 'filter_urgent'],
    bn: 'জরুরি নোটিশ',
    en: 'Urgent',
  },
  {
    path: ['student', 'notices', 'filter_event'],
    bn: 'ইভেন্ট / কর্মসূচি',
    en: 'Events',
  },
  {
    path: ['student', 'notices', 'search_placeholder'],
    bn: 'নোটিশের শিরোনাম বা বিষয় অনুসন্ধান করুন...',
    en: 'Search notice by title or keyword...',
  },
  {
    path: ['student', 'notices', 'no_notices'],
    bn: 'কোনো নোটিশ পাওয়া যায়নি',
    en: 'No notices found',
  },
  {
    path: ['student', 'notices', 'read_more'],
    bn: 'সম্পূর্ণ পড়ুন',
    en: 'Read Full Notice',
  },
  {
    path: ['student', 'notices', 'published_on'],
    bn: 'প্রকাশের তারিখ: {{date}}',
    en: 'Published On: {{date}}',
  },

  // Common additional
  {
    path: ['common', 'total_count'],
    bn: 'সর্বমোট {{count}} টি রেকর্ড',
    en: 'Total {{count}} records',
  },
  {
    path: ['common', 'no_data_desc'],
    bn: 'কোনো তথ্য উপলব্ধ নেই।',
    en: 'No data available.',
  },
  {
    path: ['common', 'status'],
    bn: 'স্ট্যাটাস',
    en: 'Status',
  },
  {
    path: ['common', 'view'],
    bn: 'দেখুন',
    en: 'View',
  },
  {
    path: ['common', 'print'],
    bn: 'প্রিন্ট',
    en: 'Print',
  },
  {
    path: ['common', 'download'],
    bn: 'ডাউনলোড',
    en: 'Download',
  },
  {
    path: ['common', 'all'],
    bn: 'সকল',
    en: 'All',
  },
  {
    path: ['common', 'active'],
    bn: 'সক্রিয়',
    en: 'Active',
  },
  {
    path: ['common', 'inactive'],
    bn: 'নিষ্ক্রিয়',
    en: 'Inactive',
  },
];

for (const item of additions) {
  setKey(bn, item.path, item.bn);
  setKey(en, item.path, item.en);
}

fs.writeFileSync(bnPath, JSON.stringify(bn, null, 2) + '\n', 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');

console.log(`Successfully added ${additions.length} keys to bn and en translation files.`);
