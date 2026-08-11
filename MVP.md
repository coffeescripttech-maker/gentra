# 🚖 Naga-Gentra: Transport Booking Platform

## Project Summary

A mobile-first transport booking platform for Tricycle and Jeepney services in Naga City, designed to:
- Connect passengers with nearby drivers efficiently
- Reduce driver fuel consumption by eliminating unnecessary roaming
- Digitalize the traditional "pila" (queue) system
- Provide transparent capacity tracking and fair pricing

**Core Value Propositions:**
- **For Passengers:** Faster pickups, transparent pricing, real-time tracking, capacity visibility
- **For Drivers:** Reduced fuel costs, optimized routes, steady income, digital terminal system
- **For Community:** Reduced traffic congestion, lower emissions, modernized public transport

**Target Market:** Naga City, Philippines (expandable to other cities)
## 🎯 MVP Objectives

**Primary Goals:**
1. Prove market demand with 20+ active drivers and 50+ daily rides
2. Demonstrate 30% reduction in driver roaming time
3. Achieve 90% booking acceptance rate within 2 minutes
4. Validate capacity tracking reduces passenger wait time by 40%
5. Establish foundation for scalable, production-grade platform

**Success Criteria:**
- ✅ Passengers can book rides in under 30 seconds
- ✅ Drivers accept/decline within 60 seconds
- ✅ Real-time capacity tracking with 99% accuracy
- ✅ Terminal mode digitalization with queue management
- ✅ Measurable fuel savings (driver feedback + analytics)
- ✅ Transparent pricing prevents overcharging
- ✅ 95% app uptime during operating hours (5 AM - 11 PM)

## 👤 User Roles & Permissions

### 1. Passenger
**Description:** End users booking rides for personal transport
**Access Level:** Basic user
**Key Permissions:**
- Create/manage bookings
- View driver profiles & ratings
- Track active rides
- View ride history
- Submit feedback

### 2. Driver
**Description:** Verified tricycle/jeepney operators
**Access Level:** Service provider
**Key Permissions:**
- Accept/decline bookings
- Update vehicle capacity
- Toggle online/offline status
- Access navigation
- View earnings summary
- Manage terminal mode (Jeepney only)

**Verification Requirements:**
- Valid driver's license
- Vehicle registration (OR/CR)
- Franchise/TODA membership proof
- Background check clearance
- Vehicle inspection certificate

### 3. Admin
**Description:** Platform operators and support staff
**Access Level:** Full system access
**Key Permissions:**
- Approve/reject driver applications
- Monitor system health
- View analytics dashboard
- Manage user accounts
- Handle disputes
- Configure fare rates
- Manage terminal locations

## 📱 Passenger App Features

### Authentication & Onboarding
- **Register:** Phone number + SMS OTP verification
- **Login:** Phone/email + password or OTP
- **Profile Setup:** Name, photo, emergency contact
- **Location Permission:** Required for booking

### Core Booking Features
1. **Home Screen (Map View)**
   - Auto-detect current location
   - Manual location adjustment (drag pin)
   - View nearby available drivers (real-time)
   - Filter by vehicle type (Tricycle/Jeepney)
   - See driver capacity indicators

2. **Ride Selection**
   - Choose vehicle type: Tricycle or Jeepney
   - Choose ride mode:
     - **Special Ride:** Exclusive booking (Tricycle only)
     - **Shared Ride:** Join existing route (both types)
   - View estimated fare before booking
   - See driver details: name, plate number, rating, capacity

3. **Booking Management**
   - **Request Ride:** Send booking to nearest drivers
   - **Wait for Acceptance:** 60-second timeout, auto-retry
   - **Track Driver:** Real-time location updates every 5 seconds
   - **View ETA:** Estimated arrival time
   - **Cancel Booking:** Free cancellation before driver arrives
   - **In-Ride Updates:** See current capacity, route progress

4. **Ride Completion**
   - View final fare breakdown
   - Optional tip (₱10, ₱20, ₱50, custom)
   - Rate driver (1-5 stars)
   - Report issues

5. **Additional Features**
   - **Ride History:** Past trips with receipts
   - **Saved Locations:** Home, work, favorites
   - **Emergency Contact:** Quick-dial feature
   - **Help & Support:** In-app chat or hotline

### Capacity Visibility
- **Tricycle:** "2/4 seats available"
- **Jeepney:** "15/23 passengers • Leaving soon"
- Color indicators: Green (available), Yellow (filling up), Red (full)

### Terminal Mode View (Jeepney)
- See jeeps waiting at terminals
- View departure countdown
- Reserve seat before arrival
- Terminal location map
## 🚕 Driver App Features

### Authentication & Verification
- **Registration Process:**
  1. Phone number + SMS OTP
  2. Personal details (name, address, emergency contact)
  3. Upload documents:
     - Driver's license (front/back)
     - Vehicle registration (OR/CR)
     - Franchise/TODA membership
     - Vehicle photos (4 angles)
  4. Admin approval (24-48 hours)
  5. Account activation

- **Login:** Phone/email + password or OTP
- **Profile:** Photo, vehicle details, ratings, earnings

### Core Driver Features

1. **Dashboard**
   - Online/Offline toggle (prominent)
   - Today's earnings summary
   - Active booking indicator
   - Current capacity display
   - Battery & connectivity status

2. **Vehicle Setup**
   - Select vehicle type: Tricycle or Jeepney
   - Set maximum capacity (Tricycle: 1-4, Jeepney: 1-23)
   - Enter plate number
   - Add vehicle photo
   - Set default route (for Jeepney)

3. **Booking Management**
   - **Receive Request:** Push notification + sound alert
   - **View Details:** Pickup location, distance, passenger name, ride type
   - **Accept/Decline:** 30-second response window
   - **Auto-decline:** After timeout, offer to next driver
   - **Queue System:** Handle multiple requests (max 3 pending)

4. **Navigation & Ride Execution**
   - **Navigate to Pickup:** Integrated maps (Google/Waze)
   - **Notify Passenger:** "I'm here" button
   - **Start Ride:** Confirm passenger pickup
   - **Update Capacity:** Real-time passenger count adjustment
   - **End Ride:** Mark destination reached
   - **Fare Confirmation:** Display final fare

5. **Capacity Management**
   - **Real-time Updates:** Increment/decrement passenger count
   - **Visual Indicator:** Current vs. maximum capacity
   - **Auto-availability:** Go offline when full, online when space available
   - **Shared Ride Logic:** Accept new bookings along route

6. **Terminal Mode (Jeepney Only)**
   - **Toggle Terminal Mode:** Switch between roaming and terminal
   - **Select Terminal:** Choose from registered terminals
   - **Queue Position:** See position in digital pila
   - **Departure Timer:** Set estimated departure time
   - **Capacity Broadcast:** Show available seats to passengers
   - **Leave Terminal:** Auto-switch to roaming mode

7. **Earnings & History**
   - Daily/weekly/monthly earnings
   - Ride history with details
   - Fuel savings estimate
   - Performance metrics (acceptance rate, rating)

### Driver Safety Features
- **Emergency Button:** Alert admin + authorities
- **Share Location:** Send live location to emergency contact
- **Passenger Verification:** See passenger rating before accepting
- **Report Passenger:** Flag problematic behavior
## 👥 Capacity Feature (Core Innovation)

### Problem Solved
Traditional system: Passengers wait blindly, drivers roam empty, fuel wasted

### Solution: Real-Time Capacity Tracking

#### Tricycle Capacity
**Driver Side:**
- Set max capacity: 1-4 passengers
- Update count: Tap +/- buttons
- Auto-status: "Available" (< max), "Full" (at max)

**Passenger Side:**
- See availability: "2/4 seats available"
- Color coding:
  - 🟢 Green: 1-2 seats filled (plenty of space)
  - 🟡 Yellow: 3 seats filled (limited space)
  - 🔴 Red: 4 seats filled (full)

#### Jeepney Capacity
**Driver Side:**
- Set max capacity: 1-23 passengers
- Update count throughout route
- Terminal mode: Show "Leaving soon" when 80% full

