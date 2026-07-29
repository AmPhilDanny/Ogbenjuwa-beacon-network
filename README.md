# 🛡️ Ogbenjuwa Community Safety Network

> Protecting Idoma Communities in Benue State through Real-Time Community Safety, Emergency Response, and Digital Coordination.

![Status](https://img.shields.io/badge/Status-MVP-success)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)

---

# 📖 Overview

Ogbenjuwa is a full-stack community safety and emergency response platform built specifically for the Idoma-speaking communities of Benue State, Nigeria.

The platform enables citizens, community leaders, vigilante groups, and security coordinators to report, monitor, and respond to security incidents in real time.

Designed for rural communities, Ogbenjuwa supports:

- 🌍 Web platform
- 📱 Mobile-friendly interface
- 📡 Real-time alerts
- 📞 SMS & USSD support (*347#)
- 🌐 English & Idoma languages
- 📍 GPS-enabled incident reporting
- 📊 Command dashboards and analytics

---

# 🚨 Problem

Many rural communities face:

- Slow emergency communication
- No unified incident reporting system
- Poor coordination between security teams
- Limited smartphone penetration
- Lack of localized digital safety infrastructure

---

# 💡 Solution

Ogbenjuwa addresses these challenges by providing an integrated community safety platform that connects citizens, community leaders, vigilante groups, and emergency responders through real-time reporting, coordinated response, SMS/USSD accessibility, and data-driven decision-making.

---

# ✨ Key Features

## Public Safety Platform

- Interactive incident map
- Live alert feed
- Report security incidents
- Family reunification
- Patrol monitoring
- Emergency resources
- Offline support

## Citizen Portal

- Panic button
- Personal dashboard
- Emergency contacts
- Community updates
- Incident reporting
- Family search
- Resource finder
- Language switch (English / Idoma)

## Central Command

- User management
- Alert management
- Patrol operations
- Incident tracking
- SOS management
- Communications hub
- Analytics dashboard
- Audit logs
- API management

---

# 🏗️ System Architecture

```
             Beacon Network
            (Public Platform)
                    │
                    │
          HTTP / WebSocket
                    │
     ┌──────────────┴──────────────┐
     │                             │
Citizen Portal             Central Command
 (Citizens)                 Admin Dashboard
     │                             │
     └──────────────┬──────────────┘
                    │
              Express.js API
                    │
              PostgreSQL Database
```

---

# 🛠 Tech Stack

## Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- Leaflet Maps
- Framer Motion
- Axios

## Backend

- Node.js
- Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL
- JWT Authentication
- WebSocket
- Africa's Talking SMS API

## Deployment

- Vercel
- Render
- Supabase
- Neon PostgreSQL
- Docker

---

# 📍 Coverage Area

Ogbenjuwa currently supports all nine Idoma Local Government Areas:

- Otukpo
- Ohimini
- Okpokwu
- Ado
- Ogbadibo
- Agatu
- Apa
- Obi
- Oju

Including over **934 mapped villages**.

---

# 📡 SMS & USSD

Even users without smartphones can access emergency services through:

```
*347#
```

Supported commands include:

- Panic alerts
- Incident reporting
- Family reunification
- Resource lookup
- Community alerts

---

# 🔐 Security

- JWT Authentication
- Role-Based Access Control (RBAC)
- API Keys
- Audit Logs
- Two-Factor Authentication (2FA)
- Rate Limiting
- HTTPS Encryption

---

# 📊 Performance Goals

- API Response Time < 200ms
- Dashboard Load Time < 2 seconds
- WebSocket Latency < 100ms
- SMS Delivery < 30 seconds

---

# 🚀 Future Roadmap

- React Native Mobile Application
- Progressive Web App (PWA)
- AI-powered Incident Classification
- Government Agency Integration
- Predictive Security Analytics
- Multi-language Support

---

# 🤝 Contributing

This project was developed collaboratively by the Ogbenjuwa team.

Team members contribute through feature branches, code reviews, and pull requests to maintain code quality, consistency, and reliable collaboration.

---

# 📄 License

This project is licensed under the MIT License.

---

# ❤️ Mission

**Built with purpose. Protecting Idoma lives through technology.**
