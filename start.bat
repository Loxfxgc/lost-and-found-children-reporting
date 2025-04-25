@echo off
echo Starting backend and frontend servers...

start cmd /k "cd backend && npm install && npm run dev"
start cmd /k "cd frontend && npm install && npm start"

echo Servers are starting. Please wait a moment...
echo Backend will be available at http://localhost:5000/api
echo Frontend will be available at http://localhost:3000 