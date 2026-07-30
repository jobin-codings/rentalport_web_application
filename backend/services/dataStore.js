const bcrypt = require('bcryptjs');

const CITIES = ['Austin', 'Seattle', 'Denver', 'Miami', 'Chicago'];

const initialUsers = [
  {
    _id: 'usr_admin_1',
    name: 'Admin',
    email: 'admin@rentalport.com',
    password: bcrypt.hashSync('admin@semi', 8),
    role: 'admin',
    city: 'Austin',
    status: 'active',
    isBlocked: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'usr_partner_1',
    name: 'Rahul Nair',
    email: 'rahul.nair@gmail.com',
    password: await bcrypt.hash('back34@jgh', 8),
    role: 'partner',
    city: 'Kochi',
    status: 'active',
    isBlocked: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'usr_customer_1',
    name: 'Aditya Rao',
    email: 'aditya.rao@gmail.com',
    password: await bcrypt.hash('bafhgh45@gh', 8),
    role: 'customer',
    city: 'Mysuru',
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
