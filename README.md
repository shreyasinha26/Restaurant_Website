# 🍽️ FreshBite Kitchen – Restaurant Website  

A modern restaurant web application for **FreshBite Kitchen**, focusing on fresh, healthy food, smooth UX, and a clean admin experience.  
Built with **Flask + MongoDB + Vanilla JS** and designed for both **customers** and **restaurant staff (admins)**.

---

## 👥 1. Group Members

- **Shreya Sinha**  
- **Honey Harsh Jariwala**  
- **Prajisha Kai Mangalath**  

---

## 🎯 2. Application Idea & Target Audience

### 💡 Idea  
FreshBite Kitchen is a modern restaurant platform that lets customers:

- Explore the menu and today’s specials  
- Reserve a table online  
- Contact the restaurant  
- Use the site in **English or Finnish**

Admins can log in to a secure dashboard and manage the menu.

### 🎯 Target Audience

- Health-conscious customers  
- Food enthusiasts and students  
- Restaurant administrators / staff  
- International users (EN/FI)

---

## 🧩 3. Core Application Functionalities

### 👨‍🍳 Customer-Facing Features

- 🏠 **Home page with video hero section**  
- ⭐ **Today’s specials** highlight  
- 🍕 **Interactive menu**  
  - Filter by categories (burgers, pizzas, salads, Finnish, healthy, drinks, etc.)  
  - Dietary restriction tags (vegan, gluten-free, dairy-free, etc.)
- 📅 **Table reservation system**
  - Date & time selection (10:00–22:00)
  - Guest limit (1–9 guests, with warning for >9)
  - Special request field
- 📬 **Contact form**
  - Stores messages in MongoDB  
  - Real-time inline validation (name, email, message, phone)
- 🌍 **Find Us page**
  - Address information  
  - Direct link to **HSL Journey Planner** (`Location (Open in HSL)`)  
- 🔐 **Customer authentication**
  - Customer signup & login pages  
  - Customer dashboard shell
- 🌐 **Multi-language support (EN / FI)**
  - Language switcher in navbar  
  - Text loaded via `translations.js` + `language.js`

---

## 🛠️ Admin Features

- 🔑 **Admin Login**  
  - Email + password login  
  - Admin credentials stored in MongoDB with hashed passwords  
  - Only existing admins can log in (no public signup form)

- 📊 **Admin Dashboard (`/admin-dashboard`)**  
  - View all menu items  
  - Add / edit / delete menu items (name, description, price, category, dietary restrictions, image, day)

> 💡 Currently: Menu changes are managed on the dashboard side and will be integrated with the API/DB in the next iteration.

---

## ⚙️ Technical Features

- 🐍 **Backend:** Flask (Python)  
- 🍃 **Database:** MongoDB Atlas (`freshbite_db`)  
- 🌐 **Frontend:** HTML, CSS, Vanilla JavaScript  
- 🔐 **Auth & Security**
  - Passwords stored as hashed values (no plaintext)  
  - Admin JWT support ready in backend  
- 🌍 **CORS enabled** for local testing  
- 📱 **Fully responsive design** for desktop & mobile  
- ✅ **Inline form validation** (contact + reservation)  
- 📩 **Toast-style notifications** for success / error messages  

---

## 🧪 4. Demo Overview (For Presentation)

### 👥 Customer Flow (Demo)

1. Open **Home page** – explain hero video and today’s specials  
2. Go to **Menu** – show category filters and dietary tags  
3. Go to **Reservation**  
   - Try invalid data (wrong email, bad phone, missing fields) → see **inline red error messages**  
   - Make a **valid reservation** → success notification  
4. Go to **Contact**  
   - Show inline validation  
   - Submit a message → “Message sent successfully” notification  
5. Show **Find Us** → click **“Location (Open in HSL)”** (opens HSL reittiopas)

### 🛠️ Admin Flow (Demo)

1. Open `/login`  
2. Login with existing admin credentials, e.g.:  
   - Email: `admin@freshbite.com`  
   - Password: `admin123`  
3. On success, show redirect to **Admin Dashboard**  
4. On dashboard:
   - Add a new menu item  
   - Edit an existing one  
   - Delete an item  
   - Show counters (today’s menu, total items, weekly specials)

---

## 📦 5. How to Test the Application

### ✅ Prerequisites

- Python **3.8+**  
- A MongoDB Atlas account (or use the provided URI)  
- Git  
- Web browser (Chrome / Edge / Firefox)

---

## 💾 6. Installation & Local Setup

```bash
### 1. Clone the repository
git clone [https://github.com/shreyasinha26/Restaurant_Website]

### 2. Virtual environment

### 3. Dependencies
        Flask==2.3.3
        pymongo==4.5.0
        bcrypt==4.0.1
        PyJWT==2.8.0
        Flask-CORS==4.0.0
### 4. Environment variables
        SECRET_KEY=your-super-secret-key-here-change-in-production
        MONGO_URI=mongodb+srv://hnjrwl_db_user:Honey12345@cluster0.w8sfktk.mongodb.net/freshbite_db?retryWrites=true&w=majority
        JWT_SECRET_KEY=jwt-super-secret-key-change-this-too

### 5. Run the application
    python app.py


## Customer Testing

Home Page: /
Signup: /customers_signup
Login: /customer_login
Menu: /menu (filter categories)
contact: /contact
find us: /find_us
Language: Switch EN/FI

## Admin Testing

Admin Login: /login
Dashboard: /admin-dashboard
Menu Management: Add, edit, delete items
Specials Management: Set today’s specials
Logout: Test secure logout

## API Testing
http://localhost:5000/api/menu
http://localhost:5000/api/menu/today

## This project is useful:
### For Customers

Clear dietary information
Multi-language support
Modern, responsive UI

### For Restaurant Owners

Centralized menu management
Easy updates to specials


### Technical Advantages

Follows MVC architecture
Secure authentication
Modular and scalable
Clean and maintainable codebase

### Future Enhancements

Adding orders in cart
Online payment integration
Order tracking system
Customer reviews and ratings
Update from admin dasboard saved in DB

## Troubleshooting

MongoDB Connection Error : Check your MONGO_URI

Python Module Errors : Ensure virtual environment is active, Reinstall dependencies