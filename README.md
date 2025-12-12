# 🍽️ FreshBite Kitchen – Full-Stack Restaurant Web Application  

A modern restaurant website built using **Flask**, **MongoDB**, and **Vanilla JavaScript**, designed for both customers and administrators.  
The system includes real-time menu loading, today’s specials, table reservations, contact form storage, and an interactive admin dashboard.

---

# 👥 1. Group Members  
- **Shreya Sinha**  
- **Honey Harsh Jariwala**  
- **Prajisha Kai Mangalath**

---

# 🎯 2. Application Idea & Target Audience  

## 💡 Idea  
FreshBite Kitchen provides an online restaurant experience that allows customers to:

- Browse a dynamic menu  
- See Today’s Specials  
- Make table reservations  
- Contact the restaurant  
- Switch between **English** and **Finnish** languages  

Admins can log in to a secure dashboard and manage menu data, specials, and item details.

## 🎯 Target Audience  
- Health-conscious customers  
- Students & families  
- Restaurant staff/administrators  
- International users (EN/FI)  
- Anyone wanting a modern food-website experience  

---

# 🧩 3. Application Functionalities  

## 👨‍🍳 Customer-Facing Features  

### 🏠 Home Page  
- Hero video background  
- Today’s Special (auto-loaded via API)  
- Smooth animations  
- EN/FI language switcher  

### 🍕 Interactive Menu Page  
- Dynamic menu fetched from API  
- Filter categories:  
  **Burgers, Pizzas, Salads, Finnish, Healthy, Drinks**  
- Dietary tags: vegan, gluten-free, dairy-free 

### 📅 Table Reservation Page  
- Date & time selection (10:00–22:00)  
- Guest selection (1–9)  
- Special request field   
- Stores reservations in MongoDB  

### 📬 Contact Page  
- Validates input fields  
- Submits message to database  
- Clear success/error alerts  
- Inline form validation 

### 📍 Find Us Page  
- Restaurant location  
- One-click link to **HSL Journey Planner** ,**Goodle Maps**,**Apple Maps**

### 🌍 Multi-Language Support  
- EN / FI  
- Handled by `translations.js` and `language.js`  

---

## 🛠️ Admin Features  

### 🔐 Admin Authentication  
- Login with email + hashed password  
- Secure JWT support  
- Admin session handling  

### 📊 Admin Dashboard  
- View menu items  
- Add a menu item  
- Edit an existing item  
- Delete an item  
- Dashboard stats (total items, specials count, etc.)

---

# ⚙️ 4. Technical Architecture  

### Backend  
- Flask (Python)  
- Modular MVC structure  
- JWT authentication  
- Password hashing with bcrypt  
- CORS enabled for local testing  

### Database  
- MongoDB Atlas (`freshbite_db`)  
- Collections:  
  - `menu_items`  
  - `reservations`  
  - `contacts`  
  - `admins`  
  - `users`  

### Frontend  
- HTML, CSS, JavaScript  
- Dynamic API-based rendering  
- Responsive design  

### Deployment  
- Running on Metropolia cloud server  
- Apache Reverse Proxy → Flask  
- HTTPS enabled  

---

# 🧪 5. Demo Instructions (For Presentation)

## 👥 Customer Demo  

1. **Home Page**  
   - Show video banner  
   - Show Today’s Specials (fetched from `/app/api/today`)  
   - Switch EN ↔ FI  

2. **Menu Page**  
   - Show category filters  
   - Show dietary tags  
   - Add-to-cart UI  

3. **Reservation Page**  
   - Try incorrect values → inline validation  
   - Make a valid reservation → success toast  

4. **Contact Page**  
   - Inline validation  
   - Submit to DB  

5. **Find Us Page**  
   - Click “Open in HSL” or “Google Maps” or “Apple Maps” link  

---

## 🛠️ Admin Demo  

1. Go to **Admin Login** (`/app/login`).  
2. Enter credentials:  
   - Email: `admin@freshbite.com`  
   - Password: `Admin@123`  
3. Show redirect to **Admin Dashboard**  
4. Add a menu item  
5. Edit an item  
6. Delete an item  
7. Show dashboard statistics panel  

---

# 🧪 6. How to Test the Application (Required for Teachers)

## ✔ **Live Server Testing (Metropolia Deployment)**  
Use this IP address to test (as required):

### 🌐 https://10.120.32.84/app/

| Feature | URL |
|--------|-----|
| **Home Page** | https://10.120.32.84/app/ |
| Menu | https://10.120.32.84/app/menu |
| Today’s Specials | (scroll on home page) |
| Reservation | https://10.120.32.84/app/reservation |
| Contact | https://10.120.32.84/app/contact |
| Find Us | https://10.120.32.84/app/find-us |
| Customer Login | https://10.120.32.84/app/customer_login |
| Customer Signup | https://10.120.32.84/app/customers_signup |
| **Admin Login** | https://10.120.32.84/app/login |
| **Admin Dashboard** | https://10.120.32.84/app/admin-dashboard |

# 📦 7. Installation Instructions

### 1. Clone  
```bash
git clone https://github.com/shreyasinha26/Restaurant_Website
cd Restaurant_Website
