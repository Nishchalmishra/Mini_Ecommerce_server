# Mini E-Commerce Backend API

This is a **Node.js + Express backend** for a Mini E-Commerce application.

The API supports user authentication, product management, cart operations, and order management.
Users can browse products, add them to a cart, and place orders.

---

# Features

• User Authentication (JWT)
• Email Verification
• Password Reset System
• Product Management (CRUD)
• Shopping Cart System
• Order Management
• Secure Protected Routes

---

# Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

---

# Project Structure

```
Mini_Ecommerce_server
│
├── controllers
├── middlewares
├── models
├── routes
├── utils
│
├── server.js
└── package.json
```

---

# Installation

Clone the repository

```
git clone https://github.com/Nishchalmishra/Mini_Ecommerce_server.git
```

Move into the project directory

```
cd Mini_Ecommerce_server
```

Install dependencies

```
npm install
```

Create a `.env` file

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the server

```
npm start
```

Server will run on

```
http://localhost:5000
```

---

# Authentication Routes

| Method | Endpoint                 | Description               |
| ------ | ------------------------ | ------------------------- |
| POST   | /register                | Register new user         |
| POST   | /login                   | User login                |
| POST   | /logout                  | Logout user               |
| GET    | /getUser                 | Get logged in user        |
| POST   | /verifyEmail/:token      | Verify user email         |
| POST   | /resendEmailVerification | Resend verification email |
| POST   | /forgotPassword          | Send password reset email |
| POST   | /resetPassword/:token    | Reset user password       |

---

# Product Routes

| Method | Endpoint                    | Description       |
| ------ | --------------------------- | ----------------- |
| GET    | /products                   | Get all products  |
| GET    | /products/:id               | Get product by ID |
| POST   | /products/addProduct        | Add new product   |
| PUT    | /products/updateProduct/:id | Update product    |
| DELETE | /products/deleteProduct/:id | Delete product    |

---

# Cart Routes

| Method | Endpoint | Description           |
| ------ | -------- | --------------------- |
| GET    | /cart    | Get user cart         |
| POST   | /cart    | Add item to cart      |
| DELETE | /cart    | Remove item from cart |

---

# Order Routes

| Method | Endpoint    | Description      |
| ------ | ----------- | ---------------- |
| GET    | /orders     | Get all orders   |
| POST   | /orders     | Create new order |
| GET    | /orders/:id | Get order by ID  |

---

# API Security

Protected routes require **JWT token** in request headers.

Example

```
Authorization: Bearer <token>
```

---

# Future Improvements

• Payment Gateway Integration
• Product Image Upload
• Admin Dashboard
• Product Reviews
