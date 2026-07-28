# Implementation Plan — Centralized Web-Based Vehicle Rental System with Visual Calendar Date Picker

Enhance and solidify the centralized web-based vehicle rental system to adhere strictly to all functional requirements, non-functional requirements, agency features, admin control capabilities, Key Performance Indicators (KPIs), flexible rental pricing models (daily/weekly/monthly), interactive calendar date selection, and technical documentation.

## User Review Required

> [!IMPORTANT]
> **New Feature: Interactive Visual Month Calendar Component (`AvailabilityCalendar.jsx`)**:
> - When selecting dates in the booking flow or vehicle modal, users will see a full visual month calendar.
> - **Green/Clear dates**: Available for selection.
> - **Red / Cross-hatched dates**: Already booked/reserved (disabled for selection).
> - **Interactive range selection**: Clicking a start date and an end date automatically populates the pickup date, pickup time, return date, and return time with conflict prevention.

> [!NOTE]
> All existing user roles (Customer, Partner/Agency, Admin), license plate themes, and second-verification modals will be fully preserved while adding the missing filtering, maintenance blocking, visual calendar picker, and KPI analytics.

## Open Questions

None. All requirements have been clearly detailed in the prompt specification.

---

## Proposed Changes

### Frontend Components & Interactive Calendar

#### [NEW] [AvailabilityCalendar.jsx](file:///c:/Users/User/Desktop/Project%20File/Rental-System/frontend/src/components/AvailabilityCalendar.jsx)
- Interactive monthly grid calendar component.
- Accepts `bookedRanges` (array of `{ from, to, status }`), `startDate`, `endDate`, and `onSelectRange(start, end)`.
- Renders days of the current month & navigation controls (Previous Month / Next Month).
- Highlights:
  - 🟩 **Available Days**: Active, clickable, hover glow effect.
  - 🟥 **Booked Days**: Crossed out in red, labeled "Booked", unselectable.
  - 🟧 **Selected Range**: Amber highlighted range between pickup and return date.

#### [MODIFY] [BookingFlow.jsx](file:///c:/Users/User/Desktop/Project%20File/Rental-System/frontend/src/components/BookingFlow.jsx)
- Embed `<AvailabilityCalendar>` directly into the booking form step.
- Allow users to click dates on the visual calendar to set Pickup Date & Return Date.
- Include Pickup Time (e.g. `09:00 AM`) and Return Time (e.g. `05:00 PM`) dropdown selectors.
- Calculate flexible duration rates (Daily, Weekly 15% OFF, Monthly 35% OFF).

#### [MODIFY] [VehicleModal.jsx](file:///c:/Users/User/Desktop/Project%20File/Rental-System/frontend/src/components/VehicleModal.jsx)
- Embed `<AvailabilityCalendar>` inside the vehicle details overlay modal so customers can immediately view open vs booked calendar slots before clicking "Book this vehicle".

#### [MODIFY] [FleetScreen.jsx](file:///c:/Users/User/Desktop/Project%20File/Rental-System/frontend/src/components/FleetScreen.jsx)
- Enhance search and filter panel with:
  - 2W (Two-Wheeler) vs 4W (Four-Wheeler) filter toggle
  - Fuel Type filter (Petrol, Diesel, Electric, Hybrid, None)
  - Price Range filter slider with Min & Max values
  - Rental Duration preference selector (Daily, Weekly, Monthly rate preview)
  - Pickup Date & Pickup Time, Return Date & Return Time inputs
- Display vehicle registration number (`vehicleNumber`), fuel badge, 2W/4W tag, and daily/weekly/monthly rate cards on vehicle grid.

#### [MODIFY] [PartnerDashboard.jsx](file:///c:/Users/User/Desktop/Project%20File/Rental-System/frontend/src/components/PartnerDashboard.jsx)
- Add form inputs for Vehicle Registration Number, Brand & Model, Daily Rate ($), Weekly Rate ($), Monthly Rate ($).
- Add "Block for Maintenance" toggle for each listed vehicle so agency owners can take vehicles offline for servicing.
- Add active rentals tracker with customer details, pickup/return times, vehicle registration, and status.

