export const demoAccounts = {
  user: {
    id: 'u1',
    name: 'Nguyễn Văn An',
    role: 'USER',
    roleName: 'Học viên (Member)',
    phone: '0987654321',
    email: 'nguyenvanan@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    unreadNotifications: 2
  },
  trainer: {
    id: 'pt1',
    name: 'HLV. Trần Minh Đức',
    role: 'TRAINER',
    roleName: 'Huấn luyện viên (Master Trainer)',
    phone: '0912345678',
    email: 'minhduc.pt@fitmanager.vn',
    avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=300',
    unreadNotifications: 5
  },
  admin: {
    id: 'a1',
    name: 'Phạm Hoàng Nam (Admin)',
    role: 'ADMIN',
    roleName: 'Quản trị viên Hệ thống (System Admin)',
    phone: '0999999999',
    email: 'admin@fitmanager.vn',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    unreadNotifications: 8
  }
};

export const currentUser = demoAccounts.user;

export const packagesData = [
  {
    id: 'basic',
    name: 'Gói Cơ Bản (Basic Fit)',
    category: 'KHỞI ĐỘNG THỂ LỰC',
    subtitle: 'Dành cho người mới bắt đầu. Tập trung vào các tiện ích cơ bản kèm huấn luyện linh hoạt theo ngày.',
    priceYear: '2.990.000',
    priceMonth: '299.000',
    period: 'đ / năm',
    note: 'Giá áp dụng cho gói thanh toán 12 tháng',
    badge: null,
    isPopular: false,
    activeMembers: 420,
    status: 'Hoạt động',
    features: [
      'Tập luyện không giới hạn thời gian trong giờ tiêu chuẩn (06:00 - 16:00)',
      '01 buổi đo phân tích chỉ số cơ thể InBody định kỳ / quý',
      'Tự do mở khoá hệ thống máy & phòng tập tương ứng',
      'Nước uống lọc kiềm diệt khuẩn miễn phí',
      'Huấn luyện viên hướng dẫn 02 buổi nhập môn',
      'Dịch vụ phòng xông hơi Sauna & Bể ngâm thủy lực'
    ],
    buttonText: 'Đăng ký gói Cơ bản'
  },
  {
    id: 'premium',
    name: 'Gói Cao Cấp (Premium Plus)',
    category: 'CHUYỂN HÓA VÓC DÁNG',
    subtitle: 'Trải nghiệm trọn vẹn mọi khung giờ, hỗ trợ PT định hình giảm cân siêu tốc & phục hồi chuyên sâu.',
    priceYear: '5.990.000',
    priceMonth: '599.000',
    period: 'đ / năm',
    note: 'Tặng kèm 2 buổi PT 1:1 chuyên sâu',
    badge: 'KHUYÊN DÙNG - PHỔ BIẾN NHẤT',
    isPopular: true,
    activeMembers: 680,
    status: 'Hoạt động',
    features: [
      'Toàn quyền truy cập 24/7 toàn hệ thống phòng tập',
      '02 buổi tập cùng 1:1 với PT chuyên nghiệp / tháng',
      'InBody hàng tuần & thiết lập lộ trình dinh dưỡng riêng',
      'Thư giãn riêng tại khu vực Hymalaya & Bể ngâm Jacuzzi',
      'Miễn phí khăn tập kháng khuẩn custom & Tủ locker VIP',
      'Bảo lưu gói tập linh hoạt lên đến 30 ngày / năm'
    ],
    buttonText: 'Đăng ký ngay gói Premium'
  },
  {
    id: 'vip',
    name: 'Gói VIP Thượng Đỉnh (VIP Elite)',
    category: 'ĐẲNG CẤP THƯỢNG ĐỈNH',
    subtitle: 'Đặc quyền tối thượng dành cho doanh nhân và khách hàng tìm kiếm sự riêng tư, tiện nghi tuyệt đối.',
    priceYear: '9.990.000',
    priceMonth: '999.000',
    period: 'đ / năm',
    note: 'Bao gồm toàn bộ dịch vụ xông hơi & Valet Parking',
    badge: null,
    isPopular: false,
    activeMembers: 140,
    status: 'Hoạt động',
    features: [
      'Check-in VIP không giới hạn tất cả các phòng tập mở rộng',
      '12 buổi tập PT 1:1 chuyên sâu / tháng (hỗ trợ chuyển đổi)',
      'Chỉ định HLV xếp lớp Master Trainer & Viện trưởng viện huấn luyện',
      'Phục vụ Whey Protein In-box & BCAA riêng sau mỗi buổi tập',
      'Locker cá nhân riêng biệt – Chỗ để xe ô tô VIP miễn phí',
      'Bảo lưu linh hoạt không giới hạn thời gian (lên đến 90 ngày)'
    ],
    buttonText: 'Đăng ký gói VIP'
  }
];

