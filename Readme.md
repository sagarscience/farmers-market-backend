🌾 Farmers Online Trading and Selling System
An end-to-end MERN stack web application that empowers farmers to sell their produce online and allows buyers to purchase, review, and track orders in real-time. Admins manage users, products, and platform operations through a centralized dashboard.



🔗 Live Demo
Frontend: 🌐 Farmers Marketplace (Amplify)

Backend API: 🌐 Render Server

📦 Tech Stack
Layer	Tech
Frontend	React.js + Vite, Axios, Tailwind CSS
Backend	Express.js, MongoDB, Mongoose
Auth	JWT, bcrypt
Payments	Razorpay Integration
Real-Time	Socket.IO (Farmer-Buyer/Admin Chat)
Hosting	Render (backend) + AWS Amplify (frontend)
Extra	PDFKit (Invoices), RSS Feed Parser

✨ Features
👨‍🌾 Farmer
Add, update, and delete products

View own order history

Update order tracking statuses

Chat with buyers/admin

🛒 Buyer
Browse and purchase products

Secure payment via Razorpay

Track order status with timeline

Submit product reviews and ratings

Chat with farmers/admin

🛡️ Admin
View/manage all users, products, and orders

Delete users/products

Update order statuses

🌐 Real-Time Chat
Secure Socket.IO-based rooms for:

Buyer ↔ Farmer

Buyer ↔ Admin

Farmer ↔ Admin

📄 Invoices
Auto-generate downloadable PDF invoices after order payment

📰 News
Agriculture RSS feed integration from The Hindu

📁 Folder Structure
bash
Copy
Edit
├── client/                   # Vite + React frontend
│   └── src/
├── server/                  # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
├── .env
├── .gitignore
├── README.md
├── package.json
⚙️ Setup Instructions (Dev Mode)
1. Clone the repo
bash
Copy
Edit
git clone https://github.com/your-username/farmers-market.git
cd farmers-market
2. Set up backend
bash
Copy
Edit
cd server
npm install
touch .env
.env content:

ini
Copy
Edit
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
Run server:

bash
Copy
Edit
npm run dev
3. Set up frontend
bash
Copy
Edit
cd client
npm install
npm run dev
📦 Deployment Info
Backend (Render)
URL: https://farmers-market-backend-f1u8.onrender.com

Start Command: node server.js

Frontend (AWS Amplify)
URL: https://main.d3kd3knlivprie.amplifyapp.com

Build Command: npm run build

Output directory: dist

📸 Screenshots (Optional)
Add screenshots of your dashboards, product listing, chat, invoices, etc.

📚 Future Improvements
Add OTP login or 2FA

Delivery person role

Image upload to AWS S3

ElasticSearch for product filtering

Admin analytics dashboard

👨‍💻 Author
Sagar Agrawal
Roll No: 2314506422
Manipal University Jaipur
MCA Major Project (April–October 2025)
Guide: Mr. Dhruv Aggarwal