**Passenger Side:**
- See real-time: "15/23 passengers"
- Status indicators:
  - "Just started" (1-8 passengers)
  - "Filling up" (9-18 passengers)
  - "Leaving soon" (19-23 passengers)
- Estimated departure time (Terminal mode)

### Technical Implementation
- WebSocket updates every 5 seconds
- Optimistic UI updates (instant feedback)
- Fallback to polling if WebSocket fails
- Capacity validation on backend
- Historical data for demand prediction

### Business Impact
- 40% reduction in passenger wait time
- 30% reduction in driver roaming
- Increased ride efficiency
- Better passenger experience

## 🚐 Terminal Mode (Jeepney Feature)

### Traditional Pila System Digitalized

**Problem:** 
- Passengers don't know when jeep will leave
- Drivers wait for full capacity
- Inefficient terminal management

**Solution: Digital Terminal System**

### How It Works

#### Driver Perspective
1. **Arrive at Terminal:** Park at designated terminal
2. **Toggle Terminal Mode:** Switch from "Roaming" to "Terminal"
3. **Select Terminal:** Choose from registered terminals (e.g., "Plaza Terminal", "SM Terminal")
4. **Set Route:** Confirm destination route
5. **Accept Bookings:** Receive seat reservations
6. **Update Capacity:** Real-time passenger count
7. **Departure Trigger:** 
   - Auto-suggest departure at 80% capacity
   - Manual departure anytime
   - Scheduled departure time
8. **Leave Terminal:** Auto-switch to roaming mode

#### Passenger Perspective
1. **View Terminal Jeeps:** See all jeeps waiting at terminals
2. **Check Capacity:** "15/23 passengers • Leaving in 5 min"
3. **Reserve Seat:** Book before arriving at terminal
4. **Track Status:** Real-time updates on departure
5. **Navigate to Terminal:** Get directions to terminal
6. **Board Jeep:** Show booking confirmation to driver

### Terminal Management Features
- **Queue System:** Digital pila order (FIFO)
- **Departure Countdown:** Visible to all passengers
- **Route Display:** Clear destination signage
- **Capacity Alerts:** Notify when almost full
- **Terminal Map:** Show all active terminals

### Registered Terminals (MVP)
- Plaza Rizal Terminal
- SM City Naga Terminal
- Naga City Hall Terminal
- University Belt Terminal
- (Expandable based on demand)

### Business Rules
- Minimum 30-minute terminal stay before forced departure
- Maximum 60-minute wait time
- Auto-notify passengers at 80% capacity
- Priority boarding for pre-booked passengers
- Terminal fee: ₱5 (optional, configurable)

## 🗺️ Map & Location Features

### Passenger Map Features
- **Real-time Driver Locations:** See all available drivers within 5km radius
- **Vehicle Type Icons:** Distinct icons for tricycle vs. jeepney
- **Capacity Indicators:** Color-coded pins (green/yellow/red)
- **Pickup Location:** Drag pin to adjust, address autocomplete
- **Destination Input:** Optional for fare estimation
- **Nearby Terminals:** Show terminal locations with active jeeps
- **Route Preview:** Estimated route before booking
- **Live Tracking:** Driver location updates every 5 seconds during ride
- **ETA Display:** Constantly updated arrival time

### Driver Map Features
- **Passenger Pickup Location:** Clear marker with address
- **Navigation Integration:** 
  - Google Maps (default)
  - Waze (alternative)
  - In-app navigation (basic)
- **Route Optimization:** Suggest fastest route
- **Traffic Overlay:** Real-time traffic conditions
- **Nearby Bookings:** See pending requests in area
- **Terminal Locations:** Quick navigation to terminals
- **Geofencing:** Auto-detect terminal arrival/departure

### Technical Specifications
- **Map Provider:** Google Maps Platform
- **Location Accuracy:** ±10 meters
- **Update Frequency:** 
  - Driver location: Every 5 seconds (active ride)
  - Driver location: Every 30 seconds (idle)
- **Offline Support:** Cached maps for last-used areas
- **Battery Optimization:** Adaptive location tracking
- **Geolocation API:** HTML5 Geolocation + GPS

### Privacy & Security
- Location shared only during active booking
- Driver location hidden when offline
- Passenger location cleared after ride completion
- No location history stored beyond 30 days
## 🔄 Booking Flow (Detailed)

### Passenger Booking Flow

```
1. Open App
   ↓
2. Location Detection
   - Auto-detect via GPS
   - Manual adjustment if needed
   - Confirm pickup address
   ↓
3. Select Vehicle Type
   - Tricycle (for short trips, 1-4 pax)
   - Jeepney (for longer routes, shared)
   ↓
4. Choose Ride Mode
   - Special Ride (exclusive, Tricycle only)
   - Shared Ride (join existing route)
   ↓
5. View Available Drivers
   - See nearby drivers on map
   - Check capacity & ratings
   - View estimated fare
   ↓
6. Confirm Booking
   - Tap "Book Now"
   - Request sent to nearest 3 drivers
   ↓
7. Wait for Acceptance (60 seconds)
   - Real-time status: "Finding driver..."
   - If timeout: Auto-retry with next 3 drivers
   - Max 3 retries, then suggest alternatives
   ↓
8. Driver Accepted ✓
   - See driver details (name, plate, photo)
   - View driver location & ETA
   - Chat/call driver option
   ↓
9. Track Driver Arrival
   - Real-time location updates
   - ETA countdown
   - Notification: "Driver is 1 min away"
   ↓
10. Driver Arrived
    - Notification: "Your driver has arrived"
    - Verify plate number
    - Board vehicle
    ↓
11. Ride in Progress
    - Track route on map
    - See current capacity (shared rides)
    - Estimated arrival time
    ↓
12. Destination Reached
    - Driver marks ride complete
    - View fare breakdown
    - Payment confirmation
    ↓
13. Rate & Review
    - Rate driver (1-5 stars)
    - Optional tip
    - Written feedback (optional)
    ↓
14. Ride Complete
    - Receipt sent via SMS/email
    - Ride saved to history
```

### Driver Booking Flow

```
1. Go Online
   - Toggle "Available" status
   - Set current capacity
   - Choose mode: Roaming or Terminal
   ↓
2. Receive Booking Request
   - Push notification + sound alert
   - See passenger details:
     * Name & rating
     * Pickup location & distance
     * Ride type (special/shared)
     * Estimated fare
   ↓
3. Accept or Decline (30 seconds)
   - Accept: Lock booking
   - Decline: Offer to next driver
   - Timeout: Auto-decline
   ↓
4. Navigate to Passenger
   - Get directions (Google Maps/Waze)
   - Update status: "On the way"
   - ETA shared with passenger
   ↓
5. Arrive at Pickup
   - Tap "I'm here" button
   - Notify passenger
   - Wait for passenger (max 5 min)
   ↓
6. Passenger Boards
   - Verify passenger identity
   - Tap "Start Ride"
   - Update capacity (+1)
   ↓
7. Navigate to Destination
   - Follow route
   - Accept additional bookings (if shared ride)
   - Update capacity as passengers board/alight
   ↓
8. Reach Destination
   - Tap "End Ride"
   - Confirm fare
   - Update capacity (-1)
   ↓
9. Collect Payment
   - Cash payment (MVP)
   - Confirm amount received
   ↓
10. Complete Ride
    - Earnings added to daily total
    - Wait for passenger rating
    - Return to available status
```

### Edge Cases Handled

**Passenger Side:**
- No drivers available → Suggest retry or alternative vehicle type
- Driver doesn't arrive → Auto-cancel after 15 min, no charge
- Wrong location → Allow location change before driver accepts
- App crash during ride → Restore session on reopen
- Lost connection → Queue actions, sync when reconnected

**Driver Side:**
- Passenger no-show → Cancel after 5 min wait, earn cancellation fee
- Wrong pickup location → Contact passenger, update location
- Passenger cancels en route → Earn partial fare (distance-based)
- Multiple simultaneous requests → Queue system, accept one at a time
- App crash → Restore active ride, continue navigation

## 💰 Fare System (MVP)

### Pricing Strategy