export const trainersData = [
  {
    id: 'pt1',
    name: 'HLV. Trần Minh Đức',
    title: 'Master Trainer - Bodybuilding & Giảm Cân',
    rating: 4.9,
    reviewsCount: 128,
    experience: '7 năm kinh nghiệm',
    avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=300',
    specialties: ['Tăng cơ', 'Giảm mỡ', 'Tập tạ nặng'],
    bio: 'Chuyên gia huấn luyện thể hình chuyên nghiệp với chứng chỉ NASM. Đã giúp hơn 300+ học viên thay đổi vóc dáng thành công.',
    status: 'Hoạt động',
    assignedStudentsCount: 18,
    phone: '0912345678',
    email: 'minhduc.pt@fitmanager.vn'
  },
  {
    id: 'pt2',
    name: 'HLV. Nguyễn Thu Trang',
    title: 'HLV Pilates & Core Specialist',
    rating: 5.0,
    reviewsCount: 95,
    experience: '5 năm kinh nghiệm',
    avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=300',
    specialties: ['Pilates', 'Cột sống & Posture', 'Dẻo dai'],
    bio: 'Chuyên viên Pilates quốc tế Stott Pilates. Tập trung cải thiện vóc dáng, chỉnh tư thế vai xô và cột sống cho dân văn phòng.',
    status: 'Hoạt động',
    assignedStudentsCount: 14,
    phone: '0933445566',
    email: 'thutrang.pt@fitmanager.vn'
  },
  {
    id: 'pt3',
    name: 'HLV. Lê Hoàng Nam',
    title: 'Chuyên Gia Thể Lực & Posture Fix',
    rating: 4.8,
    reviewsCount: 74,
    experience: '6 năm kinh nghiệm',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    specialties: ['Phục hồi', 'Functional Training', 'Cardio HIIT'],
    bio: 'Cựu vận động viên điền kinh, chuyên sâu phục hồi chấn thương nhẹ và tối ưu sức bền toàn thân.',
    status: 'Hoạt động',
    assignedStudentsCount: 12,
    phone: '0977112233',
    email: 'hoangnam.pt@fitmanager.vn'
  },
  {
    id: 'pt4',
    name: 'HLV. Hoàng Ngọc Anh',
    title: 'PT Tăng Cơ & Dinh Dưỡng Thể Thao',
    rating: 4.9,
    reviewsCount: 110,
    experience: '8 năm kinh nghiệm',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    specialties: ['Dinh dưỡng', 'Giảm cân siêu tốc', 'Boxing'],
    bio: 'Tư vấn phác đồ ăn uống khoa học không ép kiêng khắt khe. Kết hợp Boxing và Cardio giảm mỡ tức thì.',
    status: 'Hoạt động',
    assignedStudentsCount: 16,
    phone: '0988556677',
    email: 'ngocanh.pt@fitmanager.vn'
  }
];

export const assignedStudentsData = [
  {
    id: 'u1',
    name: 'Nguyễn Văn An',
    phone: '0987654321',
    email: 'nguyenvanan@gmail.com',
    packageName: 'Gói Cao Cấp (Premium Plus)',
    currentWeight: 68.5,
    targetWeight: 65.0,
    bodyFat: 18.2,
    completedSessions: 24,
    totalSessions: 36,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    currentPlan: 'Lộ Trình Giảm Cân & Siêu Tăng Cơ 12 Tuần',
    status: 'Đang duy trì'
  },
  {
    id: 'u2',
    name: 'Lê Thu Thảo',
    phone: '0911223344',
    email: 'lethuthao@gmail.com',
    packageName: 'Gói VIP Thượng Đỉnh',
    currentWeight: 52.0,
    targetWeight: 50.0,
    bodyFat: 21.5,
    completedSessions: 18,
    totalSessions: 24,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    currentPlan: 'Pilates Chỉnh Cột Sống & Siêu Săn Chắc Core',
    status: 'Đang duy trì'
  },
  {
    id: 'u3',
    name: 'Vũ Quốc Anh',
    phone: '0977889900',
    email: 'quocanh@gmail.com',
    packageName: 'Gói Cơ Bản (Basic Fit)',
    currentWeight: 78.0,
    targetWeight: 72.0,
    bodyFat: 24.0,
    completedSessions: 6,
    totalSessions: 12,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    currentPlan: 'Khởi Động Thể Lực & Tăng Sức Bền',
    status: 'Mới đăng ký'
  }
];

