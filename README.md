# Sponsor to Child Bridging System

A comprehensive platform connecting sponsors with children in need, facilitating transparent and efficient support delivery.

## Features

### Sponsor Panel

- Secure authentication
- Submit sponsorship support
- Real-time notifications
- Messaging system with translation
- View sponsorship history

### Sponsee Panel

- Secure authentication
- View received support
- Upload confirmation photos
- Messaging with translation
- Notification system

### Admin Dashboard

- User management
- Transaction monitoring
- Report generation
- System configuration

## Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MySQL
- **APIs**: Google Translate API
- **Authentication**: JWT
- **Testing**: Jest + Postman

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone [repository-url]
```

2. Install dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables

```bash
# Backend (.env)
cp backend/.env.example backend/.env
# Frontend (.env)
cp frontend/.env.example frontend/.env
```

4. Start the development servers

```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm start
```

## Project Structure

```
├── frontend/               # React frontend application
├── backend/               # Node.js backend server
├── docs/                  # Documentation
└── README.md             # Project documentation
```

## Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