**MVP Approach: Admin-Configured Base Rates**
- Simple, transparent, government-compliant
- Matches traditional tricycle/jeepney fares
- No surge pricing (for MVP)

### Fare Structure

#### Tricycle Fares
**Special Ride (Exclusive):**
- Base fare: ₱15 (first 2 km)
- Per km: ₱5
- Example: 5 km trip = ₱15 + (3 × ₱5) = ₱30

**Shared Ride:**
- Base fare: ₱10 (first 2 km)
- Per km: ₱3
- Example: 5 km trip = ₱10 + (3 × ₱3) = ₱19

#### Jeepney Fares
**Standard Route:**
- Base fare: ₱13 (first 4 km)
- Per km: ₱2
- Example: 8 km trip = ₱13 + (4 × ₱2) = ₱21

**Terminal Mode:**
- Fixed route fare: ₱13-₱25 (based on route)
- No per-km calculation
- Pre-defined by admin

### Additional Charges
- **Night Rate (10 PM - 5 AM):** +₱10
- **Heavy Traffic:** No additional charge (MVP)
- **Waiting Time:** Free for first 5 minutes, ₱5/min after
- **Cancellation Fee:** ₱20 (if driver already en route)
- **No-show Fee:** ₱30 (charged to passenger)

### Fare Calculation Logic
```javascript
function calculateFare(vehicleType, rideMode, distance, isNightTime) {
  let baseFare, perKmRate, freeKm;
  
  if (vehicleType === 'tricycle') {
    if (rideMode === 'special') {
      baseFare = 15;
      perKmRate = 5;
      freeKm = 2;
    } else {
      baseFare = 10;
      perKmRate = 3;
      freeKm = 2;
    }
  } else if (vehicleType === 'jeepney') {
    baseFare = 13;
    perKmRate = 2;
    freeKm = 4;
  }
  
  const chargeableKm = Math.max(0, distance - freeKm);
  let fare = baseFare + (chargeableKm * perKmRate);
  
  if (isNightTime) fare += 10;
  
  return Math.round(fare);
}
```

### Fare Display
**Before Booking:**
- "Estimated fare: ₱25-₱30"
- Breakdown: "Base ₱15 + Distance ₱10"

**After Ride:**
- "Final fare: ₱28"
- Breakdown:
  - Base fare: ₱15
  - Distance (3.2 km): ₱13
  - Total: ₱28

### Payment Methods (MVP)
- **Cash Only** (for MVP launch)
- Driver confirms payment received
- Receipt sent via SMS

### Future Payment Options (Phase 2)
- GCash integration
- PayMaya
- In-app wallet
- Credit/debit cards

### Fare Compliance
- Rates approved by local transport authority
- Displayed in-app and at terminals
- Regular review every 6 months
- Transparent to both drivers and passengers

## 🔔 Real-Time Features

### Critical Real-Time Updates

1. **Booking Requests**
   - Push notification to drivers
   - 30-second response window
   - Auto-cascade to next driver on timeout

2. **Driver Location Tracking**
   - Update frequency: Every 5 seconds (active ride)
   - Update frequency: Every 30 seconds (idle/available)
   - Visible to passenger during active booking only

3. **Ride Status Updates**
   - "Driver accepted"
   - "Driver is on the way"
   - "Driver has arrived"
   - "Ride started"
   - "Ride completed"

4. **Capacity Updates**
   - Real-time passenger count changes
   - Availability status changes
   - Terminal departure alerts

5. **In-App Messaging**
   - Driver ↔ Passenger chat
   - Pre-defined quick messages
   - Delivery status indicators

### Technology Stack Options

#### Option 1: Socket.io (Recommended for MVP)
**Pros:**
- Full control over infrastructure
- Low latency
- Cost-effective
- Easy to implement

**Cons:**
- Requires WebSocket server management
- Need to handle reconnection logic

**Implementation:**
```javascript
// Server: Node.js + Socket.io
// Client: socket.io-client

// Events:
- booking:request
- booking:accepted
- booking:declined
- location:update
- capacity:update
- ride:status
- message:new
```

#### Option 2: Firebase Realtime Database
**Pros:**
- Managed service (no server maintenance)
- Built-in offline support
- Easy authentication integration
- Scales automatically

**Cons:**
- Vendor lock-in
- Costs scale with usage
- Less control

#### Option 3: Supabase Realtime
**Pros:**
- Open-source alternative to Firebase
- PostgreSQL-based
- Good documentation
- Generous free tier

**Cons:**
- Newer platform
- Smaller community

### MVP Recommendation: Socket.io
- Most cost-effective for MVP
- Full control over data flow
- Easy to migrate later if needed
- Works well with existing Node.js backend

### Real-Time Architecture
```
Mobile App (React Native)
    ↓ WebSocket
Socket.io Server (Node.js)
    ↓ Pub/Sub
Redis (Message Broker)
    ↓ Database
MySQL (Persistent Storage)
```

### Fallback Mechanisms
- **WebSocket Failure:** Fall back to HTTP polling (10-second intervals)
- **Connection Loss:** Queue updates, sync on reconnect
- **Server Downtime:** Show cached data, notify user of degraded service

### Performance Targets
- Message delivery: < 500ms
- Location update latency: < 1 second
- Booking acceptance notification: < 2 seconds
- 99.5% message delivery success rate
## 🧑‍💻 Admin Panel Features

### Dashboard Overview
**Key Metrics (Real-Time):**
- Total registered users (passengers + drivers)
- Active drivers (currently online)
- Rides today/week/month
- Total revenue (optional for MVP)
- Average rating (drivers & passengers)
- System health status

**Charts & Analytics:**
- Rides per hour (line chart)
- Vehicle type distribution (pie chart)
- Popular routes (heat map)
- Driver performance leaderboard
- Booking success rate
- Average wait time trends

### Driver Management
**Driver Applications:**
- View pending applications
- Review submitted documents
- Approve/reject with reason
- Request additional documents
- Verification checklist:
  - [ ] Valid driver's license
  - [ ] Vehicle registration
  - [ ] Franchise/TODA membership
  - [ ] Vehicle photos
  - [ ] Background check

**Active Drivers:**
- List all verified drivers
- Filter: Online/offline, vehicle type, rating
- View driver profile & stats
- Suspend/block driver
- Edit driver details
- View earnings history
- Send notifications

### Passenger Management
- List all passengers
- View booking history
- Handle complaints
- Block abusive users
- View payment history

### Ride Management
- **Active Rides:** Monitor ongoing rides
- **Ride History:** Search & filter past rides
- **Dispute Resolution:** View flagged rides
- **Refund Processing:** Issue refunds for cancelled rides

### System Configuration
**Fare Settings:**
- Set base fares per vehicle type
- Configure per-km rates
- Set night rate multiplier
- Define cancellation fees

**Terminal Management:**
- Add/edit terminal locations
- Set terminal operating hours
- Configure queue rules
- View terminal analytics

**Geofencing:**
- Define service area boundaries
- Set restricted zones
- Configure terminal geofences

### Reports & Analytics
- Daily/weekly/monthly ride reports
- Driver earnings reports
- Revenue reports (CSV export)
- User growth metrics
- System performance logs

### Support & Moderation
- View user-reported issues
- In-app messaging with users
- Ban/suspend users
- Broadcast announcements
- Emergency shutdown toggle

### Admin User Roles
- **Super Admin:** Full access
- **Operations Manager:** Driver approval, ride monitoring
- **Support Agent:** Handle complaints, view-only access
- **Analyst:** Reports and analytics only

### Security Features
- Two-factor authentication (2FA)
- Audit logs for all admin actions
- IP whitelist for admin access
- Session timeout (30 minutes)
- Role-based access control (RBAC)


## 📱 Screen Specifications

### Passenger App Screens (9 Core Screens)

1. **Splash Screen**
   - App logo
   - Loading indicator
   - Version number

2. **Login/Register**
   - Phone number input
   - SMS OTP verification
   - Name & profile setup
   - Terms & conditions acceptance

3. **Home (Map View)**
   - Full-screen map
   - Current location marker
   - Nearby drivers (pins)
   - Vehicle type filter (top)
   - "Book Ride" button (bottom)
   - Menu drawer (hamburger icon)

