const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
require('dotenv').config();

// Fix DNS resolution order for Node 17+ on Windows to resolve MongoDB Atlas SRV records
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore DNS config fallback errors
}

const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Booking = require('./models/Booking');

const seedDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri || uri.includes('username:password')) {
      console.log('Please set a valid MONGODB_URI or MONGO_URI in backend/.env to run database seeding.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    });
    console.log('Connected to MongoDB Atlas. Seeding RentalPort dataset...');

    // Clear existing collections
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});

    // Seed Users
    await User.create([
      {
        name: 'RentalPort Admin',
        email: 'admin@rentalport.com',
        password: await bcrypt.hash('admin123', 8),
        role: 'admin',
        city: 'Kochi',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Rahul Nair',
        email: 'rahul.nair@gmail.com',
        password: await bcrypt.hash('back34@jgh', 8),
        role: 'partner',
        city: 'Kochi',
        license: 'DL-3289456',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Neha Verma',
        email: 'neha.verma@gmail.com',
        password: await bcrypt.hash('bdhaf4@jgh', 8),
        role: 'partner',
        city: 'Delhi',
        license: 'DL-2178345',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@gmail.com',
        password: await bcrypt.hash('ba2v@jhggh', 8),
        role: 'partner',
        city: 'Mumbai',
        license: 'DL-1145298',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Priya Menon',
        email: 'priya.menon@gmail.com',
        password: await bcrypt.hash('bacse@jgh', 8),
        role: 'partner',
        city: 'Chennai',
        license: 'DL-7841259',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Arjun Patel',
        email: 'arjun.patel@gmail.com',
        password: await bcrypt.hash('bagdd2vf@gh', 8),
        role: 'partner',
        city: 'Ahmedabad',
        license: 'DL-5598214',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Sneha Iyer',
        email: 'sneha.iyer@gmail.com',
        password: await bcrypt.hash('abac@2@fdffgh', 8),
        role: 'partner',
        city: 'Hyderabad',
        license: 'DL-4412389',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Karan Joshi',
        email: 'karan.joshi@gmail.com',
        password: await bcrypt.hash('bndkjgds@@jgh', 8),
        role: 'partner',
        city: 'Pune',
        license: 'DL-2257811',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Anjali Das',
        email: 'anjali.das@gmail.com',
        password: await bcrypt.hash('ck34@bavfjgh', 8),
        role: 'partner',
        city: 'Kolkata',
        license: 'DL-9921345',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Rohan Kapoor',
        email: 'rohan.kapoor@gmail.com',
        password: await bcrypt.hash('ackvg34@bjgh', 8),
        role: 'partner',
        city: 'Jaipur',
        license: 'DL-7145238',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Meera Pillai',
        email: 'meera.pillai@gmail.com',
        password: await bcrypt.hash('back34@jgh', 8),
        role: 'partner',
        city: 'Thiruvananthapuram',
        license: 'DL-6782145',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Aditya Rao',
        email: 'aditya.rao@gmail.com',
        password: await bcrypt.hash('bafhgh45@gh', 8),
        role: 'customer',
        city: 'Mysuru',
        license: 'DL-1102345',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Aisha Khan',
        email: 'aisha.khan@gmail.com',
        password: await bcrypt.hash('baf121@2@h', 8),
        role: 'customer',
        city: 'Lucknow',
        license: 'DL-1102346',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Ritesh Gupta',
        email: 'ritesh.gupta@gmail.com',
        password: await bcrypt.hash('baffghasw@5@gh', 8),
        role: 'customer',
        city: 'Nagpur',
        license: 'DL-1102347',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Nikhil Thomas',
        email: 'nikhil.thomas@gmail.com',
        password: await bcrypt.hash('bafhghfg@86gh', 8),
        role: 'customer',
        city: 'Kochi',
        license: 'DL-1102348',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Divya Reddy',
        email: 'divya.reddy@gmail.com',
        password: await bcrypt.hash('b@fr32dhgh', 8),
        role: 'customer',
        city: 'Hyderabad',
        license: 'DL-1102349',
        createdAt: '2026-07-26T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Harish Kumar',
        email: 'harish.kumar@gmail.com',
        password: await bcrypt.hash('bcvcvg@@#@gh', 8),
        role: 'customer',
        city: 'Coimbatore',
        license: 'DL-1102350',
        createdAt: '2026-07-29T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Pooja Sharma',
        email: 'pooja.sharma@gmail.com',
        password: await bcrypt.hash('gfdjfg@@@h45@gh', 8),
        role: 'customer',
        city: 'Indore',
        license: 'DL-1102351',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Varun Mishra',
        email: 'varun.mishra@gmail.com',
        password: await bcrypt.hash('bafxjh453@gh', 8),
        role: 'customer',
        city: 'Bhopal',
        license: 'DL-1102352',
        createdAt: '2026-07-20T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Sanjana Roy',
        email: 'sanjana.roy@gmail.com',
        password: await bcrypt.hash('b353cdfs2@gh', 8),
        role: 'customer',
        city: 'Kolkata',
        license: 'DL-1102353',
        createdAt: '2026-06-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Akash Jain',
        email: 'akash.jain@gmail.com',
        password: await bcrypt.hash('bakgndkj@6456h', 8),
        role: 'customer',
        city: 'Surat',
        license: 'DL-1102354',
        createdAt: '2026-07-22T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Nisha George',
        email: 'nisha.george@gmail.com',
        password: await bcrypt.hash('bafghfh@gh', 8),
        role: 'customer',
        city: 'Thrissur',
        license: 'DL-1102355',
        createdAt: '2026-07-10T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Suresh Babu',
        email: 'suresh.babu@gmail.com',
        password: await bcrypt.hash('b@jkh@jkgh', 8),
        role: 'customer',
        city: 'Kannur',
        license: 'DL-1102356',
        createdAt: '2026-07-08T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Farhan Ali',
        email: 'farhan.ali@gmail.com',
        password: await bcrypt.hash('bafgh@fd3445@gh', 8),
        role: 'customer',
        city: 'Patna',
        license: 'DL-1102357',
        createdAt: '2026-06-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Keerthana S',
        email: 'keerthana.s@gmail.com',
        password: await bcrypt.hash('sdf@badfh45@gh', 8),
        role: 'customer',
        city: 'Madurai',
        license: 'DL-1102358',
        createdAt: '2026-06-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Manoj Kulkarni',
        email: 'manoj.k@gmail.com',
        password: await bcrypt.hash('hdghn,s@gh45@gh', 8),
        role: 'customer',
        city: 'Hubballi',
        license: 'DL-1102359',
        createdAt: '2026-07-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Ananya Bose',
        email: 'ananya.bose@gmail.com',
        password: await bcrypt.hash('bafbfbcflim@2343gh', 8),
        role: 'customer',
        city: 'Guwahati',
        license: 'DL-1102360',
        createdAt: '2026-07-25T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Deepak Yadav',
        email: 'deepak.yadav@gmail.com',
        password: await bcrypt.hash('fgda2@@5@gh', 8),
        role: 'customer',
        city: 'Ranchi',
        license: 'DL-1102361',
        createdAt: '2026-03-28T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      },
      {
        name: 'Mohit Saxena',
        email: 'mohit.saxena@gmail.com',
        password: await bcrypt.hash('ljhn@445@gh', 8),
        role: 'customer',
        city: 'Noida',
        license: 'DL-1102363',
        createdAt: '2026-07-21T14:35:16.240Z',
        status: 'active',
        isBlocked: false
      }
    ]);

    // Seed Vehicles
    const vehiclesData = [
     
      {
        id: 'v1',
        kind: 'car',
        emoji: '🚙',
        name: 'Maruti Suzuki Swift',
        tagline: 'Reliable city hatchback',
        city: 'Kochi',
        seats: 5,
        transmission: 'Manual',
        fuel: 'Petrol',
        rate: 500,
        weeklyRate: 3000,
        monthlyRate: 15000,
        available: true,
        bg: '#EF4444',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785344897/Maruti_Suzuki_Swift-1_eu69zh.jpg',
        ownerEmail: 'rahul.nair@gmail.com',
        status: 'approved'
      },
      {
        id: 'v2',
        kind: 'car',
        emoji: '🚙',
        name: 'Hyundai i20',
        tagline: 'Premium hatchback',
        city: 'Bengaluru',
        seats: 5,
        transmission: 'Automatic',
        fuel: 'Petrol',
        rate: 850,
        weeklyRate: 3000,
        monthlyRate: 15000,
        available: true,
        bg: '#2563EB',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345144/Hyundai_Creta-4_levhta.jpg',
        ownerEmail: 'neha.verma@gmail.com',
        status: 'approved'
      },
      {
        id: 'v3',
        kind: 'car',
        emoji: '🚙',
        name: 'Hyundai Creta',
        tagline: 'Comfortable family SUV',
        city: 'Hyderabad',
        seats: 5,
        transmission: 'Automatic',
        fuel: 'Diesel',
        rate: 500,
        weeklyRate: 3000,
        monthlyRate: 16000,
        available: true,
        bg: '#059669',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345144/Hyundai_Creta-4_levhta.jpg',
        ownerEmail: 'vikram.singh@gmail.com',
        status: 'approved'
      },
      {
        id: 'v4',
        kind: 'car',
        emoji: '🚙',
        name: 'Kia Seltos',
        tagline: 'Feature-packed SUV',
        city: 'Chennai',
        seats: 5,
        transmission: 'Automatic',
        fuel: 'Petrol',
        rate: 500,
        weeklyRate: 3000,
        monthlyRate: 15000,
        available: true,
        bg: '"#F97316',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345141/Kia_Seltos-1_y4mfen.jpg',
        ownerEmail: 'priya.menon@gmail.com',
        status: 'approved'
      },
      {
        id: 'v5',
        kind: 'car',
        emoji: '🚙',
        name: 'Toyota Innova Crysta',
        tagline: 'Perfect for family trips',
        city: 'Coimbatore',
        seats: 7,
        transmission: 'Manual',
        fuel: 'Diesel',
        rate: 800,
        weeklyRate: 4000,
        monthlyRate: 18000,
        available: true,
        bg: '"#7C3AED',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345140/Toyota_Innova_Crysta-2_kj5ii2.jpg',
        ownerEmail: 'arjun.patel@gmail.com',
        status: 'approved'
      },
      {
        id: 'v6',
        kind: 'car',
        emoji: '🚙',
        name: 'Mahindra Thar',
        tagline: 'Adventure awaits',
        city: 'Mysuru',
        seats: 4,
        transmission: 'Manual',
        fuel: 'Diesel',
        rate: 1000,
        weeklyRate: 6000,
        monthlyRate: 20000,
        available: true,
        bg: '"#DC2626',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345140/Mahindra_Thar-3_yymvum.jpg',
        ownerEmail: 'sneha.iyer@gmail.com',
        status: 'approved'
      },
      {
        id: 'v7',
        kind: 'car',
        emoji: '🚙',
        name: 'Tata Nexon',
        tagline: 'Safe compact SUV',
        city: 'Thiruvananthapuram',
        seats: 5,
        transmission: 'Manual',
        fuel: 'Petrol',
        rate: 800,
        weeklyRate: 4000,
        monthlyRate: 18000,
        available: true,
        bg: '"#0F766E',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345138/Tata_Nexon-3_sr9nnq.jpg',
        ownerEmail: 'karan.joshi@gmail.com',
        status: 'approved'
      },
      {
        id: 'v8',
        kind: 'car',
        emoji: '🚙',
        name: 'Honda City',
        tagline: 'Premium sedan for smooth rides',
        city: 'Kozhikode',
        seats: 5,
        transmission: 'Automatic',
        fuel: 'Petrol',
        rate: 800,
        weeklyRate: 4000,
        monthlyRate: 18500,
        available: true,
        bg: '"#1D4ED8',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345136/Honda_City-1_udthyu.jpg',
        ownerEmail: 'anjali.das@gmail.com',
        status: 'approved'
      },
      {
        id: 'v9',
        kind: 'bike',
        emoji: '🏍️',
        name: 'Royal Enfield Classic 350',
        tagline: 'Timeless cruiser',
        city: 'Kochi',
        seats: 2,
        transmission: 'Manual',
        fuel: 'Petrol',
        rate: 400,
        weeklyRate: 2000,
        monthlyRate: 12000,
        available: true,
        bg: '"#7C2D12',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345134/Royal_Enfield_Classic_350-1_eikbnc.jpg',
        ownerEmail: 'rohan.kapoor@gmail.com',
        status: 'approved'
      },
      {
        id: 'v10',
        kind: 'bike',
        emoji: '🏍️',
        name: 'Royal Enfield Hunter 350',
        tagline: 'Modern urban cruiser',
        city: 'Bengaluru',
        seats: 2,
        transmission: 'Manual',
        fuel: 'Petrol',
        rate: 500,
        weeklyRate: 3000,
        monthlyRate: 14000,
        available: true,
        bg: '"#991B1B',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345133/Royal_Enfield_Hunter_350-1_x2qbyl.jpg',
        ownerEmail: 'meera.pillai@gmail.com',
        status: 'approved'
      },
      {
        id: 'v11',
        kind: 'bike',
        emoji: '🏍️',
        name: 'TVS Apache RTR 160 4V',
        tagline: 'Performance street bike',
        city: 'Chennai',
        seats: 2,
        transmission: 'Manual',
        fuel: 'Petrol',
        rate: 400,
        weeklyRate: 2000,
        monthlyRate: 11000,
        available: true,
        bg: '"#EA580C',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345132/TVS_Apache_RTR_160_4V-1_czyx7t.jpg',
        ownerEmail: 'rahul.nair@gmail.com',
        status: 'approved'
      },
      {
        id: 'v12',
        kind: 'bike',
        emoji: '🏍️',
        name: 'Bajaj Pulsar NS200',
        tagline: 'Power meets agility',
        city: 'Hyderabad',
        seats: 2,
        transmission: 'Manual',
        fuel: 'Petrol',
        rate: 500,
        weeklyRate: 3000,
        monthlyRate: 14000,
        available: true,
        bg: '"#4B5563',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345130/Bajaj_Pulsar_NS200-2_zystkz.jpg',
        ownerEmail: 'neha.verma@gmail.com',
        status: 'approved'
      },
      {
        id: 'v13',
        kind: 'bike',
        emoji: '🏍️',
        name: 'KTM Duke 390',
        tagline: 'Thrilling naked sports bike',
        city: 'Bangaluru',
        seats: 2,
        transmission: 'Manual',
        fuel: 'Petrol',
        rate: 500,
        weeklyRate: 3000,
        monthlyRate: 14000,
        available: true,
        bg: '"#F97316',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345129/KTM_Duke_390-1_shhc0o.jpg',
        ownerEmail: 'vikram.singh@gmail.com',
        status: 'approved'
      },
      {
        id: 'v14',
        kind: 'bike',
        emoji: '🏍️',
        name: 'Yamaha MT-15',
        tagline: 'Lightweight street fighter',
        city: 'Thrissur',
        seats: 2,
        transmission: 'Manual',
        fuel: 'Petrol',
        rate: 500,
        weeklyRate: 3000,
        monthlyRate: 14000,
        available: true,
        bg: '"#2563EB',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345128/Yamaha_MT-15-3_i26cci.jpg',
        ownerEmail: 'priya.menon@gmail.com',
        status: 'approved'
      },
      {
        id: 'v15',
        kind: 'car',
        emoji: '🚙',
        name: 'Maruti Suzuki Swift',
        tagline: 'Fuel-efficient daily ride',
        city: 'Bangaluru',
        seats: 5,
        transmission: 'Manual',
        fuel: 'Petrol',
        rate: 700,
        weeklyRate: 6000,
        monthlyRate: 20000,
        available: true,
        bg: '"#DC2626',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785344897/Maruti_Suzuki_Swift-2_e7zlno.jpg',
        ownerEmail: 'arjun.patel@gmail.com',
        status: 'approved'
      },
      {
        id: 'v16',
        kind: 'car',
        emoji: '🚙',
        name: 'Hyundai Creta',
        tagline: 'Premium SUV for road trips',
        city: 'Kochi',
        seats: 5,
        transmission: 'Automatic',
        fuel: 'Diesel',
        rate: 800,
        weeklyRate: 4000,
        monthlyRate: 21000,
        available: true,
        bg: '#0F766E',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345143/Hyundai_Creta-3_wj7oim.jpg',
        ownerEmail: 'sneha.iyer@gmail.com',
        status: 'approved'
      },
      {
        id: 'v17',
        kind: 'bike',
        emoji: '🏍️',
        name: 'Royal Enfield Classic 350',
        tagline: 'Perfect for long rides',
        city: 'Wayanad',
        seats: 2,
        transmission: 'Manual',
        fuel: 'Petrol',
        rate: 500,
        weeklyRate: 4000,
        monthlyRate: 15000,
        available: true,
        bg: '#7C2D12',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345133/Royal_Enfield_Hunter_350-1_x2qbyl.jpg',
        ownerEmail: 'rohan.kapoor@gmail.com',
        status: 'approved'
      },
      {
        id: 'v18',
        kind: 'bike',
        emoji: '🏍️',
        name: 'Honda Activa 6G',
        tagline: 'Easy city commuting',
        city: 'Chennai',
        seats: 2,
        transmission: 'Automatic',
        fuel: 'Petrol',
        rate: 500,
        weeklyRate: 3000,
        monthlyRate: 12000,
        available: true,
        bg: '#16A34A',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345127/Honda_Activa_6G-3_yc3xbg.jpg',
        ownerEmail: 'rahul.nair@gmail.com',
        status: 'approved'
      },
      {
        id: 'v19',
        kind: 'bike',
        emoji: '🏍️',
        name: 'TVS Apache RTR 160 4',
        tagline: 'Sporty commuter bike',
        city: 'Palakkad',
        seats: 2,
        transmission: 'Manual',
        fuel: 'Petrol',
        rate: 500,
        weeklyRate: 3000,
        monthlyRate: 14000,
        available: true,
        bg: '#EA580C',
        image: 'https://res.cloudinary.com/slgmxidx/image/upload/v1785345133/TVS_Apache_RTR_160_4V-3_igqsi5.jpg',
        ownerEmail: 'sneha.iyer@gmail.com',
        status: 'approved'
      }
    ];

    await Vehicle.insertMany(vehiclesData);

    const today = new Date();
    const formatDate = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().slice(0, 10);
    };

    await Booking.create([
      {
        id: 'BK-1001',
        vehicleId: 'v1',
        vehicleName: 'Civic Hatchback',
        emoji: '',
        customerEmail: 'jordan@example.com',
        customerName: 'Jordan Rivera',
        ownerEmail: 'partner@rentalport.com',
        from: formatDate(2),
        to: formatDate(5),
        city: 'Austin',
        total: 6600,
        status: 'approved',
        paymentStatus: 'paid',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'BK-1002',
        vehicleId: 'v6',
        vehicleName: 'Velocity GT Coupe',
        emoji: '',
        customerEmail: 'jordan@example.com',
        customerName: 'Jordan Rivera',
        ownerEmail: 'partner@rentalport.com',
        from: formatDate(7),
        to: formatDate(10),
        city: 'Austin',
        total: 16500,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('RentalPort MongoDB Atlas Seeding Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err.message);
    process.exit(1);
  }
};

seedDB();
