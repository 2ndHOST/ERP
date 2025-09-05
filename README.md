# Student ERP System with Blockchain-Lite Verification

A comprehensive full-stack Student ERP System featuring blockchain-lite verification for secure record management, built with modern web technologies.

## 🌟 Features

### Core Functionality
- **🔐 Authentication**: JWT-based login system with role-based access (Admin/Student)
- **👥 Student Management**: Complete student lifecycle from admission to graduation
- **💳 Fee Management**: Secure payment processing with PDF receipts and QR codes
- **🏠 Hostel Management**: Room allocation and tracking system
- **📊 Analytics Dashboard**: Real-time insights and comprehensive reporting
- **🔗 Blockchain-Lite**: SHA256-based immutable record verification

### Technical Features
- **📱 Responsive Design**: Modern UI with TailwindCSS
- **📈 Data Visualization**: Interactive charts with Recharts
- **🔒 Security**: JWT authentication with role-based access control
- **📄 PDF Generation**: Automated receipt generation with QR codes
- **🔍 Blockchain Verification**: Immutable record verification system

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** with hooks
- **TailwindCSS** for styling
- **Recharts** for data visualization
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** authentication
- **Blockchain-Lite** (Pure JavaScript implementation)
- **PDFKit** for receipt generation
- **QRCode** generation

## 📁 Project Structure

```
project-root/
├── frontend/                    # Next.js application
│   ├── app/                    # App Router pages
│   │   ├── login/             # Login page
│   │   ├── admissions/        # Student management
│   │   ├── fees/              # Fee management
│   │   ├── hostel/            # Hostel management
│   │   └── dashboard/         # Admin dashboard
│   ├── components/            # Reusable components
│   │   ├── Navbar.jsx         # Navigation component
│   │   ├── FormInput.jsx      # Form input component
│   │   ├── ReceiptViewer.jsx  # PDF receipt viewer
│   │   └── Charts/            # Chart components
│   ├── context/               # React context
│   │   └── AuthContext.jsx    # Authentication context
│   ├── services/              # API services
│   │   └── api.js             # Axios configuration
│   └── public/                # Static assets
├── backend/                    # Node.js + Express + MySQL
│   ├── routes/                # API routes
│   │   ├── auth.js            # Authentication routes
│   │   ├── admissions.js      # Student management
│   │   ├── fees.js            # Fee management
│   │   ├── hostel.js          # Hostel management
│   │   ├── dashboard.js       # Dashboard data
│   │   └── blockchain.js      # Blockchain verification
│   ├── blockchain/            # Blockchain implementation
│   │   └── blockchain.js      # Block and Blockchain classes
│   ├── utils/                 # Utility functions
│   │   ├── db.js              # Database connection
│   │   ├── auth.js            # JWT helpers
│   │   └── receipt.js         # PDF generation
│   └── server.js              # Main server file
├── setup.sh                   # Automated setup script
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **MySQL** 8.0+
- **npm** or **yarn**

### Automated Setup (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd student-erp-system

# Run the setup script
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp config.env .env

# Update .env with your database credentials
# DB_HOST=localhost
# DB_USER=your_username
# DB_PASSWORD=your_password
# DB_NAME=student_erp
# JWT_SECRET=your_jwt_secret

# Start the backend server
npm run dev
```

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp env.example .env.local

# Start the frontend development server
npm run dev
```

#### 3. Database Setup
```sql
-- Create database
CREATE DATABASE student_erp;

-- The application will automatically create tables on first run
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Health Check**: http://localhost:5001/health

## 🔐 Demo Credentials

### Admin Access
- **Username**: `admin`
- **Password**: `admin123`

### Student Access
- Register a new student account through the admissions page

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Student registration

### Student Management
- `GET /api/admissions` - Get all students (Admin only)
- `POST /api/admissions` - Create new student (Admin only)
- `GET /api/admissions/:id` - Get student by ID
- `PUT /api/admissions/:id` - Update student (Admin only)

### Fee Management
- `GET /api/fees` - Get all fee records
- `POST /api/fees` - Process fee payment
- `GET /api/fees/:id` - Get fee record by ID
- `GET /api/fees/:id/receipt` - Generate PDF receipt

### Hostel Management
- `GET /api/hostel` - Get all hostel allocations
- `POST /api/hostel` - Allocate room (Admin only)
- `GET /api/hostel/student/:studentId` - Get student's allocation
- `PUT /api/hostel/:id/deallocate` - Deallocate room (Admin only)

### Dashboard
- `GET /api/dashboard` - Get admin dashboard data
- `GET /api/dashboard/student` - Get student dashboard data

### Blockchain Verification
- `GET /api/blockchain/verify` - Verify blockchain integrity
- `GET /api/blockchain/status` - Get blockchain status
- `GET /api/blockchain/block/:hash` - Get block by hash
- `GET /api/blockchain/blocks/:type` - Get blocks by type

## 🔗 Blockchain-Lite Implementation

The system implements a lightweight blockchain for record verification:

### Features
- **SHA256 Hashing**: Each record is hashed using SHA256
- **Chain Integrity**: Blocks are linked using previous hash
- **Immutable Records**: Once added, records cannot be modified
- **Verification**: Real-time blockchain integrity checking
- **QR Codes**: Receipts include QR codes for verification

### Block Structure
```javascript
{
  index: number,
  timestamp: string,
  data: {
    type: string,
    recordId: number,
    recordHash: string
  },
  previousHash: string,
  hash: string
}
```

## 🎨 UI Components

### Reusable Components
- **FormInput**: Styled form input with validation
- **Navbar**: Role-based navigation
- **ReceiptViewer**: PDF receipt viewer with QR codes
- **Charts**: Interactive data visualization components

### Pages
- **Login**: Authentication with role selection
- **Admissions**: Student management interface
- **Fees**: Payment processing and tracking
- **Hostel**: Room allocation management
- **Dashboard**: Analytics and blockchain verification

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_erp
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## 🚀 Deployment

### Backend Deployment
1. Set up MySQL database
2. Configure environment variables
3. Install dependencies: `npm install`
4. Start server: `npm start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Or deploy to Vercel/Netlify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] Multi-tenant support
- [ ] Advanced blockchain features
- [ ] Payment gateway integration
cd..