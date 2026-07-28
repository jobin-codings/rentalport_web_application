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
      console.log('⚠️ Please set a valid MONGODB_URI or MONGO_URI in backend/.env to run database seeding.');
      process.exit(1);
    }

    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    });
    console.log('✅ Connected to MongoDB Atlas. Seeding RentalPort dataset...');

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
        city: 'Austin'
      },
      {
        name: 'Morgan Yates',
        email: 'partner@rentalport.com',
        password: await bcrypt.hash('partner123', 8),
        role: 'partner',
        city: 'Austin'
      },
      {
        name: 'Jordan Rivera',
        email: 'jordan@example.com',
        password: await bcrypt.hash('customer123', 8),
        role: 'customer',
        city: 'Austin',
        license: 'DL-2381092'
      }
    ]);

    // Seed Vehicles with Real Photography
    const vehiclesData = [
      {
        id: 'v1',
        kind: 'car',
        emoji: '🚗',
        name: 'Civic Hatchback',
        tagline: 'Sporty city hatch',
        city: 'Austin',
        seats: 5,
        transmission: 'Automatic',
        fuel: 'Petrol',
        rate: 42,
        available: true,
        bg: '#1E293B',
        image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
        ownerEmail: 'partner@rentalport.com',
        status: 'approved'
      },
      {
        id: 'v2',
        kind: 'car',
        emoji: '🚙',
        name: 'Trailblazer SUV',
        tagline: 'All-terrain family SUV',
        city: 'Seattle',
        seats: 7,
        transmission: 'Automatic',
        fuel: 'Diesel',
        rate: 68,
        available: true,
        bg: '#151D30',
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
        ownerEmail: 'partner@rentalport.com',
        status: 'approved'
      },
      {
        id: 'v3',
        kind: 'car',
        emoji: '🚘',
        name: 'Sable Luxury Sedan',
        tagline: 'Executive comfort sedan',
        city: 'Denver',
        seats: 5,
        transmission: 'Automatic',
        fuel: 'Hybrid',
        rate: 55,
        available: true,
        bg: '#1E1B4B',
        image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
        ownerEmail: 'partner@rentalport.com',
        status: 'approved'
      },
      {
        id: 'v4',
        kind: 'car',
        emoji: '🚐',
        name: 'Voyager Touring Van',
        tagline: '8-seat passenger van',
        city: 'Miami',
        seats: 8,
        transmission: 'Manual',
        fuel: 'Diesel',
        rate: 74,
        available: true,
        bg: '#311B92',
        image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
        ownerEmail: 'partner@rentalport.com',
        status: 'approved'
      },
      {
        id: 'v5',
        kind: 'car',
        emoji: '🚗',
        name: 'Spark Compact Mini',
        tagline: 'Agile budget runabout',
        city: 'Chicago',
        seats: 4,
        transmission: 'Manual',
        fuel: 'Petrol',
        rate: 30,
        available: true,
        bg: '#0F172A',
        image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
        ownerEmail: 'partner@rentalport.com',
        status: 'approved'
      },
      {
        id: 'v6',
        kind: 'car',
        emoji: '🏎️',
        name: 'Velocity GT Coupe',
        tagline: 'High-performance sports car',
        city: 'Austin',
        seats: 2,
        transmission: 'Automatic',
        fuel: 'Petrol',
        rate: 95,
        available: true,
        bg: '#451A03',
        image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
        ownerEmail: 'partner@rentalport.com',
        status: 'approved'
      },
      {
        id: 'v7',
        kind: 'bike',
        emoji: '🏍️',
        name: 'Roadster 250 Cruiser',
        tagline: 'Urban cruiser motorcycle',
        city: 'Austin',
        seats: 2,
        transmission: 'Manual',
        fuel: 'Petrol',
        rate: 18,
        available: true,
        bg: '#064E3B',
        image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
        ownerEmail: 'partner@rentalport.com',
        status: 'approved'
      },
      {
        id: 'v8',
        kind: 'bike',
        emoji: '🛵',
        name: 'Scoot Mini EV',
        tagline: 'Electric urban scooter',
        city: 'Seattle',
        seats: 1,
        transmission: 'Automatic',
        fuel: 'Electric',
        rate: 12,
        available: true,
        bg: '#1E293B',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
        ownerEmail: 'partner@rentalport.com',
        status: 'approved'
      },
      {
        id: 'v9',
        kind: 'bike',
        emoji: '🚲',
        name: 'Pedal Pro Speedster',
        tagline: '10-speed road bicycle',
        city: 'Denver',
        seats: 1,
        transmission: 'Manual',
        fuel: 'None',
        rate: 8,
        available: true,
        bg: '#0F172A',
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
        ownerEmail: 'partner@rentalport.com',
        status: 'approved'
      },
      {
        id: 'v10',
        kind: 'bike',
        emoji: '🏍️',
        name: 'Highway King Tourer',
        tagline: 'Heavy touring motorbike',
        city: 'Miami',
        seats: 2,
        transmission: 'Manual',
        fuel: 'Petrol',
        rate: 28,
        available: true,
        bg: '#311B92',
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
        ownerEmail: 'partner@rentalport.com',
        status: 'approved'
      },
      {
        id: 'v11',
        kind: 'bike',
        emoji: '🛵',
        name: 'Volt Glide Pro',
        tagline: 'Long-range electric scooter',
        city: 'Chicago',
        seats: 1,
        transmission: 'Automatic',
        fuel: 'Electric',
        rate: 15,
        available: true,
        bg: '#064E3B',
        image: 'https://images.unsplash.com/photo-1571188654248-7a89213915f7?auto=format&fit=crop&w=800&q=80',
        ownerEmail: 'partner@rentalport.com',
        status: 'approved'
      },
      {
        id: 'v12',
        kind: 'bike',
        emoji: '🚲',
        name: 'Trail Hopper MTB',
        tagline: 'All-terrain mountain bike',
        city: 'Austin',
        seats: 1,
        transmission: 'Manual',
        fuel: 'None',
        rate: 10,
        available: true,
        bg: '#451A03',
        image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80',
        ownerEmail: 'partner@rentalport.com',
        status: 'approved'
      }
    ];

    await Vehicle.insertMany(vehiclesData);

    // Seed Sample Bookings for conflict testing & revenue analytics
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
        emoji: '🚗',
        customerEmail: 'jordan@example.com',
        customerName: 'Jordan Rivera',
        ownerEmail: 'partner@rentalport.com',
        from: formatDate(2),
        to: formatDate(5),
        city: 'Austin',
        total: 126,
        status: 'approved',
        paymentStatus: 'paid',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'BK-1002',
        vehicleId: 'v6',
        vehicleName: 'Velocity GT Coupe',
        emoji: '🏎️',
        customerEmail: 'jordan@example.com',
        customerName: 'Jordan Rivera',
        ownerEmail: 'partner@rentalport.com',
        from: formatDate(7),
        to: formatDate(10),
        city: 'Austin',
        total: 285,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('🎉 RentalPort MongoDB Atlas Seeding Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err.message);
    process.exit(1);
  }
};

seedDB();
