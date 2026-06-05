# Automynx POS 🍽️

A modern, production-ready Restaurant Point of Sale (POS) system built with React. Designed with a premium "SaaS-like" aesthetic, it provides a comprehensive suite of tools for managing dine-in, takeout, and delivery operations seamlessly.

## ✨ Key Features

- **Floor Plan & Table Management:** Interactive visual layout with zones (Indoor, Bar, Outdoor, Private). Real-time tracking of table statuses, guest counts, and seated durations.
- **Advanced Order Entry:** Intuitive menu grid with categories, customizable item modifiers, seat assignments, and special request handling.
- **Kitchen Display System (KDS):** High-contrast, always-dark kitchen screen with live prep timers, color-coded urgency alerts, allergy warnings, and one-tap bump buttons.
- **Delivery & Online Orders:** Dedicated module for tracking off-premise orders, complete with ETA countdowns, driver assignment, and status tracking (Prep → Ready → Out for Delivery).
- **Staff Management:** Employee clock in/out tracking, role management, and server-to-table assignments.
- **Customer CRM & Loyalty:** Guest profiles with automated loyalty tier tracking (Bronze, Silver, Gold).
- **Reports & Analytics:** Dashboard with real-time KPI tracking for revenue, covers, open tables, and top-selling items.
- **Modern Architecture:** Built on Vite and React with Zustand for lightning-fast, reactive state management. Fully responsive with Light/Dark theme support.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite
- **State Management:** Zustand
- **Styling:** Vanilla CSS (CSS Variables / Design Tokens for seamless theming)
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/messazeeshan/automynxPOS.git
   cd automynxPOS
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser to view the application.

## 🎨 Design System

The application utilizes a custom CSS-variable based design system featuring:
- A warm, professional off-white background (`#F7F7F5`) with deep forest green accents (`#1E5C3A`).
- Sharp, confident typography using **Plus Jakarta Sans** and **Inter**.
- Carefully calibrated light and dark modes with distinct sidebar and KDS overrides for optimal visibility.

## 📝 License

This project is proprietary and confidential. All rights reserved.
