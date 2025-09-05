#!/bin/bash

echo "🚀 Setting up Student ERP System with Blockchain-Lite Verification"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL is not installed. Please install MySQL first."
    print_warning "You can install MySQL using: brew install mysql (macOS) or apt-get install mysql-server (Ubuntu)"
fi

print_status "Node.js version: $(node --version)"
print_status "NPM version: $(npm --version)"

# Setup Backend
print_status "Setting up backend..."
cd backend

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file for backend..."
    cp config.env .env
    print_warning "Please update the .env file with your database credentials"
fi

cd ..

# Setup Frontend
print_status "Setting up frontend..."
cd frontend

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    print_status "Creating .env.local file for frontend..."
    cp env.example .env.local
    print_success "Frontend environment file created"
fi

cd ..

print_success "Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Update backend/.env with your MySQL credentials"
echo "2. Start MySQL service"
echo "3. Run the backend: cd backend && npm run dev"
echo "4. Run the frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Access URLs:"
echo "==============="
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo ""
echo "🔐 Demo Credentials:"
echo "==================="
echo "Admin: username=admin, password=admin123"
echo "Student: Register a new account"
echo ""
echo "📚 Documentation:"
echo "================="
echo "See README.md for detailed setup instructions"
