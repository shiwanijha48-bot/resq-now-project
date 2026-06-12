# 🚨 ResQ-Now — Emergency Resource Connect

<div align="center">

### Connecting Communities During Emergencies, One Request at a Time.

A real-time emergency resource sharing platform that enables citizens, volunteers, donors, and organizations to coordinate and respond quickly during crises.

</div>

---

## 🌟 Overview

**ResQ-Now** is a community-driven emergency response platform designed to bridge the gap between people in urgent need and those willing to help.

During disasters and emergencies, finding blood donors, volunteers, food supplies, transport, medicine, or shelter becomes difficult. ResQ-Now provides a centralized platform where users can raise requests, volunteers can respond, and communities can coordinate efficiently.

---

## ✨ Key Features

### 🆘 Emergency Request System

Users can instantly create emergency requests for:

* 🩸 Blood
* 💊 Medicine
* 🍲 Food
* 🏠 Shelter
* 🚗 Transport

---

### 🤝 Volunteer Coordination

* Volunteer registration and dashboard
* View and manage active requests
* Accept and assist emergency cases
* Email notifications for coordination

---

### 📍 Location-Based Assistance

* Browser geolocation support
* Reverse geocoding for address detection
* Map-based visualization of emergency requests

---

### 🔐 Secure Authentication

Powered by Supabase Authentication:

* User registration
* Login and logout
* Session management
* Protected routes

---

### ⚡ Real-Time Updates

Using Supabase Realtime:

* Live synchronization of requests
* Immediate visibility of new emergencies
* Faster community response

---

### 📱 Responsive User Experience

* Mobile-friendly design
* Clean and intuitive interface
* Optimized for both desktop and mobile devices

---

## 🛠 Tech Stack

| Layer                | Technology                                  |
| -------------------- | ------------------------------------------- |
| Frontend             | Next.js (App Router)                        |
| Language             | TypeScript & JavaScript                     |
| UI Library           | React                                       |
| Styling              | Tailwind CSS                                |
| Backend-as-a-Service | Supabase                                    |
| Database             | PostgreSQL                                  |
| Authentication       | Supabase Auth                               |
| Realtime             | Supabase Realtime                           |
| APIs                 | Next.js Route Handlers                      |
| Email Notifications  | Resend / Nodemailer                         |
| Maps & Geolocation   | Browser Geolocation API + Reverse Geocoding |
| Deployment           | Vercel                                      |

---

## 🏗 Architecture

```
Users
   ↓
Next.js + React Frontend
   ↓
Next.js API Routes
   ↓
Supabase
├─ PostgreSQL Database
├─ Authentication
└─ Realtime Services
   ↓
Email Notifications
(Resend / Nodemailer)
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or above)
* npm or yarn
* Supabase account

---

### Clone the Repository

```bash
git clone https://github.com/shiwanijha48-bot/ResQ-Now.git
cd ResQ-Now
```

---

### Install Dependencies

```bash
npm install
```

---

### Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Service
EMAIL_USER=your_email
EMAIL_PASS=your_password
# OR
RESEND_API_KEY=your_resend_api_key
```

---

### Run the Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 📂 Project Structure

```
ResQ-Now/
├── app/                  # App Router pages and API routes
├── components/           # Reusable UI components
├── lib/                  # Supabase, utilities, geocoding
├── public/               # Static assets
├── types/                # TypeScript definitions
├── .env.local            # Environment variables
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## 💡 Future Enhancements

* 🤖 AI-powered emergency matching
* 📲 SMS and WhatsApp notifications
* 🛡️ Advanced admin dashboard
* 📱 Dedicated mobile application
* ✅ Verified volunteer badges
* 🌐 Multi-language support
* 📊 Analytics and response metrics

---

## 🎯 Impact

ResQ-Now aims to reduce response delays during emergencies by enabling communities to collaborate efficiently through technology.

Every emergency request represents a real person in need. By connecting helpers with those seeking assistance, ResQ-Now strives to create a faster, smarter, and more compassionate emergency response ecosystem.

---

If you found this project useful, consider giving it a ⭐ on GitHub.

---

<div align="center">

### Built with ❤️ to help communities respond when every second matters.

</div>
