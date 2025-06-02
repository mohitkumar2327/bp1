const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Ride = require('../models/Ride');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            throw new Error();
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// Create a new ride
router.post('/', auth, async (req, res) => {
    try {
        const { startLocation, endLocation, date, time, availableSeats, price } = req.body;

        const ride = new Ride({
            driver: req.user._id,
            startLocation,
            endLocation,
            date,
            time,
            availableSeats,
            price
        });

        await ride.save();
        res.status(201).json({ success: true, ride });
    } catch (error) {
        console.error('Create ride error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search rides
router.get('/search', async (req, res) => {
    try {
        const { from, to, date } = req.query;
        
        const rides = await Ride.find({
            startLocation: { $regex: from, $options: 'i' },
            endLocation: { $regex: to, $options: 'i' },
            date: new Date(date),
            status: 'scheduled'
        }).populate('driver', 'name rating');

        res.json(rides);
    } catch (error) {
        console.error('Search rides error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Book a ride
router.post('/:rideId/book', auth, async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.rideId);
        
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.driver.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot book your own ride' });
        }

        if (ride.availableSeats <= 0) {
            return res.status(400).json({ message: 'No seats available' });
        }

        if (ride.passengers.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already booked this ride' });
        }

        ride.passengers.push(req.user._id);
        ride.availableSeats -= 1;
        await ride.save();

        res.json({ success: true, message: 'your ride has been booked' });
    } catch (error) {
        console.error('Book ride error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's rides (both as driver and passenger)
router.get('/my-rides', auth, async (req, res) => {
    try {
        const ridesAsDriver = await Ride.find({ driver: req.user._id })
            .populate('passengers', 'name');
        
        const ridesAsPassenger = await Ride.find({ passengers: req.user._id })
            .populate('driver', 'name rating');

        res.json({
            asDriver: ridesAsDriver,
            asPassenger: ridesAsPassenger
        });
    } catch (error) {
        console.error('Get my rides error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel a ride
router.post('/:rideId/cancel', auth, async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.rideId);
        
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.driver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this ride' });
        }

        ride.status = 'cancelled';
        await ride.save();

        res.json({ success: true, message: 'Ride cancelled successfully' });
    } catch (error) {
        console.error('Cancel ride error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 