4. **Ride Selection**
   - Vehicle type cards (Tricycle/Jeepney)
   - Ride mode toggle (Special/Shared)
   - Pickup location (editable)
   - Destination input (optional)
   - Estimated fare display
   - "Confirm Booking" button

5. **Finding Driver**
   - Animated searching indicator
   - "Looking for nearby drivers..."
   - Cancel button
   - Estimated wait time

6. **Driver Assigned**
   - Driver photo & name
   - Vehicle details (type, plate, color)
   - Driver rating (stars)
   - Current capacity
   - ETA to pickup
   - Call/chat buttons
   - Cancel booking button

7. **Ride in Progress**
   - Map with route
   - Driver location (moving pin)
   - ETA to destination
   - Current capacity (shared rides)
   - Emergency button
   - End ride button (passenger-initiated)

8. **Ride Complete**
   - Fare breakdown
   - Tip options (₱10, ₱20, ₱50, custom)
   - Rating (1-5 stars)
   - Feedback text area
   - "Done" button
   - Receipt download

9. **Profile & History**
   - User profile (photo, name, phone)
   - Ride history list
   - Saved locations
   - Payment methods (future)
   - Settings
   - Help & support

### Driver App Screens (8 Core Screens)

1. **Splash Screen**
   - App logo
   - Loading indicator

2. **Login/Register**
   - Phone number input
   - SMS OTP verification
   - Driver verification flow
   - Document upload

3. **Dashboard (Home)**
   - Online/Offline toggle (prominent)
   - Today's earnings
   - Rides completed today
   - Current capacity display
   - Terminal mode toggle (Jeepney)
   - Active booking indicator
   - Menu drawer

4. **Booking Request**
   - Modal overlay (urgent)
   - Passenger name & rating
   - Pickup location (map preview)
   - Distance to pickup
   - Estimated fare
   - Accept/Decline buttons
   - 30-second countdown timer

5. **Navigation to Pickup**
   - Map with route
   - Passenger location marker
   - ETA display
   - "I'm here" button (when arrived)
   - Call/chat passenger
   - Cancel ride button

6. **Active Ride**
   - Map with route to destination
   - Passenger count controls (+/-)
   - Current capacity display
   - "End Ride" button
   - Emergency button
   - Navigation controls

7. **Ride Complete**
   - Fare display
   - "Confirm Payment Received" button
   - Wait for passenger rating
   - Return to dashboard

8. **Earnings & History**
   - Daily/weekly/monthly tabs
   - Total earnings
   - Ride list with details
   - Fuel savings estimate
   - Performance stats

### Admin Panel Screens (Web-Based)

1. **Login**
   - Email/username
   - Password
   - 2FA code

2. **Dashboard**
   - Metrics cards
   - Charts & graphs
   - Recent activity feed
   - Quick actions

3. **Driver Management**
   - Pending applications table
   - Active drivers table
   - Driver detail view
   - Document verification interface

4. **Ride Monitoring**
   - Active rides map
   - Ride history table
   - Ride detail view
   - Dispute resolution interface

5. **System Settings**
   - Fare configuration
   - Terminal management
   - User roles
   - System parameters

### UI/UX Guidelines

**Design Principles:**
- Mobile-first responsive design
- High contrast for outdoor visibility
- Large touch targets (min 44×44 px)
- Minimal text input
- Clear visual hierarchy
- Offline-first approach

**Accessibility:**
- Screen reader support
- Color-blind friendly palette
- Text size adjustments
- Voice commands (future)

**Performance:**
- Screen load time: < 2 seconds
- Smooth animations (60 fps)
- Optimized images (WebP format)
- Lazy loading for lists

## 🏗️ Technical Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile Apps                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Passenger   │  │    Driver    │  │  Admin Web   │ │
│  │  (React      │  │  (React      │  │  (React)     │ │
│  │   Native)    │  │   Native)    │  │              │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │   (Express.js)  │
                    └────────┬────────┘
                             │
          ┏━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━┓
          ┃                                     ┃
  ┌───────▼────────┐                  ┌────────▼────────┐
  │  REST API      │                  │  WebSocket      │
  │  (Express)     │                  │  (Socket.io)    │
  └───────┬────────┘                  └────────┬────────┘
          │                                     │
          └──────────────┬──────────────────────┘
                         │
          ┏━━━━━━━━━━━━━┻━━━━━━━━━━━━━┓
          ┃                             ┃
  ┌───────▼────────┐          ┌────────▼────────┐
  │   MySQL        │          │     Redis       │
  │   (Primary DB) │          │  (Cache/Queue)  │
  └────────────────┘          └─────────────────┘
          │
  ┌───────▼────────┐
  │  Google Maps   │
  │  API           │
  └────────────────┘
```

### Technology Stack

#### Frontend (Mobile Apps)
- **Framework:** React Native 0.72+
- **State Management:** Redux Toolkit + RTK Query
- **Navigation:** React Navigation 6
- **Maps:** react-native-maps (Google Maps)
- **Real-time:** Socket.io-client
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Storage:** AsyncStorage + MMKV (fast storage)
- **HTTP Client:** Axios
- **Forms:** React Hook Form + Yup validation

#### Frontend (Admin Web)
- **Framework:** React 18 + TypeScript
- **UI Library:** Material-UI (MUI) or Ant Design
- **State Management:** Redux Toolkit
- **Charts:** Recharts or Chart.js
- **Maps:** Google Maps JavaScript API
- **Build Tool:** Vite

#### Backend
- **Runtime:** Node.js 18 LTS
- **Framework:** Express.js 4.18+
- **Language:** TypeScript
- **Real-time:** Socket.io 4.6+
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi or Zod
- **File Upload:** Multer + AWS S3 (or local storage for MVP)
- **SMS:** Twilio or Semaphore (Philippines)
- **Email:** SendGrid or Nodemailer

#### Database
- **Primary Database:** MySQL 8.0
- **Cache/Session Store:** Redis 7.0
- **ORM:** Sequelize or Prisma
- **Migrations:** Sequelize CLI or Prisma Migrate

#### Infrastructure
- **Hosting:** 
  - Option 1: AWS (EC2 + RDS + ElastiCache)
  - Option 2: DigitalOcean (Droplets + Managed DB)
  - Option 3: Railway/Render (for MVP)
- **CDN:** CloudFlare (free tier)
- **File Storage:** AWS S3 or DigitalOcean Spaces
- **Monitoring:** Sentry (error tracking)
- **Analytics:** Google Analytics + Mixpanel
- **Logging:** Winston + CloudWatch/Papertrail

#### DevOps
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Containerization:** Docker (optional for MVP)
- **Environment Management:** dotenv
- **API Documentation:** Swagger/OpenAPI

### Database Schema (Core Tables)

```sql
-- Users (Passengers & Drivers)
users
  - id (PK)
  - phone_number (unique)
  - email
  - password_hash
  - full_name
  - profile_photo_url
  - user_type (passenger/driver/admin)
  - status (active/suspended/banned)
  - created_at
  - updated_at

-- Driver Details
drivers
  - id (PK)
  - user_id (FK → users)
  - vehicle_type (tricycle/jeepney)
  - plate_number
  - vehicle_color
  - max_capacity
  - license_number
  - license_expiry
  - franchise_number
  - verification_status (pending/approved/rejected)
  - is_online
  - current_latitude
  - current_longitude
  - rating_average
  - total_rides
  - created_at
  - updated_at

-- Bookings
bookings
  - id (PK)
  - passenger_id (FK → users)
  - driver_id (FK → drivers, nullable)
  - vehicle_type
  - ride_mode (special/shared)
  - pickup_latitude
  - pickup_longitude
  - pickup_address
  - destination_latitude (nullable)
  - destination_longitude (nullable)
  - destination_address (nullable)
  - status (pending/accepted/in_progress/completed/cancelled)
  - estimated_fare
  - final_fare
  - distance_km
  - duration_minutes
  - passenger_rating (1-5)
  - driver_rating (1-5)
  - passenger_feedback
  - driver_feedback
  - created_at
  - accepted_at
  - started_at
  - completed_at
  - cancelled_at
  - cancellation_reason

