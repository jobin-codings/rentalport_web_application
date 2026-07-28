# RentalPort (PlateUp) — Centralized Vehicle Rental Platform PRD & Technical Documentation

## 1. Executive Summary & Brand Overview
**RentalPort (PlateUp)** is a centralized, web-based digital platform enabling users to rent two-wheelers (2W - motorcycles, scooters, bicycles) and four-wheelers (4W - cars, SUVs, passenger vans) on a **daily, weekly, or monthly** basis. 

It provides rental agencies with fleet management tools to control pricing, availability, and vehicle maintenance, while giving site administrators full platform moderation, auditing, and analytics oversight.

### Key Highlights
- **Multi-Role Portals**: Customer Portal, Rental Agency / Partner Dashboard, and Site Administrator Control Center.
- **Flexible Rental Durations**: Daily rates, Weekly rates, and Monthly rates with automatic discount calculations.
- **Interactive Visual Calendar**: Month-view calendar displaying real-time open dates (green) and reserved dates (red) with interactive date-range picking.
- **Fleet Maintenance Blocking**: Agencies can block individual vehicles for servicing or repairs.
- **KPI System Analytics**: Real-time tracking of registered users, booking conversion rates, utilization rates, conflict rates, average rental duration, and monthly active users.
- **Second-Verification Modals**: Confirmation overlays for all critical actions (granting, declining, paying, maintenance toggling, deleting listings, cancelling bookings).

---

## 2. Key Performance Indicators (KPIs) & Analytics
The system measures the following core operational and financial metrics:

| Key Performance Indicator (KPI) | Description / Calculation Formula | Target Benchmark |
| :--- | :--- | :--- |
| **Number of Registered Users** | Total count of registered Customer, Partner, and Admin accounts | Growth metric |
| **Booking Conversion Rate (%)** | `(Paid Bookings / Total Booking Requests) * 100` | ≥ 80% |
| **Vehicle Utilization Rate (%)** | `(Booked Out & Maintenance Vehicles / Total Fleet) * 100` | 40% – 70% |
| **Booking Conflict Rate (%)** | `(Overlapping & Declined Requests / Total Requests) * 100` | < 5% |
| **Average Rental Duration** | `Sum(Days per Booking) / Total Count of Bookings` | ~ 3.5 Days |
| **Monthly Active Users (MAU)** | Total active unique users engaging in search, listing, or booking per month | Platform scale |
| **Total Revenue** | `Sum(Total Amount for Paid Bookings)` | Gross revenue |

---

## 3. MongoDB Data Models & Schemas

```
+-------------------+        +-----------------------------------+        +-----------------------------------+
|       USERS       |        |             VEHICLES              |        |             BOOKINGS              |
+-------------------+        +-----------------------------------+        +-----------------------------------+
| _id               |        | _id                               |        | _id (BK-1001)                     |
| name              |        | id (v1, v2...)                    |        | vehicleId, vehicleName, emoji     |
| email (unique)    |        | vehicleNumber (REG-8829)          |        | customerEmail, customerName       |
| password (bcrypt) |        | brand, model                      |        | ownerEmail                        |
| role              |        | kind (car [4W] / bike [2W])       |        | from, to (YYYY-MM-DD)             |
|   (cust/part/admin|        | emoji, name, tagline, city        |        | pickupTime, returnTime            |
| city              |        | seats, transmission, fuel         |        | durationPlan (daily/weekly/month) |
| license (opt)     |        | rate ($/day), weeklyRate, month...|        | city, total ($)                   |
+-------------------+        | bg, image, ownerEmail             |        | status (pending/app/rej/cancel)   |
                             | status (pending/approved/rejected)|        | paymentStatus (unpaid/paid)       |
                             | available (bool), inMaintenance   |        +-----------------------------------+
                             +-----------------------------------+
```

