const bcrypt = require('bcryptjs');

const CITIES = ['Austin', 'Seattle', 'Denver', 'Miami', 'Chicago'];

const initialUsers = [
  {
    _id: 'usr_admin_1',
    name: 'RentalPort Admin',
    email: 'admin@rentalport.com',
    password: bcrypt.hashSync('admin123', 8),
    role: 'admin',
    city: 'Austin',
    status: 'active',
    isBlocked: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'usr_partner_1',
    name: 'Morgan Yates',
    email: 'partner@rentalport.com',
    password: bcrypt.hashSync('partner123', 8),
    role: 'partner',
    city: 'Austin',
    status: 'active',
    isBlocked: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'usr_customer_1',
    name: 'Jordan Rivera',
    email: 'jordan@example.com',
    password: bcrypt.hashSync('customer123', 8),
    role: 'customer',
    city: 'Austin',
    license: 'DL-2381092',
    status: 'active',
    isBlocked: false,
    createdAt: new Date().toISOString()
  }
];

let VID = 0;
const mkVehicle = (o) => {
  VID++;
  const rate = o.rate || 1500;
  const weeklyRate = o.weeklyRate || Math.round(rate * 6);
  const monthlyRate = o.monthlyRate || Math.round(rate * 22);
  const vNum = o.vehicleNumber || `REG-${1000 + VID}`;
  const veh = Object.assign({
    _id: `veh_${VID}`,
    id: `v${VID}`,
    vehicleNumber: vNum,
    brand: o.brand || o.name.split(' ')[0],
    model: o.model || o.name,
    weeklyRate,
    monthlyRate,
    inMaintenance: false,
    status: 'approved'
  }, o);
  delete veh.emoji;
  return veh;
};