-- Terminals
terminals
  - id (PK)
  - name
  - latitude
  - longitude
  - address
  - operating_hours_start
  - operating_hours_end
  - is_active
  - created_at
  - updated_at

-- Terminal Queue (for Jeepney terminal mode)
terminal_queue
  - id (PK)
  - terminal_id (FK → terminals)
  - driver_id (FK → drivers)
  - route_name
  - current_capacity
  - max_capacity
  - estimated_departure
  - queue_position
  - status (waiting/departed)
  - joined_at
  - departed_at

-- Transactions (for future payment integration)
transactions
  - id (PK)
  - booking_id (FK → bookings)
  - amount
  - payment_method (cash/gcash/paymaya)
  - status (pending/completed/refunded)
  - created_at
  - updated_at

-- Driver Documents
driver_documents
  - id (PK)
  - driver_id (FK → drivers)
  - document_type (license/registration/franchise/vehicle_photo)
  - file_url
  - verification_status (pending/approved/rejected)
  - uploaded_at
  - verified_at

-- Notifications
notifications
  - id (PK)
  - user_id (FK → users)
  - title
  - message
  - type (booking/system/promotion)
  - is_read
  - created_at

-- Audit Logs
audit_logs
  - id (PK)
  - user_id (FK → users)
  - action
  - entity_type
  - entity_id
  - old_values (JSON)
  - new_values (JSON)
  - ip_address
  - created_at
```

### API Endpoints (RESTful)

#### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login
POST   /api/auth/verify-otp        - Verify SMS OTP
POST   /api/auth/refresh-token     - Refresh JWT
POST   /api/auth/logout            - Logout
POST   /api/auth/forgot-password   - Request password reset
```

#### Passengers
```
GET    /api/passengers/profile     - Get profile
PUT    /api/passengers/profile     - Update profile
GET    /api/passengers/bookings    - Get booking history
POST   /api/passengers/bookings    - Create booking
GET    /api/passengers/bookings/:id - Get booking details
PUT    /api/passengers/bookings/:id/cancel - Cancel booking
POST   /api/passengers/bookings/:id/rate - Rate driver
```

#### Drivers
```
GET    /api/drivers/profile        - Get driver profile
PUT    /api/drivers/profile        - Update profile
PUT    /api/drivers/status         - Toggle online/offline
PUT    /api/drivers/location       - Update location
GET    /api/drivers/bookings       - Get assigned bookings
PUT    /api/drivers/bookings/:id/accept - Accept booking
PUT    /api/drivers/bookings/:id/decline - Decline booking
PUT    /api/drivers/bookings/:id/start - Start ride
PUT    /api/drivers/bookings/:id/complete - Complete ride
PUT    /api/drivers/capacity       - Update capacity
POST   /api/drivers/terminal-mode  - Toggle terminal mode
GET    /api/drivers/earnings       - Get earnings summary
POST   /api/drivers/documents      - Upload document
```

#### Admin
```
GET    /api/admin/dashboard        - Get dashboard metrics
GET    /api/admin/drivers          - List all drivers
GET    /api/admin/drivers/:id      - Get driver details
PUT    /api/admin/drivers/:id/verify - Approve/reject driver
PUT    /api/admin/drivers/:id/suspend - Suspend driver
GET    /api/admin/bookings         - List all bookings
GET    /api/admin/bookings/:id     - Get booking details
GET    /api/admin/users            - List all users
PUT    /api/admin/users/:id/block  - Block user
GET    /api/admin/terminals        - List terminals
POST   /api/admin/terminals        - Create terminal
PUT    /api/admin/terminals/:id    - Update terminal
PUT    /api/admin/settings/fares   - Update fare settings
```

#### Public
```
GET    /api/drivers/nearby         - Get nearby available drivers
GET    /api/terminals              - Get active terminals
GET    /api/terminals/:id/queue    - Get terminal queue
POST   /api/fare/estimate          - Calculate fare estimate
```

### WebSocket Events

#### Client → Server
```
connection                    - Initial connection
authenticate                  - Send JWT token
driver:location:update        - Driver sends location
driver:capacity:update        - Driver updates capacity
booking:accept                - Driver accepts booking
booking:decline               - Driver declines booking
message:send                  - Send chat message
```

#### Server → Client
```
booking:new                   - New booking request (to driver)
booking:accepted              - Booking accepted (to passenger)
booking:declined              - Booking declined (to passenger)
driver:location               - Driver location update (to passenger)
driver:arrived                - Driver arrived at pickup
ride:started                  - Ride started
ride:completed                - Ride completed
capacity:updated              - Capacity changed
message:received              - New chat message
```

### Security Measures

1. **Authentication:**
   - JWT tokens (access + refresh)
   - Token expiry: 1 hour (access), 7 days (refresh)
   - Secure token storage (Keychain/Keystore)

2. **Authorization:**
   - Role-based access control (RBAC)
   - Middleware for route protection
   - Scope-based permissions

3. **Data Protection:**
   - HTTPS only (TLS 1.3)
   - Password hashing (bcrypt, cost factor 12)
   - Sensitive data encryption at rest
   - SQL injection prevention (parameterized queries)
   - XSS protection (input sanitization)
   - CSRF tokens for web admin

4. **Rate Limiting:**
   - API: 100 requests/minute per IP
   - Login attempts: 5 per 15 minutes
   - SMS OTP: 3 per hour per phone number

5. **Privacy:**
   - Location data encrypted in transit
   - Location history auto-deleted after 30 days
   - GDPR-compliant data handling
   - User data export/deletion on request

### Performance Optimization

1. **Database:**
   - Indexes on frequently queried columns
   - Connection pooling (max 20 connections)
   - Query optimization (avoid N+1)
   - Read replicas for analytics (future)

2. **Caching:**
   - Redis for session storage
   - Cache driver locations (30-second TTL)
   - Cache fare calculations
   - Cache terminal data

3. **API:**
   - Response compression (gzip)
   - Pagination (max 50 items per page)
   - Field filtering (sparse fieldsets)
   - ETags for conditional requests

4. **Mobile:**
   - Image optimization (WebP, lazy loading)
   - Code splitting
   - Offline-first architecture
   - Background location tracking optimization
## 🚀 MVP Feature Scope

### ✅ Must Have (MVP Launch)

**Core Booking System:**
- User registration & authentication (SMS OTP)
- Real-time driver location tracking
- Booking creation & management
- Driver acceptance/decline workflow
- In-ride tracking
- Ride completion & fare calculation

**Capacity Management:**
- Real-time capacity updates
- Passenger count visibility
- Availability status automation

**Terminal Mode:**
- Digital queue system for jeepneys
- Terminal location management
- Departure time estimates

**Map Integration:**
- Nearby driver discovery
- Navigation to pickup/destination
- Route display

**Admin Functions:**
- Driver verification & approval
- Basic dashboard & analytics
- User management
- Fare configuration

**Communication:**
- In-app chat (driver ↔ passenger)
- Push notifications (booking updates)
- SMS notifications (critical updates)

**Safety:**
- Emergency contact feature
- Ride sharing (send trip details to contact)
- Driver/passenger ratings

### ❌ Not Included in MVP (Phase 2+)

**Payment Integration:**
- GCash/PayMaya/credit cards
- In-app wallet
- Automatic fare collection
- Driver payouts

**Advanced Features:**
- AI-powered dispatch optimization
- Dynamic pricing/surge pricing
- Promo codes & discounts
- Loyalty rewards program
- Scheduled rides
- Multi-stop rides
- Ride splitting (fare sharing)

**Analytics & Optimization:**
- Demand heatmaps
- Predictive analytics
- Route optimization algorithms
- Driver performance AI

**Social Features:**
- Social media login
- Ride sharing with friends
- Referral program
- Driver leaderboards

**Enterprise:**
- Corporate accounts
- Bulk booking
- API for third-party integration

### 🎯 MVP vs. Full Product

