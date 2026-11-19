import { PrismaClient, Role, UserStatus, RoomType, RoomStatus, BedStatus, AllocationStatus, PaymentStatus, PaymentMethod, ComplaintCategory, ComplaintPriority, ComplaintStatus, NoticeStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting safe development database seeding...');

  // 1. Hostel Settings
  const settings = await prisma.hostelSettings.upsert({
    where: { id: 'settings-default' },
    update: {},
    create: {
      id: 'settings-default',
      hostelName: 'Host Pilot Hostel',
      address: 'হোস্টেল ক্যাম্পাস, কলেজ রোড, ঢাকা-১২০৫, বাংলাদেশ',
      contactPhone: '+৮৮০ ১৭XXXXXXXX',
      contactEmail: 'admin@hostpilot.com',
      currencyCode: 'BDT',
      timezone: 'Asia/Dhaka',
      gateCloseTime: '10:00 PM',
    },
  });
  console.log('✓ Hostel settings configured:', settings.hostelName);

  // 2. Expense Categories
  const categories = [
    { name: 'UTILITIES', description: 'বিদ্যুৎ, গ্যাস, পানি ও পয়ঃনিষ্কাশন ইউটিলিটি বিল' },
    { name: 'MAINTENANCE', description: 'বিল্ডিং মেরামত, প্লাম্বিং ও ইলেকট্রিক্যাল সামগ্রী' },
    { name: 'DINING', description: 'ডাইনিং খাদ্যপণ্য, বাবুর্চি ও মিল পরিচালন ব্যয়' },
    { name: 'WIFI', description: 'হাই-স্পিড অপটিক্যাল ফাইবার ইন্টারনেট বিল' },
    { name: 'SANITATION', description: 'পরিচ্ছন্নতা সামগ্রী ও জীবাণুনাশক ক্রয়' },
    { name: 'STAFF_SALARY', description: 'হোস্টেল সিকিউরিটি ও সহায়ক স্টাফ বেতন' },
    { name: 'OTHER', description: 'বিবিধ প্রশাসনিক ব্যয়' },
  ];

  for (const cat of categories) {
    await prisma.expenseCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        description: cat.description,
        isActive: true,
      },
    });
  }
  console.log('✓ Expense categories seeded');

  // 3. Admin User (Development Credentials Only)
  const adminPasswordHash = await bcrypt.hash('Admin#Dev2026!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hostpilot.dev' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@hostpilot.dev',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log('✓ Admin user created:', adminUser.email);

  // 4. Student User & Profile (Tanvir Ahmed)
  const studentPasswordHash = await bcrypt.hash('Student#Dev2026!', 10);
  const studentUser = await prisma.user.upsert({
    where: { email: 'tanvir@campus.edu.bd' },
    update: {},
    create: {
      name: 'তানভীর আহমেদ',
      email: 'tanvir@campus.edu.bd',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
    },
  });

  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      studentCode: 'HP-STU-2026-001',
      phone: '০১৭১১-২২৩৩৪৪',
      department: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (CSE)',
      rollNumber: '2022-CSE-045',
      session: '২০২২-২০২৩',
      batch: '২৩তম ব্যাচ',
      bloodGroup: 'B+',
      address: 'বাসা ১২, রোড ৪, উত্তরা, ঢাকা',
      dateOfBirth: new Date('2003-05-15'),
    },
  });

  // Guardian
  await prisma.guardian.createMany({
    data: [
      {
        studentId: student.id,
        name: 'মো. রফিকুল ইসলাম',
        relationship: 'পিতা',
        phone: '০১৮১১-৯৮৭৬৫৪',
        emergencyContact: '০১৮১১-৯৮৭৬৫৪',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✓ Student user & guardian seeded:', student.studentCode);

  // 5. Rooms and Beds
  const room101 = await prisma.room.upsert({
    where: { roomNumber: '১০১' },
    update: {},
    create: {
      roomNumber: '১০১',
      floor: 1,
      capacity: 2,
      roomType: RoomType.DOUBLE,
      monthlyRent: 8000.0,
      status: RoomStatus.AVAILABLE,
    },
  });

  const bedA = await prisma.bed.upsert({
    where: { roomId_bedCode: { roomId: room101.id, bedCode: 'A' } },
    update: { status: BedStatus.OCCUPIED },
    create: {
      roomId: room101.id,
      bedCode: 'A',
      status: BedStatus.OCCUPIED,
    },
  });

  await prisma.bed.upsert({
    where: { roomId_bedCode: { roomId: room101.id, bedCode: 'B' } },
    update: {},
    create: {
      roomId: room101.id,
      bedCode: 'B',
      status: BedStatus.AVAILABLE,
    },
  });

  // Room 102
  const room102 = await prisma.room.upsert({
    where: { roomNumber: '১০২' },
    update: {},
    create: {
      roomNumber: '১০২',
      floor: 1,
      capacity: 1,
      roomType: RoomType.SINGLE,
      monthlyRent: 12000.0,
      status: RoomStatus.AVAILABLE,
    },
  });

  await prisma.bed.upsert({
    where: { roomId_bedCode: { roomId: room102.id, bedCode: 'A' } },
    update: {},
    create: {
      roomId: room102.id,
      bedCode: 'A',
      status: BedStatus.AVAILABLE,
    },
  });
  console.log('✓ Rooms and beds seeded (Room 101, 102)');

  // 6. Allocation for Student to Bed A
  await prisma.roomAllocation.createMany({
    data: [
      {
        studentId: student.id,
        bedId: bedA.id,
        startDate: new Date('2026-01-01'),
        status: AllocationStatus.ACTIVE,
        allocatedByUserId: adminUser.id,
      },
    ],
    skipDuplicates: true,
  });

  // 7. Payment Invoices
  await prisma.payment.upsert({
    where: { studentId_billingPeriod: { studentId: student.id, billingPeriod: '2026-11' } },
    update: {},
    create: {
      studentId: student.id,
      billingPeriod: '2026-11',
      amount: 8000.0,
      paidAmount: 8000.0,
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.BKASH,
      receiptNumber: 'RCP-2026-1101',
      transactionReference: 'BK9X274LAQ',
      paidAt: new Date('2026-11-03'),
      recordedByUserId: adminUser.id,
    },
  });

  await prisma.payment.upsert({
    where: { studentId_billingPeriod: { studentId: student.id, billingPeriod: '2026-12' } },
    update: {},
    create: {
      studentId: student.id,
      billingPeriod: '2026-12',
      amount: 8000.0,
      paidAmount: 0.0,
      status: PaymentStatus.DUE,
      receiptNumber: 'INV-2026-1201',
    },
  });
  console.log('✓ Sample payments and invoices seeded');

  // 8. Complaints
  await prisma.complaint.create({
    data: {
      studentId: student.id,
      title: 'ওয়াশরুমের বেসিন ট্যাপ দিয়ে পানি পড়ছে',
      category: ComplaintCategory.PLUMBING,
      priority: ComplaintPriority.HIGH,
      status: ComplaintStatus.IN_PROGRESS,
      description: '১০১ নম্বর রুমের বাথরুমের বেসিনের নিচের জয়েন্ট লুজ হয়ে পানি পড়ছে।',
      adminNote: 'অভিযোগটি গ্রহণ করা হয়েছে। দায়িত্বপ্রাপ্ত প্লাম্বারকে পাঠানো হয়েছে।',
    },
  });
  console.log('✓ Sample complaint seeded');

  // 9. Notices
  await prisma.notice.create({
    data: {
      title: 'নতুন শিক্ষাবর্ষের হোস্টেল সিট নবায়ন ও আবেদন সংক্রান্ত বিজ্ঞপ্তি',
      content: 'সকল আবাসিক শিক্ষার্থীদের জানানো যাচ্ছে যে, আগামী শিক্ষাবর্ষের জন্য বার্ষিক সিট নবায়ন প্রক্রিয়া শুরু হয়েছে।',
      category: 'ভর্তি ও সিট নবায়ন',
      isPinned: true,
      status: NoticeStatus.PUBLISHED,
      publishedAt: new Date(),
      createdByUserId: adminUser.id,
    },
  });
  console.log('✓ Sample notices seeded');

  console.log('✅ Development database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
