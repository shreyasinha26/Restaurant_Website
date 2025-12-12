🍽️ FreshBite Kitchen
Full-Stack Restaurant Web Application

🌐 Live Application (Testing URL)
👉 https://10.120.32.84/app/

FreshBite Kitchen is a modern full-stack restaurant website built using Flask, MongoDB, and Vanilla JavaScript.
The application is designed for customers and administrators, combining clean UI, secure authentication, and database-driven functionality.

👥 1. Team Members

Shreya Sinha

Honey Harsh Jariwala

Prajisha Kai Mangalath

🎯 2. Application Idea & Target Audience
💡 Idea

FreshBite Kitchen offers a digital restaurant experience where users can:

Browse a dynamic menu

View Today’s Specials

Make table reservations

Contact the restaurant

Switch between English and Finnish

Administrators can securely manage menu data through a protected admin dashboard.

👤 Target Audience

Health-conscious customers

Students and families

Restaurant staff and administrators

International users (EN / FI)

🧩 3. Application Features
👨‍🍳 Customer-Side Features
🏠 Home Page

Video hero banner

Today’s Specials loaded dynamically via API

Smooth animations

Language switcher (EN / FI)

🍕 Menu Page

Dynamic menu loaded from backend API

Category filters:

Burgers, Pizzas, Salads, Finnish, Healthy, Drinks

Dietary tags (Vegan, Gluten-Free, Dairy-Free)

Add-to-Cart UI (future implementation)

📅 Reservation Page

Date & time selection (10:00–22:00)

Guest selection (1–9)

Special request field

Reservations stored in MongoDB

📬 Contact Page

Client-side validation

Messages stored in database

Clear success and error feedback

📍 Find Us Page

Restaurant location

External navigation links:

HSL Journey Planner

Google Maps

Apple Maps

🌍 Multi-Language Support

English / Finnish

Implemented using translations.js and language.js

🛠️ Admin-Side Features
🔐 Authentication

Secure login with hashed passwords

JWT-based authentication

Session and cookie handling

📊 Admin Dashboard

View menu items

Add new menu items

Edit existing menu items

Delete menu items

View dashboard statistics

⚠️ Note:
Admin actions currently affect only the backend database.
Menu changes are not reflected live on the customer website.
Live synchronization is planned as a future enhancement.

⚙️ 4. Technical Architecture
Backend

Flask (Python)

Modular structure (routes, controllers, models)

JWT authentication

Password hashing with bcrypt

CORS enabled

Database

MongoDB Atlas (freshbite_db)

Collections:

menu_items

reservations

contacts

admins

users

Frontend

HTML, CSS, Vanilla JavaScript

API-driven dynamic content

Responsive design

Deployment

Hosted on Metropolia Cloud

Apache Reverse Proxy → Flask

HTTPS enabled

🧪 5. Demo Guide (Presentation)
👥 Customer Demo

Home page → Today’s Specials + language switch

Menu page → category filtering & tags

Reservation page → validation & submission

Contact page → message submission

Find Us page → map links

🛠️ Admin Demo

Login: /app/login

Credentials:

Email: admin@freshbite.com

Password: Admin@123

Access admin dashboard

Add, edit, delete menu items

Show statistics panel

🧪 6. How to Test (Live Server)

🌐 Base URL: https://10.120.32.84/app/

Feature	URL
Home	/
Menu	/menu
Reservation	/reservation
Contact	/contact
Find Us	/find-us
Customer Login	/customer_login
Customer Signup	/customers_signup
Admin Login	/login
Admin Dashboard	/admin-dashboard
📦 7. Installation Instructions
1️⃣ Clone Repository
git clone https://github.com/shreyasinha26/Restaurant_Website
cd Restaurant_Website

2️⃣ Create Virtual Environment
python -m venv venv
source venv/bin/activate   # Linux / macOS
venv\Scripts\activate      # Windows

3️⃣ Install Dependencies
pip install -r requirements.txt

4️⃣ Run Application
python app.py


Open:

http://localhost:5000

🚀 8. Future Improvements
🛒 Add-to-Cart & Ordering

Full cart functionality

Online ordering

Order tracking and history

🔄 Live Menu Updates

Sync admin menu changes to website

Real-time API updates

👤 Customer Dashboard

Convert static dashboard to dynamic

Show user profile, reservations, and orders

🎨 UI / UX

Loading indicators

Toast notifications

Improved mobile responsiveness

🔐 Security

Improved token handling

Environment-based configuration