| Feature | MVP | Phase 2 | Phase 3 |
|---------|-----|---------|---------|
| Booking System | ✅ | Enhanced | AI-Optimized |
| Payment | Cash only | GCash | Full wallet |
| Ratings | Basic (1-5) | Detailed | Reputation system |
| Terminal Mode | Basic queue | Smart dispatch | Predictive |
| Admin Panel | Essential | Advanced analytics | ML insights |
| Support | In-app chat | Ticketing system | AI chatbot |

### Feature Prioritization Matrix

**High Priority (MVP):**
- Authentication & security
- Booking flow
- Real-time tracking
- Capacity management
- Driver verification
- Basic admin panel

**Medium Priority (Post-MVP):**
- Payment integration
- Advanced analytics
- Promo codes
- Scheduled rides

**Low Priority (Future):**
- AI dispatch
- Social features
- Enterprise features
## � Success Metrics & KPIs

### Launch Targets (First 3 Months)

**User Acquisition:**
- 20+ verified drivers onboarded
- 200+ registered passengers
- 50+ daily active users

**Engagement:**
- 50+ rides per day
- 70%+ booking acceptance rate
- < 3 minutes average wait time
- 4.0+ average driver rating
- 4.0+ average passenger rating

**Operational Efficiency:**
- 30% reduction in driver roaming time
- 40% reduction in passenger wait time
- 15% estimated fuel savings per driver
- 90%+ ride completion rate

**Technical Performance:**
- 99% app uptime (5 AM - 11 PM)
- < 2 seconds average API response time
- < 500ms real-time update latency
- < 5% error rate

**Business Metrics:**
- ₱2,000+ average daily GMV (Gross Merchandise Value)
- ₱60,000+ monthly GMV
- 10% platform commission (future)
- Break-even by month 6

### Analytics Tracking

**User Behavior:**
- App opens per day
- Booking conversion rate
- Cancellation rate & reasons
- Feature usage (terminal mode, shared rides)
- Session duration
- Retention rate (D1, D7, D30)

**Driver Metrics:**
- Online hours per day
- Acceptance rate
- Cancellation rate
- Average earnings per hour
- Rides per day
- Fuel consumption (self-reported)

**System Health:**
- API uptime
- WebSocket connection stability
- Database query performance
- Error rates by endpoint
- Crash-free rate (mobile apps)

### Monitoring Tools
- **Application Performance:** Sentry, New Relic
- **User Analytics:** Google Analytics, Mixpanel
- **Business Metrics:** Custom admin dashboard
- **Infrastructure:** CloudWatch, Datadog
- **Real-time Alerts:** PagerDuty, Slack integration


---

## 🔒 Security & Compliance

### Data Security
- **Encryption in Transit:** TLS 1.3 for all API calls
- **Encryption at Rest:** Database encryption (AES-256)
- **Password Security:** Bcrypt hashing (cost factor 12)
- **Token Security:** JWT with short expiry, refresh token rotation
- **API Security:** Rate limiting, input validation, SQL injection prevention

### Privacy Compliance
- **Data Collection Transparency:** Clear privacy policy
- **User Consent:** Explicit consent for location tracking
- **Data Retention:** 
  - Location data: 30 days
  - Ride history: 2 years
  - User accounts: Until deletion request
- **Right to Deletion:** Users can request account deletion
- **Data Export:** Users can download their data

### Philippine Regulations
- **Data Privacy Act of 2012:** Full compliance
- **LTFRB Regulations:** Fare structure approval
- **TODA Coordination:** Partnership with local transport groups
- **Business Permits:** Secure necessary permits for operation
- **Insurance:** Driver insurance verification

### Safety & Trust
- **Driver Background Checks:** NBI clearance verification
- **Vehicle Inspection:** Annual inspection requirement
- **Emergency Protocols:** 24/7 support hotline
- **Incident Reporting:** In-app reporting system
- **Insurance Coverage:** Third-party liability (future)

---

## 🚀 Development Roadmap

### Phase 0: Planning & Setup (Week 1-2)
- [ ] Finalize requirements
- [ ] Design database schema
- [ ] Create wireframes & mockups
- [ ] Set up development environment
- [ ] Initialize repositories
- [ ] Configure CI/CD pipeline

### Phase 1: Core Backend (Week 3-5)
- [ ] Set up Express.js + TypeScript
- [ ] Implement authentication (JWT + OTP)
- [ ] Create database models & migrations
- [ ] Build REST API endpoints
- [ ] Implement WebSocket server (Socket.io)
- [ ] Set up Redis for caching
- [ ] Write API documentation (Swagger)
- [ ] Unit tests for core services

### Phase 2: Mobile Apps Foundation (Week 6-8)
- [ ] Set up React Native projects (passenger & driver)
- [ ] Implement authentication screens
- [ ] Integrate Google Maps
- [ ] Build navigation structure
- [ ] Set up state management (Redux)
- [ ] Configure push notifications (FCM)
- [ ] Implement offline support

### Phase 3: Passenger App (Week 9-11)
- [ ] Home screen with map
- [ ] Ride selection flow
- [ ] Booking creation
- [ ] Real-time driver tracking
- [ ] Ride completion & rating
- [ ] Profile & history screens
- [ ] Integration testing

### Phase 4: Driver App (Week 12-14)
- [ ] Driver dashboard
- [ ] Booking request handling
- [ ] Navigation integration
- [ ] Capacity management
- [ ] Terminal mode implementation
- [ ] Earnings tracking
- [ ] Integration testing

### Phase 5: Admin Panel (Week 15-16)
- [ ] Admin dashboard (React web app)
- [ ] Driver verification interface
- [ ] Ride monitoring
- [ ] User management
- [ ] System configuration
- [ ] Analytics & reports

### Phase 6: Testing & QA (Week 17-18)
- [ ] End-to-end testing
- [ ] User acceptance testing (UAT)
- [ ] Performance testing
- [ ] Security audit
- [ ] Bug fixes
- [ ] Load testing

### Phase 7: Pilot Launch (Week 19-20)
- [ ] Deploy to staging environment
- [ ] Onboard 5 pilot drivers
- [ ] Recruit 20 test passengers
- [ ] Monitor & collect feedback
- [ ] Fix critical issues
- [ ] Optimize based on real usage

### Phase 8: Production Launch (Week 21-22)
- [ ] Deploy to production
- [ ] Marketing campaign
- [ ] Driver onboarding events
- [ ] 24/7 support setup
- [ ] Monitor metrics
- [ ] Iterate based on feedback

### Timeline Summary
- **Total Development:** 22 weeks (~5.5 months)
- **MVP Launch:** Week 22
- **First Review:** Week 26 (1 month post-launch)

---

## 💻 Development Environment Setup

### Prerequisites
- Node.js 18 LTS
- MySQL 8.0
- Redis 7.0
- Git
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)
- Google Maps API key
- Twilio/Semaphore account (SMS)

### Local Development Setup

```bash
# Clone repository
git clone <repo-url>
cd naga-gentra

# Backend setup
cd backend
npm install
cp .env.example .env
# Configure .env with database credentials
npm run migrate
npm run seed
npm run dev

# Passenger app setup
cd ../mobile/passenger
npm install
cp .env.example .env
# Configure API URL and Google Maps key
npx expo start

# Driver app setup
cd ../driver
npm install
cp .env.example .env
npx expo start

# Admin panel setup
cd ../admin
npm install
cp .env.example .env
npm run dev
```

### Environment Variables

**Backend (.env):**
```
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://user:pass@localhost:3306/naga_gentra
REDIS_URL=redis://localhost:6379
JWT_SECRET=<random-secret>
JWT_REFRESH_SECRET=<random-secret>
GOOGLE_MAPS_API_KEY=<your-key>
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
TWILIO_PHONE_NUMBER=<your-number>
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_S3_BUCKET=<bucket-name>
```

**Mobile Apps (.env):**
```
API_URL=http://localhost:3000
SOCKET_URL=http://localhost:3000
GOOGLE_MAPS_API_KEY=<your-key>
ENVIRONMENT=development
```

---

## 🧪 Testing Strategy

