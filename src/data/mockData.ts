// Mock data for the application

export const facilities = [
  {
    id: "1",
    name: "Har Ki Pauri Ghat",
    type: "temple",
    coords: [78.1642, 29.9457],
    status: "open",
    queueEstimate: "30 min",
    rating: 4.8,
    amenities: ["parking", "restroom", "food"],
    description: "Main bathing ghat for pilgrims"
  },
  {
    id: "2",
    name: "Medical Center A",
    type: "medical",
    coords: [78.1650, 29.9460],
    status: "open",
    queueEstimate: "5 min",
    rating: 4.5,
    amenities: ["emergency", "pharmacy", "restroom"],
    description: "Primary medical facility"
  },
  {
    id: "3",
    name: "Water Point B",
    type: "water",
    coords: [78.1635, 29.9450],
    status: "open",
    queueEstimate: "2 min",
    rating: 4.2,
    amenities: ["drinking_water", "restroom"],
    description: "Clean drinking water station"
  },
  {
    id: "4",
    name: "Food Court Central",
    type: "food",
    coords: [78.1655, 29.9465],
    status: "open",
    queueEstimate: "15 min",
    rating: 4.3,
    amenities: ["food", "seating", "restroom"],
    description: "Traditional vegetarian meals"
  },
  {
    id: "5",
    name: "VIP Lounge",
    type: "vip",
    coords: [78.1660, 29.9470],
    status: "restricted",
    queueEstimate: "0 min",
    rating: 4.9,
    amenities: ["parking", "ac", "wifi", "food"],
    description: "Exclusive facility for VIP guests"
  }
];

export const heatmapData = [
  { coords: [78.1642, 29.9457], density: 0.8, timestamp: Date.now() },
  { coords: [78.1650, 29.9460], density: 0.6, timestamp: Date.now() },
  { coords: [78.1635, 29.9450], density: 0.4, timestamp: Date.now() },
  { coords: [78.1655, 29.9465], density: 0.7, timestamp: Date.now() },
  { coords: [78.1660, 29.9470], density: 0.3, timestamp: Date.now() },
];

export const incidents = [
  {
    id: "1",
    type: "medical",
    status: "active",
    location: "Har Ki Pauri Ghat",
    time: "10 min ago",
    priority: "high",
    description: "Person feeling dizzy"
  },
  {
    id: "2",
    type: "crowd",
    status: "resolved",
    location: "Food Court Central",
    time: "25 min ago",
    priority: "medium",
    description: "High crowd density reported"
  },
  {
    id: "3",
    type: "lost_person",
    status: "active",
    location: "Water Point B",
    time: "45 min ago",
    priority: "high",
    description: "Child separated from family"
  }
];

export const volunteerTasks = [
  {
    id: "1",
    title: "Crowd Management at Gate 3",
    priority: "high",
    location: "Main Gate 3",
    time: "2:00 PM - 4:00 PM",
    status: "assigned"
  },
  {
    id: "2",
    title: "Medical Assistance Setup",
    priority: "medium",
    location: "Medical Center A",
    time: "4:00 PM - 6:00 PM",
    status: "pending"
  },
  {
    id: "3",
    title: "Lost & Found Desk",
    priority: "low",
    location: "Information Center",
    time: "6:00 PM - 8:00 PM",
    status: "completed"
  }
];

export const lostItems = [
  {
    id: "1",
    type: "bag",
    description: "Red backpack with white stripes",
    location: "Near Har Ki Pauri",
    status: "active",
    submittedBy: "volunteer",
    timestamp: Date.now() - 3600000,
    photos: []
  },
  {
    id: "2",
    type: "phone",
    description: "Black Samsung phone with cracked screen",
    location: "Food Court Central",
    status: "claimed",
    submittedBy: "pilgrim",
    timestamp: Date.now() - 7200000,
    photos: []
  }
];

export const announcements = [
  {
    id: "1",
    title: "Evening Aarti Timing",
    content: "Evening Aarti will begin at 6:00 PM today at Har Ki Pauri Ghat.",
    priority: "info",
    timestamp: Date.now() - 1800000
  },
  {
    id: "2",
    title: "Weather Alert",
    content: "Light rain expected this evening. Please carry umbrellas.",
    priority: "important",
    timestamp: Date.now() - 3600000
  }
];

export const vipServices = [
  {
    id: "1",
    title: "VIP Transport",
    description: "Luxury vehicle with driver",
    status: "available",
    price: "₹5000/day"
  },
  {
    id: "2",
    title: "Personal Guide",
    description: "Dedicated spiritual guide",
    status: "available", 
    price: "₹2000/day"
  },
  {
    id: "3",
    title: "Premium Accommodation",
    description: "River view luxury tents",
    status: "limited",
    price: "₹15000/night"
  }
];