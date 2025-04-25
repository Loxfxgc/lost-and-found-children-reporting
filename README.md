# Lost and Found Children Reporting System

This application is structured with separate frontend and backend folders.

## Project Structure

```
lost-and-found-children-reporting/
├── frontend/             # React frontend 
│   ├── public/           # Static files
│   └── src/              # React source code
│       ├── assets/       # Images, fonts, etc.
│       ├── components/   # Reusable components
│       ├── contexts/     # React contexts
│       ├── pages/        # Page components
│       ├── services/     # API and other services
│       └── utils/        # Utility functions
├── backend/              # Express backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   └── routes/           # API routes
├── .env                  # Environment variables for both frontend and backend
└── ...
```


## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the backend server:
   ```
   npm run dev    # Development mode
   npm start      # Production mode
   ```

The backend server will start on port 5000 by default.

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm start
   ```

The frontend development server will start on port 3000 by default.

## Quick Setup Script

You can use the included `setup.sh` script to install dependencies for both frontend and backend at once:

```
chmod +x setup.sh
./setup.sh
```

## Build for Production

### Frontend Build

```
cd frontend
npm run build
```

This will create optimized production build in the `frontend/build` directory.

### Deployment

For deployment, you can serve the backend and frontend separately or configure the backend to serve the frontend build.

## Technologies Used

### Frontend
- React
- React Router
- Firebase Authentication
- Cloudinary (image storage and retrieval)

### Backend
- Express.js
- MongoDB
- Firebase Admin
- Cloudinary (image storage and retrieval)

