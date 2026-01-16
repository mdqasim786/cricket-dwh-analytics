# 🏏 Cricket Legends Analytics Hub 

A professional, mobile-responsive **Data Warehouse (DWH)** application designed to centralize and analyze cricket gear sales across multiple regional branches (Karachi, Lahore, and Islamabad).

## 🚀 Overview
Cricket Legends Analytics Hub serves as a **Single Source of Truth** for sports retail management. Instead of scattered sales records, this system aggregates data into a cloud-based warehouse, providing real-time Business Intelligence (BI) through interactive charts and automated revenue tracking.

## ✨ Key Features
- **Real-time Data Ingestion:** Fast, validated entry of sales transactions.
- **Interactive Analytics:** Dynamic Bar Charts (using Recharts) to visualize regional performance.
- **CRUD Operations:** Full ability to Create, Read, Update, and Delete warehouse records.
- **Cloud Warehouse:** Powered by **Firebase Firestore** for non-volatile, persistent storage.
- **Responsive Dark Theme:** Modern UI built with **Tailwind CSS** for seamless use on mobile and desktop.

## 🏗️ Data Warehouse Architecture
The project follows a modern cloud-based ETL (Extract, Transform, Load) flow:

1.  **Extract:** User inputs sales data via the React frontend.
2.  **Transform:** JavaScript logic ensures data types (prices as numbers) and adds timestamps.
3.  **Load:** Data is pushed to the Firestore NoSQL collection.
4.  **Reporting:** The app retrieves data in real-time to generate regional sales summaries and revenue totals.

## 🛠️ Tech Stack
- **Frontend:** ReactJS (Vite)
- **Styling:** Tailwind CSS
- **Database:** Firebase Firestore (NoSQL)
- **Visualization:** Recharts (D3-based charts)

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YourUsername/cricket-dwh-analytics.git](https://github.com/YourUsername/cricket-dwh-analytics.git)
   cd cricket-dwh-analytics
