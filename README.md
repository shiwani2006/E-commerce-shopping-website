#  ShopSphere

A full-stack **multi-vendor e-commerce platform** with separate portals for **customers**, **vendors**, and **admins**. Built as a final-year college project.

---

##  Features

###  Customer Portal
- Browse products, search, and filter by category
- Cart with live item-count badge across the site
- Wishlist (add/remove from Home, Products, and Dashboard)
- Checkout with **coupon apply/remove**, **Cash on Delivery**, and **Razorpay** (UPI / QR / cards)
- Order history and **live order tracking** with a visual status stepper
- Profile management (name, phone, address, city, state)
- Reward points (earned on every order) and an Offers page with copy-to-clipboard coupons

###  Vendor Portal
- Vendor dashboard with real stats (orders, revenue, customers)
- Add and manage products (multi-step wizard)
- Order management: view orders and update order status
- Coupon management (create, edit, delete) with admin approval
- MyShop profile with logo and banner upload
- Earnings overview

###  Admin Portal
- Dashboard with MongoDB aggregations (revenue, orders, growth, category breakdown)
- Approve / reject vendors
- Approve / reject vendor-submitted products (new products start as *Pending*)
- Approve / reject coupons (with rejection reason)
- Manage orders and customers (block / unblock)

---

##  Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React (Vite), Material UI (v6), React Router    |
| Backend   | Node.js, Express.js                             |
| Database  | MongoDB with Mongoose                           |
| Auth      | JWT (role-based: customer / vendor / admin)     |
| Payments  | Razorpay                                        |

---

##  Project Structure

```
shopsphere/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/          # one-time migration scripts
│   ├── .env.example
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/          # API helper files
│   │   ├── components/
│   │   ├── context/      # CartContext, etc.
│   │   ├── pages/
│   │   └── App.jsx
│   ├── .env.example
│   └── vite.config.js
│
└── README.md
```

##  User Roles

| Role     | Access                                                        |
|----------|---------------------------------------------------------------|
| Customer | Shop, cart, wishlist, checkout, track orders, rewards         |
| Vendor   | Manage own products, orders, coupons, shop profile, earnings  |
| Admin    | Approve vendors/products/coupons, manage users and orders     |

---

##  Order Flow

1. Customer adds products to cart and applies an optional coupon.
2. Customer pays via **COD** or **Razorpay** (payment is verified on the backend).
3. Stock is validated and decremented; the order is created with a vendor snapshot per item.
4. Vendor updates the order status (Pending → Confirmed → Shipped → Delivered).
5. Customer tracks the order live and earns reward points.

---




##  Screenshot 

---Home Page---


<img width="1885" height="977" alt="image" src="https://github.com/user-attachments/assets/52e9f122-fa92-468d-bfac-c14efb90e7c9" />


<img width="1892" height="982" alt="Screenshot 2026-10-03 223659" src="https://github.com/user-attachments/assets/aca4e9f0-ad01-4abb-ae9c-60063f8dfff6" />


<img width="1880" height="981" alt="Screenshot 2026-10-03 223718" src="https://github.com/user-attachments/assets/4c41aeef-2c25-4ee8-8c97-fde56b90a4f5" />


<img width="1891" height="943" alt="Screenshot 2026-10-03 223735" src="https://github.com/user-attachments/assets/3500a3bc-f3b9-40ea-9008-85cf92dfb8b6" />




---Login & Register---


<img width="1878" height="972" alt="image" src="https://github.com/user-attachments/assets/bd5732d5-ebce-4d4d-8688-9e3373ea96f1" />


<img width="1865" height="968" alt="image" src="https://github.com/user-attachments/assets/4cb9a5a9-e684-42a9-ab27-e0116e2c963d" />



## Open to Collaboration

I'm open to collaborating on ShopSphere! Whether you want to fix a bug, build a new feature, improve the UI, or just share ideas, you're welcome to join in


----Thank You----