### Unit Tests
- **Backend:** Jest + Supertest
  - Service layer tests
  - Controller tests
  - Utility function tests
  - Target: 80% code coverage

- **Frontend:** Jest + React Native Testing Library
  - Component tests
  - Hook tests
  - Utility tests
  - Target: 70% code coverage

### Integration Tests
- API endpoint tests
- Database integration tests
- WebSocket event tests
- Third-party API mocks (Google Maps, SMS)

### End-to-End Tests
- **Tools:** Detox (React Native), Playwright (Web)
- **Critical Flows:**
  - Complete booking flow (passenger)
  - Accept & complete ride (driver)
  - Driver verification (admin)
  - Terminal mode workflow

### Manual Testing
- Device testing (iOS & Android)
- Network condition testing (3G, 4G, WiFi, offline)
- GPS accuracy testing
- Battery drain testing
- Real-world pilot testing

### Performance Testing
- Load testing (Apache JMeter)
- Stress testing (simulate 100+ concurrent users)
- Database query optimization
- API response time benchmarks

### Security Testing
- Penetration testing
- OWASP Top 10 vulnerability scan
- Authentication/authorization testing
- SQL injection testing
- XSS testing

---

## 🚢 Deployment Strategy

### Environments

1. **Development**
   - Local machines
   - Frequent deployments
   - Debug mode enabled

2. **Staging**
   - Cloud-hosted (mirrors production)
   - UAT environment
   - Test data only

3. **Production**
   - Cloud-hosted (high availability)
   - Auto-scaling enabled
   - Monitoring & alerts active

### Infrastructure (AWS Recommended)

**Compute:**
- EC2 t3.medium (API server) - 2 instances (load balanced)
- EC2 t3.small (WebSocket server) - 2 instances

**Database:**
- RDS MySQL (db.t3.medium)
- Multi-AZ deployment
- Automated backups (daily)

**Cache:**
- ElastiCache Redis (cache.t3.micro)

**Storage:**
- S3 bucket (driver documents, profile photos)

**Networking:**
- Application Load Balancer
- CloudFront CDN
- Route 53 (DNS)

**Monitoring:**
- CloudWatch (logs & metrics)
- SNS (alerts)

**Estimated Monthly Cost:** $150-$250 USD

### Alternative: DigitalOcean (Cost-Effective)
- 2× Droplets ($12/month each)
- Managed MySQL ($15/month)
- Managed Redis ($15/month)
- Spaces (S3-compatible, $5/month)
- **Total:** ~$60/month

### CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
1. Code Push → GitHub
2. Run Tests (Jest, ESLint)
3. Build Docker Images
4. Push to Container Registry
5. Deploy to Staging (auto)
6. Run E2E Tests
7. Deploy to Production (manual approval)
8. Health Check
9. Rollback on Failure
```

### Mobile App Distribution

**Android:**
- Google Play Store (production)
- APK direct download (beta testing)
- Firebase App Distribution (internal testing)

**iOS:**
- Apple App Store (production)
- TestFlight (beta testing)

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Monitoring & alerts set up
- [ ] Backup strategy implemented
- [ ] Load balancer configured
- [ ] CDN configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Health check endpoints working
- [ ] Rollback plan documented

---

## 🛡️ Risk Management

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Server downtime | High | Load balancing, auto-scaling, 99.9% SLA hosting |
| Database failure | Critical | Automated backups, Multi-AZ deployment, replication |
| GPS inaccuracy | Medium | Fallback to network location, manual adjustment |
| WebSocket disconnection | Medium | Auto-reconnect, fallback to polling |
| Third-party API failure (Maps) | High | Cache map tiles, graceful degradation |
| SMS delivery failure | Medium | Retry logic, alternative SMS provider |
| DDoS attack | High | CloudFlare protection, rate limiting |

### Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low driver adoption | Critical | Incentive program, driver training, marketing |
| Regulatory issues | Critical | Legal consultation, LTFRB coordination |
| Competition (Grab, Angkas) | High | Focus on local market, unique features (terminal mode) |
| Driver fraud | Medium | Verification process, rating system, monitoring |
| Passenger safety incidents | High | Emergency features, insurance, background checks |
| Negative reviews | Medium | Excellent support, quick issue resolution |

### Operational Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Customer support overload | Medium | Chatbot, FAQ, tiered support system |
| Driver verification backlog | Medium | Streamlined process, dedicated team |
| Payment disputes | Medium | Clear fare display, receipts, dispute resolution |
| Scalability issues | High | Cloud auto-scaling, performance monitoring |

---

## 📋 Legal & Compliance

### Required Permits & Registrations
- [ ] DTI Business Registration
- [ ] Mayor's Permit (Naga City)
- [ ] BIR Registration (TIN)
- [ ] SEC Registration (if corporation)
- [ ] LTFRB Coordination (Transport Network Company)
- [ ] Data Privacy Officer Registration (DPO)

### Legal Documents
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Driver Agreement
- [ ] Passenger Agreement
- [ ] Admin User Agreement
- [ ] Cookie Policy (web admin)
- [ ] Refund Policy

### Insurance Requirements
- [ ] General Liability Insurance
- [ ] Cyber Liability Insurance
- [ ] Professional Indemnity Insurance
- [ ] Driver insurance verification (CTPL minimum)

### Compliance Checklist
- [ ] Data Privacy Act 2012 compliance
- [ ] Consumer Act protection
- [ ] E-Commerce Act compliance
- [ ] Anti-Money Laundering (if payment integration)
- [ ] Accessibility standards (future)

---

## 👥 Team Structure

### Development Team (Minimum)
- **1× Full-Stack Developer:** Backend + API
- **1× Mobile Developer:** React Native (both apps)
- **1× Frontend Developer:** Admin panel
- **1× UI/UX Designer:** App design & user flows
- **1× QA Engineer:** Testing & quality assurance
- **1× Project Manager:** Coordination & planning

### Operations Team (Post-Launch)
- **1× Operations Manager:** Driver onboarding, support
- **1× Customer Support:** Handle user issues
- **1× Marketing Specialist:** User acquisition
- **1× Data Analyst:** Metrics & optimization (part-time)

### Advisory (Optional)
- Legal advisor (compliance)
- Transport industry expert (TODA liaison)
- Business mentor/investor

---

## 💰 Budget Estimate (MVP)

### Development Costs (5.5 months)
- Development team salaries: ₱800,000 - ₱1,200,000
- UI/UX design: ₱80,000 - ₱120,000
- Project management: ₱100,000 - ₱150,000

### Infrastructure Costs (First Year)
- Cloud hosting: ₱90,000 (₱7,500/month × 12)
- Google Maps API: ₱60,000 (₱5,000/month × 12)
- SMS service: ₱36,000 (₱3,000/month × 12)
- Domain & SSL: ₱5,000
- Monitoring tools: ₱24,000 (₱2,000/month × 12)

### Legal & Compliance
- Business registration: ₱20,000
- Legal consultation: ₱50,000
- Insurance: ₱40,000/year

### Marketing & Launch
- Driver onboarding incentives: ₱50,000
- Marketing materials: ₱30,000
- Launch event: ₱50,000
- Initial ads: ₱100,000

### Contingency (20%)
- ₱300,000

**Total MVP Budget:** ₱1,800,000 - ₱2,500,000 PHP
**Monthly Operating Cost (Post-Launch):** ₱50,000 - ₱80,000 PHP

---

## 🎯 Go-to-Market Strategy

### Pre-Launch (2 months before)
1. **TODA Partnership:**
   - Meet with local TODA leaders
   - Present platform benefits
   - Recruit 20 pilot drivers
   - Conduct training sessions

2. **Regulatory Approval:**
   - Submit application to LTFRB
   - Coordinate with Naga City LGU
   - Secure necessary permits

3. **Beta Testing:**
   - Closed beta with 5 drivers, 20 passengers
   - Collect feedback
   - Fix critical bugs

### Launch (Month 1)
1. **Soft Launch:**
   - Limited to Naga City proper
   - 20 verified drivers
   - Invite-only for passengers
   - Monitor closely

2. **Marketing:**
   - Social media campaign (Facebook, TikTok)
   - Flyers at terminals
   - Radio ads (local stations)
   - Word-of-mouth incentives

3. **Driver Incentives:**
   - Zero commission for first month
   - ₱500 bonus for first 10 completed rides
   - Free training & onboarding support

4. **Passenger Incentives:**
   - First ride free (up to ₱50)
   - Referral bonus: ₱20 credit per friend

### Growth (Month 2-6)
1. **Expand Coverage:**
   - Add more terminals
   - Expand service area
   - Onboard more drivers (target: 100)

2. **Feature Rollout:**
   - Payment integration (GCash)
   - Advanced analytics
   - Loyalty program

3. **Partnerships:**
   - Corporate accounts (universities, offices)
   - Tourism partnerships
   - Government contracts

### Success Indicators
- 50+ rides/day by Month 2
- 100+ rides/day by Month 4
- 200+ rides/day by Month 6
- Break-even by Month 6
- Expansion to nearby cities by Month 12

---

## 🔄 Future Roadmap (Phase 2+)

### Phase 2: Payment Integration (Month 7-9)
- GCash/PayMaya integration
- In-app wallet
- Automatic fare collection
- Driver weekly payouts
- Transaction history

### Phase 3: Advanced Features (Month 10-12)
- AI-powered dispatch optimization
- Demand prediction & heatmaps
- Dynamic pricing (surge pricing)
- Scheduled rides
- Multi-stop rides
- Promo codes & discounts

### Phase 4: Scale & Optimize (Year 2)
- Expand to 5+ cities
- Driver earnings optimization
- Corporate accounts
- API for third-party integration
- White-label solution for other cities

### Phase 5: Innovation (Year 3+)
- Electric vehicle integration
- Carbon footprint tracking
- Ride-sharing optimization AI
- Autonomous vehicle preparation
- Regional expansion (Visayas, Mindanao)

---

## 📞 Support & Maintenance

### Customer Support Channels
- **In-App Chat:** Real-time support (9 AM - 9 PM)
- **Hotline:** 24/7 emergency line
- **Email:** support@naga-gentra.ph
- **Facebook Page:** Community support
- **FAQ Section:** Self-service help

### Support Tiers
1. **Tier 1:** Automated responses, FAQ
2. **Tier 2:** Customer support agents
3. **Tier 3:** Technical team escalation

### Maintenance Schedule
- **Daily:** Database backups, log rotation
- **Weekly:** Performance review, bug fixes
- **Monthly:** Security updates, feature releases
- **Quarterly:** Infrastructure review, cost optimization

### Incident Response
- **Critical (P0):** < 1 hour response, immediate fix
- **High (P1):** < 4 hours response, same-day fix
- **Medium (P2):** < 24 hours response, 3-day fix
- **Low (P3):** < 72 hours response, next release

---

## 🛡️ Risk Management

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Server downtime | High | Load balancing, auto-scaling, 99.9% SLA hosting |
| Database failure | Critical | Automated backups, Multi-AZ deployment, replication |
| GPS inaccuracy | Medium | Fallback to network location, manual adjustment |
| WebSocket disconnection | Medium | Auto-reconnect, fallback to polling |
| Third-party API failure (Maps) | High | Cache map tiles, graceful degradation |
| SMS delivery failure | Medium | Retry logic, alternative SMS provider |
| DDoS attack | High | CloudFlare protection, rate limiting |

### Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low driver adoption | Critical | Incentive program, driver training, marketing |
| Regulatory issues | Critical | Legal consultation, LTFRB coordination |
| Competition (Grab, Angkas) | High | Focus on local market, unique features (terminal mode) |
| Driver fraud | Medium | Verification process, rating system, monitoring |
| Passenger safety incidents | High | Emergency features, insurance, background checks |
| Negative reviews | Medium | Excellent support, quick issue resolution |

### Operational Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Customer support overload | Medium | Chatbot, FAQ, tiered support system |
| Driver verification backlog | Medium | Streamlined process, dedicated team |
| Payment disputes | Medium | Clear fare display, receipts, dispute resolution |
| Scalability issues | High | Cloud auto-scaling, performance monitoring |

---

## 📚 Documentation Requirements

### Technical Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database schema documentation
- [ ] Architecture diagrams
- [ ] Deployment guide
- [ ] Environment setup guide
- [ ] Troubleshooting guide

### User Documentation
- [ ] Passenger user guide
- [ ] Driver user guide
- [ ] Admin user manual
- [ ] FAQ for each user type
- [ ] Video tutorials

### Business Documentation
- [ ] Business plan
- [ ] Financial projections
- [ ] Marketing strategy
- [ ] Partnership agreements
- [ ] Compliance documentation

---

## ✅ Pre-Launch Checklist

### Technical Readiness
- [ ] All core features implemented & tested
- [ ] 80%+ test coverage
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Load testing passed (100+ concurrent users)
- [ ] Backup & recovery tested
- [ ] Monitoring & alerts configured
- [ ] Error tracking set up (Sentry)
- [ ] API documentation complete

### Business Readiness
- [ ] 20+ drivers verified & trained
- [ ] 100+ passengers registered (beta)
- [ ] Legal documents finalized
- [ ] Permits & registrations obtained
- [ ] Insurance policies active
- [ ] Support team trained
- [ ] Marketing materials ready
- [ ] Launch event planned

### Operational Readiness
- [ ] 24/7 support hotline active
- [ ] Incident response plan documented
- [ ] Driver onboarding process streamlined
- [ ] Payment collection process defined
- [ ] Dispute resolution process established
- [ ] Terms of service published
- [ ] Privacy policy published

### Go/No-Go Criteria
- ✅ All P0 bugs fixed
- ✅ 95%+ crash-free rate
- ✅ < 2s API response time
- ✅ 20+ active drivers
- ✅ Legal compliance verified
- ✅ Support team ready

---

## 🎓 Lessons from Similar Platforms

### What Worked (Grab, Angkas, Joyride)
- Simple onboarding process
- Real-time tracking builds trust
- Driver incentives crucial for adoption
- In-app communication reduces friction
- Transparent pricing prevents disputes
- Rating system ensures quality

### What to Avoid
- Complex fare structures confuse users
- Too many features overwhelm MVP
- Poor driver vetting leads to safety issues
- Inadequate customer support damages reputation
- Ignoring local regulations causes shutdowns
- Underestimating infrastructure costs

### Our Competitive Advantages
1. **Hyper-Local Focus:** Built specifically for Naga City tricycle/jeepney culture
2. **Terminal Mode:** Unique feature not in Grab/Angkas
3. **Capacity Tracking:** Solves real problem for shared rides
4. **TODA Partnership:** Work with existing transport groups, not against them
5. **Affordable:** Lower commission than competitors (future)
6. **Community-Driven:** Support local drivers & economy

---

## 📞 Contact & Resources

### Project Repository
- GitHub: [repository-url]
- Documentation: [docs-url]
- API Docs: [api-docs-url]

### Key Contacts
- Project Lead: [name] - [email]
- Technical Lead: [name] - [email]
- Operations Manager: [name] - [email]

### External Resources
- Google Maps Platform: https://developers.google.com/maps
- React Native Docs: https://reactnative.dev
- Socket.io Docs: https://socket.io/docs
- LTFRB Website: https://ltfrb.gov.ph
- Data Privacy Commission: https://privacy.gov.ph

---

## 🏁 Conclusion

This MVP provides a solid foundation for a production-ready transport booking platform tailored to Naga City's unique tricycle and jeepney ecosystem. The focus on capacity tracking and terminal digitalization addresses real pain points while keeping the scope manageable for a 5-6 month development timeline.

**Next Steps:**
1. Review and approve this MVP specification
2. Assemble development team
3. Secure initial funding
4. Begin Phase 0 (Planning & Setup)
5. Coordinate with TODA and local government
6. Start development sprint 1

**Critical Success Factors:**
- Strong TODA partnership
- Excellent driver onboarding experience
- Reliable real-time tracking
- Simple, intuitive UX
- Responsive customer support
- Regulatory compliance

With proper execution, Naga-Gentra can modernize local public transport while creating economic opportunities for drivers and improving passenger experience.
