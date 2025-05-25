// DOM Elements
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const loginBtn = document.querySelector('.login-btn');
const signupBtn = document.querySelector('.signup-btn');
const closeBtns = document.querySelectorAll('.close');
const searchBtn = document.querySelector('.search-btn');
const ridesList = document.getElementById('ridesList');
const offerRideForm = document.getElementById('offerRideForm');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Modal Event Listeners
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

signupBtn.addEventListener('click', () => {
    signupModal.style.display = 'block';
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        signupModal.style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.style.display = 'none';
    if (e.target === signupModal) signupModal.style.display = 'none';
});

// API Functions
const API_URL = 'http://localhost:3000/api';

async function searchRides(from, to, date) {
    try {
        if (!from || !to || !date) {
            alert('Please fill in all search fields');
            return;
        }

        const response = await fetch(`${API_URL}/rides/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`);
        if (!response.ok) {
            throw new Error('Failed to search rides');
        }
        const rides = await response.json();
        displayRides(rides);
    } catch (error) {
        console.error('Error searching rides:', error);
        alert('Error searching rides. Please try again.');
    }
}

async function offerRide(rideData) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to offer a ride');
            return;
        }

        const response = await fetch(`${API_URL}/rides`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(rideData)
        });

        if (!response.ok) {
            throw new Error('Failed to offer ride');
        }

        const result = await response.json();
        if (result.success) {
            alert('Ride offered successfully!');
            offerRideForm.reset();
            // Optionally refresh the rides list
            searchRides('', '', '');
        }
    } catch (error) {
        console.error('Error offering ride:', error);
        alert('Error offering ride. Please try again.');
    }
}

async function login(credentials) {
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            loginModal.style.display = 'none';
            updateUI();
            alert('Login successful!');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert(error.message || 'Error logging in. Please try again.');
    }
}

async function signup(userData) {
    try {
        const response = await fetch(`${API_URL}/users/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }

        if (data.success) {
            alert('Signup successful! Please login.');
            signupModal.style.display = 'none';
            loginModal.style.display = 'block';
        }
    } catch (error) {
        console.error('Error signing up:', error);
        alert(error.message || 'Error signing up. Please try again.');
    }
}

// UI Functions
function displayRides(rides) {
    ridesList.innerHTML = '';
    if (rides.length === 0) {
        ridesList.innerHTML = '<p class="no-rides">No rides found matching your criteria.</p>';
        return;
    }

    rides.forEach(ride => {
        const rideCard = document.createElement('div');
        rideCard.className = 'ride-card';
        rideCard.innerHTML = `
            <h3>${ride.startLocation} to ${ride.endLocation}</h3>
            <p>Date: ${new Date(ride.date).toLocaleDateString()}</p>
            <p>Time: ${ride.time}</p>
            <p>Available Seats: ${ride.availableSeats}</p>
            <p>Price: ₹${ride.price}</p>
            <p>Driver: ${ride.driver ? ride.driver.name : 'Unknown'}</p>
            <button onclick="bookRide('${ride._id}')" class="book-btn">Book Ride</button>
        `;
        ridesList.appendChild(rideCard);
    });
}

function updateUI() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navLinks = document.querySelector('.nav-links');
    
    if (user) {
        // Hide login/signup buttons
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        
        // Add user profile and logout buttons
        const userProfile = document.createElement('a');
        userProfile.href = '#';
        userProfile.textContent = `Welcome, ${user.name}`;
        userProfile.className = 'user-profile';
        
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.textContent = 'Logout';
        logoutBtn.className = 'logout-btn';
        logoutBtn.onclick = logout;
        
        navLinks.appendChild(userProfile);
        navLinks.appendChild(logoutBtn);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.reload();
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    searchRides(from, to, date);
});

offerRideForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(offerRideForm);
    const rideData = {
        startLocation: formData.get('from'),
        endLocation: formData.get('to'),
        date: formData.get('date'),
        time: formData.get('time'),
        availableSeats: parseInt(formData.get('seats')),
        price: parseFloat(formData.get('price'))
    };
    offerRide(rideData);
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    login(credentials);
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(signupForm);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone')
    };
    signup(userData);
});

// Add bookRide function
async function bookRide(rideId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to book a ride');
            return;
        }

        const response = await fetch(`${API_URL}/rides/${rideId}/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to book ride');
        }

        alert('Ride booked successfully!');
        // Refresh the rides list
        const from = document.getElementById('from').value;
        const to = document.getElementById('to').value;
        const date = document.getElementById('date').value;
        searchRides(from, to, date);
    } catch (error) {
        console.error('Error booking ride:', error);
        alert(error.message || 'Error booking ride. Please try again.');
    }
}

// Initialize UI
updateUI(); 