export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Retrieve token from local storage
export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Retrieve and store user info
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

// Core request wrapper
const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  // Do not set Content-Type if uploading file (browser sets it automatically with boundary for FormData)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // Keep fallback error message
    }
    throw new Error(errorMessage);
  }

  // Handle logout message or simple JSON returns
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
};

export const api = {
  // Auth endpoints
  login: async (credentials) => {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setAuthToken(data.token);
    setStoredUser(data);
    return data;
  },
  signup: async (signUpData) => {
    return await request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signUpData),
    });
  },
  logout: () => {
    setAuthToken(null);
    setStoredUser(null);
  },

  // Users endpoints
  getProfile: async () => {
    return await request('/api/users/profile');
  },
  updateProfile: async (profileData) => {
    const updated = await request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    // Update stored user details if username matches or update cache
    const current = getStoredUser();
    if (current) {
      setStoredUser({ ...current, ...updated });
    }
    return updated;
  },

  // File Uploads
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await request('/api/files/upload/profile-picture', {
      method: 'POST',
      body: formData,
    });
  },
  uploadVehicleImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await request('/api/files/upload/vehicle-image', {
      method: 'POST',
      body: formData,
    });
  },
  uploadCnicFront: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await request('/api/files/upload/cnic-front', {
      method: 'POST',
      body: formData,
    });
  },
  uploadCnicBack: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await request('/api/files/upload/cnic-back', {
      method: 'POST',
      body: formData,
    });
  },

  // Rides endpoints
  createRide: async (rideData) => {
    return await request('/api/rides', {
      method: 'POST',
      body: JSON.stringify(rideData),
    });
  },
  searchRides: async (params) => {
    const query = new URLSearchParams();
    if (params.departure) query.append('departure', params.departure);
    if (params.destination) query.append('destination', params.destination);
    if (params.seats) query.append('seats', params.seats);
    return await request(`/api/rides/search?${query.toString()}`);
  },
  getDriverRides: async () => {
    return await request('/api/rides/driver');
  },
  getRideById: async (id) => {
    return await request(`/api/rides/${id}`);
  },
  updateRide: async (id, rideData) => {
    return await request(`/api/rides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rideData),
    });
  },
  deleteRide: async (id) => {
    return await request(`/api/rides/${id}`, {
      method: 'DELETE',
    });
  },
  updateRideStatus: async (id, status) => {
    return await request(`/api/rides/${id}/status?status=${status}`, {
      method: 'POST',
    });
  },

  // Bookings endpoints
  createBooking: async (bookingData) => {
    return await request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },
  getPassengerBookings: async () => {
    return await request('/api/bookings/passenger');
  },
  getDriverBookings: async () => {
    return await request('/api/bookings/driver');
  },
  cancelBooking: async (id) => {
    return await request(`/api/bookings/${id}/cancel`, {
      method: 'POST',
    });
  },
  approveBooking: async (id) => {
    return await request(`/api/bookings/${id}/approve`, {
      method: 'POST',
    });
  },
  rejectBooking: async (id) => {
    return await request(`/api/bookings/${id}/reject`, {
      method: 'POST',
    });
  },
  verifyOtp: async (id, otp) => {
    return await request(`/api/bookings/${id}/verify-otp?otp=${otp}`, {
      method: 'POST',
    });
  },

  // Wallet endpoints
  depositFunds: async (amount) => {
    return await request(`/api/wallet/deposit?amount=${amount}`, {
      method: 'POST',
    });
  },
  getTransactionHistory: async () => {
    return await request('/api/wallet/transactions');
  },

  // Passenger Ride Request endpoints
  createPassengerRideRequest: async (requestData) => {
    return await request('/api/ride-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },
  getPassengerRideRequests: async () => {
    return await request('/api/ride-requests/passenger');
  },
  getPendingPassengerRideRequests: async () => {
    return await request('/api/ride-requests/pending');
  },
  acceptPassengerRideRequest: async (id) => {
    return await request(`/api/ride-requests/${id}/accept`, {
      method: 'POST',
    });
  },
  rejectPassengerRideRequest: async (id) => {
    return await request(`/api/ride-requests/${id}/reject`, {
      method: 'POST',
    });
  },
  cancelPassengerRideRequest: async (id) => {
    return await request(`/api/ride-requests/${id}/cancel`, {
      method: 'POST',
    });
  },

  // Admin endpoints
  adminGetUsers: async () => {
    return await request('/api/admin/users');
  },
  adminSuspendUser: async (id, suspend) => {
    return await request(`/api/admin/users/${id}/suspend?suspend=${suspend}`, {
      method: 'POST',
    });
  },
  adminGetBookings: async () => {
    return await request('/api/admin/bookings');
  },
  adminGetComplaints: async () => {
    return await request('/api/admin/complaints');
  },
  adminResolveComplaint: async (id) => {
    return await request(`/api/admin/complaints/${id}/resolve`, {
      method: 'POST',
    });
  },
  adminGetAnalytics: async () => {
    return await request('/api/admin/analytics');
  },
  adminVerifyDriver: async (id, approve) => {
    return await request(`/api/admin/drivers/${id}/verify?approve=${approve}`, {
      method: 'POST',
    });
  },

  // Complaint reporting
  fileComplaint: async (complaintData) => {
    return await request('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
  },
  getPassengerComplaints: async () => {
    return await request('/api/complaints/passenger');
  },

  // Ratings
  addRating: async (ratingData) => {
    return await request('/api/users/rate', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  },
  getRatings: async (userId) => {
    return await request(`/api/users/${userId}/ratings`);
  }
};