const initialVehicles = [
  mkVehicle({ kind: 'car', name: 'Civic Hatchback', tagline: 'Sporty city hatch', city: 'Austin', seats: 5, transmission: 'Automatic', fuel: 'Petrol', rate: 2200, available: true, bg: '#1E293B', image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80', ownerEmail: 'partner@rentalport.com' }),
  mkVehicle({ kind: 'car', name: 'Trailblazer SUV', tagline: 'All-terrain family SUV', city: 'Seattle', seats: 7, transmission: 'Automatic', fuel: 'Diesel', rate: 3800, available: true, bg: '#151D30', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', ownerEmail: 'partner@rentalport.com' }),
  mkVehicle({ kind: 'car', name: 'Sable Luxury Sedan', tagline: 'Executive comfort sedan', city: 'Denver', seats: 5, transmission: 'Automatic', fuel: 'Hybrid', rate: 3200, available: true, bg: '#1E1B4B', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', ownerEmail: 'partner@rentalport.com' }),
  mkVehicle({ kind: 'car', name: 'Voyager Touring Van', tagline: '8-seat passenger van', city: 'Miami', seats: 8, transmission: 'Manual', fuel: 'Diesel', rate: 4200, available: true, bg: '#311B92', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80', ownerEmail: 'partner@rentalport.com' }),
  mkVehicle({ kind: 'car', name: 'Spark Compact Mini', tagline: 'Agile budget runabout', city: 'Chicago', seats: 4, transmission: 'Manual', fuel: 'Petrol', rate: 1600, available: true, bg: '#0F172A', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80', ownerEmail: 'partner@rentalport.com' }),
  mkVehicle({ kind: 'car', name: 'Velocity GT Coupe', tagline: 'High-performance sports car', city: 'Austin', seats: 2, transmission: 'Automatic', fuel: 'Petrol', rate: 5500, available: true, bg: '#451A03', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', ownerEmail: 'partner@rentalport.com' }),
  mkVehicle({ kind: 'bike', name: 'Roadster 250 Cruiser', tagline: 'Urban cruiser motorcycle', city: 'Austin', seats: 2, transmission: 'Manual', fuel: 'Petrol', rate: 900, available: true, bg: '#064E3B', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80', ownerEmail: 'partner@rentalport.com' }),
  mkVehicle({ kind: 'bike', name: 'Scoot Mini EV', tagline: 'Electric urban scooter', city: 'Seattle', seats: 1, transmission: 'Automatic', fuel: 'Electric', rate: 600, available: true, bg: '#1E293B', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80', ownerEmail: 'partner@rentalport.com' }),
  mkVehicle({ kind: 'bike', name: 'Pedal Pro Speedster', tagline: '10-speed road bicycle', city: 'Denver', seats: 1, transmission: 'Manual', fuel: 'None', rate: 400, available: true, bg: '#0F172A', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80', ownerEmail: 'partner@rentalport.com' }),
  mkVehicle({ kind: 'bike', name: 'Highway King Tourer', tagline: 'Heavy touring motorbike', city: 'Miami', seats: 2, transmission: 'Manual', fuel: 'Petrol', rate: 1400, available: true, bg: '#311B92', image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80', ownerEmail: 'partner@rentalport.com' }),
  mkVehicle({ kind: 'bike', name: 'Volt Glide Pro', tagline: 'Long-range electric scooter', city: 'Chicago', seats: 1, transmission: 'Automatic', fuel: 'Electric', rate: 800, available: true, bg: '#064E3B', image: 'https://images.unsplash.com/photo-1571188654248-7a89213915f7?auto=format&fit=crop&w=800&q=80', ownerEmail: 'partner@rentalport.com' }),
  mkVehicle({ kind: 'bike', name: 'Trail Hopper MTB', tagline: 'All-terrain mountain bike', city: 'Austin', seats: 1, transmission: 'Manual', fuel: 'None', rate: 500, available: true, bg: '#451A03', image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80', ownerEmail: 'partner@rentalport.com' })
];

const initialBookings = [];

let users = [...initialUsers];
let vehicles = [...initialVehicles];
let bookings = [...initialBookings];

module.exports = {
  getCities: () => CITIES,
  addCity: (city) => { if (!CITIES.includes(city)) CITIES.push(city); },
  getUsers: () => users,
  addUser: (user) => { 
    if (user.status === undefined) user.status = 'active';
    if (user.isBlocked === undefined) user.isBlocked = false;
    users.push(user); 
    return user; 
  },
  findUserByEmail: (email) => users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  updateUserBlockStatus: (userId, isBlocked) => {
    const idx = users.findIndex(u => u._id === userId || u.email === userId);
    if (idx !== -1) {
      users[idx].isBlocked = Boolean(isBlocked);
      users[idx].status = isBlocked ? 'blocked' : 'active';
      return users[idx];
    }
    return null;
  },
  getVehicles: () => vehicles,
  addVehicle: (v) => { delete v.emoji; vehicles.push(v); return v; },
  findVehicleById: (id) => vehicles.find(v => v.id === id || v._id === id || String(v._id) === String(id)),
  updateVehicle: (id, updates) => {
    const idx = vehicles.findIndex(v => v.id === id || v._id === id || String(v._id) === String(id));
    if (idx !== -1) {
      delete updates.emoji;
      vehicles[idx] = { ...vehicles[idx], ...updates };
      return vehicles[idx];
    }
    return null;
  },
  removeVehicle: (id) => {
    const idx = vehicles.findIndex(v => v.id === id || v._id === id || String(v._id) === String(id));
    if (idx !== -1) {
      return vehicles.splice(idx, 1)[0];
    }
    return null;
  },
  getBookings: () => bookings,
  addBooking: (bk) => { delete bk.emoji; bookings.push(bk); return bk; },
  updateBooking: (id, updates) => {
    const idx = bookings.findIndex(b => b.id === id || b._id === id || String(b._id) === String(id));
    if (idx !== -1) {
      delete updates.emoji;
      bookings[idx] = { ...bookings[idx], ...updates };
      return bookings[idx];
    }
    return null;
  }
};