### 2.1 User Schema (`User`)
- `name`: String (Required)
- `email`: String (Unique, Indexed, Lowercase)
- `password`: String (Bcrypt Hashed)
- `role`: Enum (`'customer'`, `'partner'`, `'admin'`)
- `city`: String (Default: `'Austin'`)
- `license`: String (Driver's License Number for Customers)

### 2.2 Vehicle Schema (`Vehicle`)
- `id`: String (Unique identifier e.g., `'v1'`)
- `vehicleNumber`: String (License Plate / Registration number e.g., `'REG-8829'`)
- `brand`: String (Vehicle Make e.g., `'Honda'`)
- `model`: String (Vehicle Model e.g., `'Civic Hatchback'`)
- `kind`: Enum (`'car'`, `'bike'`) — 4W vs 2W classification
- `emoji`: String (e.g., `'🚗'`, `'🏍️'`, `'🛵'`, `'🚲'`)
- `name`: String (Display Name)
- `tagline`: String (Brief description)
- `city`: String (Location City)
- `seats`: Number (Seating Capacity)
- `transmission`: String (`'Automatic'`, `'Manual'`)
- `fuel`: String (`'Petrol'`, `'Diesel'`, `'Electric'`, `'Hybrid'`, `'None'`)
- `rate`: Number (Daily price in USD)
- `weeklyRate`: Number (Weekly price in USD)
- `monthlyRate`: Number (Monthly price in USD)
- `bg`: String (Card background palette hex code)
- `image`: String (Photography Image URL)
- `ownerEmail`: String (Ref `User.email`)
- `status`: Enum (`'pending'`, `'approved'`, `'rejected'`)
- `available`: Boolean (Availability toggle)
- `inMaintenance`: Boolean (Maintenance block flag)

### 2.3 Booking Schema (`Booking`)
- `id`: String (Unique booking code e.g., `'BK-1001'`)
- `vehicleId`: String (Ref `Vehicle.id`)
- `vehicleName`: String
- `emoji`: String
- `customerEmail`: String
- `customerName`: String
- `ownerEmail`: String
- `from`: String (Pickup Date `YYYY-MM-DD`)
- `to`: String (Return Date `YYYY-MM-DD`)
- `pickupTime`: String (Pickup Time e.g., `'09:00'`)
- `returnTime`: String (Return Time e.g., `'17:00'`)
- `durationPlan`: Enum (`'daily'`, `'weekly'`, `'monthly'`)
- `city`: String
- `total`: Number (Total price in USD)
- `status`: Enum (`'pending'`, `'approved'`, `'rejected'`, `'cancelled'`)
- `paymentStatus`: Enum (`'unpaid'`, `'paid'`)

---

## 4. REST API Documentation

### Auth Routes (`/api/auth`)
- `POST /api/auth/register` — Create account (Customer or Partner)
- `POST /api/auth/login` — Authenticate user and return session profile
- `GET /api/auth/me` — Retrieve session details

### Vehicle Routes (`/api/vehicles`)
- `GET /api/vehicles` — Query approved vehicles with filters (`city`, `kind`, `fuel`, `maxPrice`, `ownerEmail`, `inMaintenance`)
- `POST /api/vehicles` — Partner creates new vehicle listing (Status set to `'pending'`)
- `PUT /api/vehicles/:id` — Update vehicle listing
- `PUT /api/vehicles/:id/maintenance` — Toggle maintenance block status
- `PUT /api/vehicles/:id/status` — Admin approve or reject listing
- `DELETE /api/vehicles/:id` — Remove vehicle listing

### Booking Routes (`/api/bookings`)
- `POST /api/bookings` — Submit customer booking request (Status set to `'pending'`)
- `GET /api/bookings/my-bookings` — Customer booking history
- `GET /api/bookings/partner-bookings` — Partner incoming requests and active rentals
- `GET /api/bookings/vehicle-dates/:vehicleId` — Get booked date ranges for visual calendar picker
- `PUT /api/bookings/:id/status` — Partner approves/rejects request or Customer cancels
- `PUT /api/bookings/:id/pay` — Process simulated payment checkout

### Admin Routes (`/api/admin`)
- `GET /api/admin/stats` — Return system KPIs (Registered Users, Conversion Rate, Utilization Rate, Conflict Rate, Avg Duration, MAU, Total Revenue)
- `GET /api/admin/all-bookings` — Full platform audit log
- `GET /api/admin/partners` — Registered partner agency directory
- `GET /api/admin/users` — Registered customer & user directory

---

## 5. Non-Functional Requirements (NFRs)
- **Performance**: Initial page load time < 3 seconds; zero layout shifts on responsive viewports.
- **Security**: Password hashing using Bcrypt (8 rounds); role-based access control (RBAC); strict sanitation on user input.
- **Usability**: Mobile-first responsive dark & headlight aesthetic, custom color tokens, second-verification modal overlays for every destructive or financial action.
- **Scalability**: Architecture supports multi-city expansion (Austin, Seattle, Denver, Miami, Chicago) and scalable MongoDB clustering.