export const initialSchedules = [
  {
    id: 'sch_1',
    studentId: 'u1',
    studentName: 'Nguyễn Văn An',
    studentPhone: '0987654321',
    trainerId: 'pt1',
    trainerName: 'HLV. Trần Minh Đức',
    trainerAvatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=300',
    date: '2026-10-08',
    time: '09:00 - 10:00',
    workoutType: 'Tập Ngực & Tay Sau (Upper Body)',
    location: 'Khu A - Máy cơ Technogym',
    status: 'Sắp diễn ra',
    note: 'Chuẩn bị bình nước lọc kiềm và băng quấn cổ tay'
  },
  {
    id: 'sch_2',
    studentId: 'u2',
    studentName: 'Lê Thu Thảo',
    studentPhone: '0911223344',
    trainerId: 'pt1',
    trainerName: 'HLV. Trần Minh Đức',
    trainerAvatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=300',
    date: '2026-10-08',
    time: '14:00 - 15:00',
    workoutType: 'Cardio HIIT & Siêu Giảm Mỡ',
    location: 'Khu B - Free Weights',
    status: 'Sắp diễn ra',
    note: 'Tập trung nhịp tim Zone 3'
  },
  {
    id: 'sch_3',
    studentId: 'u1',
    studentName: 'Nguyễn Văn An',
    studentPhone: '0987654321',
    trainerId: 'pt2',
    trainerName: 'HLV. Nguyễn Thu Trang',
    trainerAvatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=300',
    date: '2026-10-10',
    time: '17:30 - 18:30',
    workoutType: 'Pilates Reformer & Chỉnh Tư Thế',
    location: 'Phòng Studio Pilates VIP',
    status: 'Sắp diễn ra',
    note: 'Mang thảm cá nhân hoặc nhận khăn kháng khuẩn VIP'
  },
  {
    id: 'sch_4',
    studentId: 'u3',
    studentName: 'Vũ Quốc Anh',
    studentPhone: '0977889900',
    trainerId: 'pt3',
    trainerName: 'HLV. Lê Hoàng Nam',
    trainerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    date: '2026-10-09',
    time: '18:00 - 19:00',
    workoutType: 'Functional Training & Thể Lực',
    location: 'Khu Functional Zone',
    status: 'Đã xác nhận',
    note: 'Hướng dẫn tập tạ đơn và giãn cơ'
  }
];

export const initialUsersList = [
  { id: 'u1', name: 'Nguyễn Văn An', email: 'nguyenvanan@gmail.com', phone: '0987654321', role: 'USER', package: 'Gói Cao Cấp', status: 'Hoạt động', joinDate: '01/06/2026' },
  { id: 'u2', name: 'Lê Thu Thảo', email: 'lethuthao@gmail.com', phone: '0911223344', role: 'USER', package: 'Gói VIP Elite', status: 'Hoạt động', joinDate: '15/07/2026' },
  { id: 'u3', name: 'Vũ Quốc Anh', email: 'quocanh@gmail.com', phone: '0977889900', role: 'USER', package: 'Gói Cơ Bản', status: 'Hoạt động', joinDate: '10/08/2026' },
  { id: 'pt1', name: 'Trần Minh Đức', email: 'minhduc.pt@fitmanager.vn', phone: '0912345678', role: 'TRAINER', package: 'Master Trainer', status: 'Hoạt động', joinDate: '01/01/2024' },
  { id: 'pt2', name: 'Nguyễn Thu Trang', email: 'thutrang.pt@fitmanager.vn', phone: '0933445566', role: 'TRAINER', package: 'Pilates PT', status: 'Hoạt động', joinDate: '15/03/2024' },
  { id: 'a1', name: 'Phạm Hoàng Nam', email: 'admin@fitmanager.vn', phone: '0999999999', role: 'ADMIN', package: 'System Admin', status: 'Hoạt động', joinDate: '01/01/2023' }
];

export const revenueReportData = {
  totalRevenue: '458.500.000 đ',
  monthlyTarget: '500.000.000 đ',
  growthPercent: '+18.4%',
  breakdown: [
    { name: 'Gói Premium Plus', amount: '298.000.000 đ', percent: '65%' },
    { name: 'Gói VIP Elite', amount: '110.500.000 đ', percent: '24%' },
    { name: 'Gói Basic Fit', amount: '50.000.000 đ', percent: '11%' }
  ],
  monthlyTrends: [
    { month: 'Tháng 5', revenue: 320000000 },
    { month: 'Tháng 6', revenue: 380000000 },
    { month: 'Tháng 7', revenue: 410000000 },
    { month: 'Tháng 8', revenue: 435000000 },
    { month: 'Tháng 9', revenue: 458500000 }
  ]
};

export const adminSummary = {
  totalRevenue: '458.500.000 đ',
  monthlyGrowth: '+18.4%',
  totalMembers: 1240,
  activeTrainers: 18,
  packagesSoldThisMonth: 142
};