#### [MODIFY] [AdminDashboard.jsx](file:///c:/Users/User/Desktop/Project%20File/Rental-System/frontend/src/components/AdminDashboard.jsx)
- Render dedicated KPI cards displaying: Registered Users, Booking Conversion Rate, Vehicle Utilization Rate, Booking Conflict Rate, Average Rental Duration, and Monthly Active Users (MAU).
- Provide interactive modals to inspect detailed breakdowns for each KPI metric.
- Enhance partner and customer management directory with active status and vehicle count details.

---

### Backend Database Models & API Routes

#### [MODIFY] [Vehicle.js](file:///c:/Users/User/Desktop/Project%20File/Rental-System/backend/models/Vehicle.js)
- Add `vehicleNumber` (String, required: true, default: e.g. `'REG-XXXX'`) for rental agency fleet tracking.
- Add `brand` (String) and `model` (String) fields.
- Add `weeklyRate` (Number) and `monthlyRate` (Number) fields for flexible pricing tiers.
- Add `inMaintenance` (Boolean, default: false) to support blocking vehicles for servicing/repairs.

#### [MODIFY] [Booking.js](file:///c:/Users/User/Desktop/Project%20File/Rental-System/backend/models/Booking.js)
- Add `pickupTime` (String, e.g. `'09:00'`) and `returnTime` (String, e.g. `'17:00'`).
- Add `durationPlan` (Enum: `'daily'`, `'weekly'`, `'monthly'`).

#### [MODIFY] [dataStore.js](file:///c:/Users/User/Desktop/Project%20File/Rental-System/backend/services/dataStore.js)
- Update seed vehicle generator and default list with registration numbers (`vehicleNumber`), `weeklyRate`, `monthlyRate`, and maintenance status.

#### [MODIFY] [vehicleRoutes.js](file:///c:/Users/User/Desktop/Project%20File/Rental-System/backend/routes/vehicleRoutes.js)
- Support query parameters for `fuel`, `kind` (2W / 4W), `maxPrice`, `city`, `durationPlan`, and maintenance status.
- Allow partners to toggle maintenance status (`/api/vehicles/:id/maintenance`).

#### [MODIFY] [adminRoutes.js](file:///c:/Users/User/Desktop/Project%20File/Rental-System/backend/routes/adminRoutes.js)
- Upgrade `/api/admin/stats` to compute and return exact required KPIs:
  1. `registeredUsers` (Total Customers + Partners + Admins)
  2. `bookingConversionRate` (% of requests approved & paid)
  3. `vehicleUtilizationRate` (% of fleet currently booked or rented)
  4. `bookingConflictRate` (% of date overlap attempts detected)
  5. `averageRentalDuration` (Average days per booking)
  6. `monthlyActiveUsers` (Active users in last 30 days)

---

### Documentation & PRD

#### [MODIFY] [PRD_TECHNICAL_DOCS.md](file:///c:/Users/User/Desktop/Project%20File/Rental-System/PRD_TECHNICAL_DOCS.md)
- Update PRD document with comprehensive coverage of functional requirements, data schemas, REST APIs, KPI formulas, non-functional performance benchmarks, and user workflows.

---

## Verification Plan

### Automated Tests
- Test backend data structures and calendar availability endpoint:
  ```powershell
  cd "c:\Users\User\Desktop\Project File\Rental-System\backend"
  node -e "const ds = require('./services/dataStore'); console.log('Vehicles:', ds.getVehicles().length, 'Users:', ds.getUsers().length);"
  ```

### Manual Verification
1. **Interactive Calendar Date Picker**:
   - Open a vehicle detail modal or booking screen.
   - Verify visual calendar renders month days with green (available) and red (booked) tags.
   - Click a start date and end date on the calendar and ensure range is selected seamlessly.
2. **Customer Journey**:
   - Filter by 2W / 4W, fuel type, price range, and duration tier.
3. **Agency Journey**:
   - Log in as partner (`partner@rentalport.com`), add vehicle registration number, daily/weekly/monthly rates, and toggle maintenance block.
4. **Admin Journey**:
   - Log in as admin (`admin@rentalport.com`) and review system KPIs.
