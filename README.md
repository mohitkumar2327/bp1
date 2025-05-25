# BikePool - Bike Pooling Web Application

A web application that allows users to find and share bike rides, making transportation more efficient and environmentally friendly.

## Features

- User authentication (signup/login)
- Search for available rides
- Offer rides as a driver
- Book rides as a passenger
- View ride history
- Cancel rides
- User ratings

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bike-pooling
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/bike-pooling
JWT_SECRET=your-secret-key
PORT=3000
```

4. Start MongoDB service on your machine

## Running the Application

1. Start the server:
```bash
npm start
```

2. For development with auto-reload:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### Authentication
- POST /api/users/signup - Register a new user
- POST /api/users/login - Login user
- GET /api/users/profile - Get user profile

### Rides
- POST /api/rides - Create a new ride
- GET /api/rides/search - Search for rides
- POST /api/rides/:rideId/book - Book a ride
- GET /api/rides/my-rides - Get user's rides
- POST /api/rides/:rideId/cancel - Cancel a ride

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 