export const initialProgress = {
  currentWeight: 68.5,
  startWeight: 74.0,
  targetWeight: 65.0,
  height: 173,
  bmi: 22.9,
  bodyFat: 18.2,
  muscleMass: 34.1,
  completedSessions: 24,
  totalSessionsGoal: 36,
  caloriesBurnedTotal: 14800,
  weightHistory: [
    { date: '01/08/2026', weight: 74.0, bodyFat: 22.1 },
    { date: '15/08/2026', weight: 72.5, bodyFat: 21.0 },
    { date: '01/09/2026', weight: 71.0, bodyFat: 19.8 },
    { date: '15/09/2026', weight: 69.8, bodyFat: 19.0 },
    { date: '01/10/2026', weight: 68.5, bodyFat: 18.2 }
  ]
};

export const initialReviews = [
  {
    id: 'rev_1',
    trainerId: 'pt1',
    trainerName: 'HLV. Trần Minh Đức',
    trainerAvatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=300',
    studentName: 'Nguyễn Văn An',
    rating: 5,
    date: '02/10/2026',
    comment: 'PT Đức hướng dẫn tư thế tập rất chi tiết, theo sát từng rep tập giúp tôi cải thiện sức mạnh vòng ngực rõ rệt!'
  },
  {
    id: 'rev_2',
    trainerId: 'pt2',
    trainerName: 'HLV. Nguyễn Thu Trang',
    trainerAvatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=300',
    studentName: 'Nguyễn Văn An',
    rating: 5,
    date: '25/09/2026',
    comment: 'Bài tập Pilates chỉnh cột sống tuyệt vời, giảm hẳn tình trạng mỏi lưng do ngồi máy tính cả ngày.'
  }
];

export const myPackageInfo = {
  packageName: 'Gói Cao Cấp (Premium Plus)',
  status: 'Đang hoạt động',
  startDate: '01/06/2026',
  endDate: '01/06/2027',
  daysRemaining: 238,
  totalPtSessions: 24,
  usedPtSessions: 6,
  remainingPtSessions: 18,
  inbodyScansUsed: 4,
  privileges: [
    'Truy cập 24/7 toàn hệ thống phòng tập',
    'Tặng 2 buổi PT 1:1 chuyên sâu / tháng',
    'Phân tích chỉ số InBody hàng tuần',
    'Phòng xông hơi Himalaya & Jacuzzi VIP'
  ]
};

export const comparisonFeatures = [
  { name: 'Khung giờ tập luyện', basic: '06:00 - 16:00', premium: '24/7 Toàn thời gian', vip: '24/7 Toàn thời gian' },
  { name: 'Số buổi PT kèm riêng 1:1', basic: '—', premium: '02 Buổi / Tháng', vip: '12 Buổi / Tháng' },
  { name: 'Đo phân tích chỉ số thể trạng InBody', basic: '1 Lần / Quý', premium: 'Hàng tuần (Weekly)', vip: 'Không giới hạn' },
  { name: 'Dịch vụ Sauna & Bể ngâm Jacuzzi nóng lạnh', basic: '—', premium: 'check', vip: 'check' },
  { name: 'Phác trình & Phác đồ dinh dưỡng', basic: 'Mẫu tiêu chuẩn', premium: 'Cá nhân hóa theo mục tiêu', vip: 'Bác sĩ dinh dưỡng tư vấn' },
  { name: 'Tủ khóa cá nhân (Locker)', basic: 'Sử dụng trong ngày', premium: 'Locker điện tử RFID', vip: 'Locker riêng có định tên riêng' },
  { name: 'Nước uống & Bổ sung dinh dưỡng thể thao', basic: 'Nước khoáng & Ion kiềm', premium: 'Nước ion kiềm & Trà Online', vip: 'Whey Protein & BCAA cao cấp' },
  { name: 'Chính sách bảo lưu thời gian tập', basic: 'Tối đa 7 ngày', premium: 'Tối đa 30 ngày', vip: 'Tối đa 90 ngày (Linh hoạt)' }
];

export const faqData = [
  {
    id: 1,
    question: 'Chính sách bảo lưu gói tập khi tôi bận công tác hoặc chấn thương?',
    answer: 'FitManager hỗ trợ học viên bảo lưu gói tập từ 7 ngày đến 90 ngày tùy thuộc vào gói tập quý khách đăng ký.'
  },
  {
    id: 2,
    question: 'Tôi có thể yêu cầu đổi Huấn luyện viên (PT) trong quá trình tập không?',
    answer: 'Có. Quý khách hoàn toàn có quyền yêu cầu đổi PT bất kỳ lúc nào nếu cảm thấy phong cách huấn luyện chưa phù hợp.'
  },
  {
    id: 3,
    question: 'FitManager hỗ trợ những phương thức thanh toán nào?',
    answer: 'Chúng tôi hỗ trợ chuyển khoản ngân hàng (QR Code), thẻ tín dụng (Trả góp 0%), ví điện tử (Momo, ZaloPay) hoặc tại lễ tân.'
  }
];
