import { EcosystemState } from '../types/ecosystem';

export const INITIAL_STATE: EcosystemState = {
  college: {
    name: "Sri Chaitanya & Narayana Junior Academy",
    code: "SCNA-HYD-01",
    city: "Vijayawada / Hyderabad Pilot Campus",
    pilotWindow: "12:30 PM – 01:45 PM (Lunch Break) & 04:15 PM – 05:30 PM (Evening Dispersal)",
    collectionPoints: [
      "Block A — Ground Floor Smart Kiosk #1",
      "Block B — Academic Wing Counter #2",
      "Boys/Girls Hostel Gate Dispensary #3"
    ]
  },
  students: [
    {
      id: "CK-2026-101",
      name: "Aarav Sharma",
      firstName: "Aarav",
      password: "PASS101",
      pin: "1234",
      institution: "Sri Chaitanya & Narayana Junior Academy",
      academicYear: "Intermediate Second Year (MPC)",
      status: "Active",
      walletBalance: 0,
      parentId: "PAR-101",
      parentName: "Rajesh Sharma",
      parentPin: "9999",
      parentPhone: "+91 98480 22334",
      notificationsPref: { sms: true, app: true, lowBalance: true }
    },
    {
      id: "CK-2026-102",
      name: "Diya Reddy",
      firstName: "Diya",
      password: "PASS102",
      pin: "5678",
      institution: "Sri Chaitanya & Narayana Junior Academy",
      academicYear: "Intermediate First Year (BiPC)",
      status: "Active",
      walletBalance: 0,
      parentId: "PAR-102",
      parentName: "Lakshmi Reddy",
      parentPin: "8888",
      parentPhone: "+91 94401 77889",
      notificationsPref: { sms: true, app: true, lowBalance: true }
    },
    {
      id: "CK-2026-103",
      name: "Rohan Verma",
      firstName: "Rohan",
      password: "PASS103",
      pin: "4321",
      institution: "Sri Chaitanya & Narayana Junior Academy",
      academicYear: "Intermediate Second Year (MPC)",
      status: "Inactive",
      walletBalance: 0,
      parentId: "PAR-103",
      parentName: "Vikram Verma",
      parentPin: "7777",
      parentPhone: "+91 91234 55667",
      notificationsPref: { sms: false, app: true, lowBalance: true }
    }
  ],
  spendingControls: {
    "CK-2026-101": {
      dailyLimitEnabled: true,
      dailyLimit: 500,
      weeklyLimitEnabled: true,
      weeklyLimit: 2000,
      monthlyLimitEnabled: true,
      monthlyLimit: 5000,
      restrictedCategories: [],
      lowBalanceAlertEnabled: true,
      lowBalanceThreshold: 200,
      instantTxnNotification: true,
      spendingAlertsEnabled: true
    },
    "CK-2026-102": {
      dailyLimitEnabled: true,
      dailyLimit: 350,
      weeklyLimitEnabled: false,
      weeklyLimit: 1500,
      monthlyLimitEnabled: true,
      monthlyLimit: 3500,
      restrictedCategories: [],
      lowBalanceAlertEnabled: true,
      lowBalanceThreshold: 150,
      instantTxnNotification: true,
      spendingAlertsEnabled: true
    },
    "CK-2026-103": {
      dailyLimitEnabled: false,
      dailyLimit: 400,
      weeklyLimitEnabled: false,
      weeklyLimit: 1500,
      monthlyLimitEnabled: false,
      monthlyLimit: 3000,
      restrictedCategories: [],
      lowBalanceAlertEnabled: true,
      lowBalanceThreshold: 100,
      instantTxnNotification: true,
      spendingAlertsEnabled: false
    }
  },
  products: [
    {
      id: "PRD-001",
      name: "Whole Wheat Paneer Tikka Wrap",
      category: "Food and Snacks",
      price: 90,
      stock: 18,
      active: true,
      featured: true,
      frequent: true,
      offerTag: "Popular Lunch",
      description: "Freshly grilled cottage cheese cubes with mint chutney and crunchy veggies in a toasted whole-wheat tortilla."
    },
    {
      id: "PRD-002",
      name: "Roasted Almond & Oats Energy Bar (Pack of 2)",
      category: "Food and Snacks",
      price: 60,
      stock: 35,
      active: true,
      featured: false,
      frequent: true,
      offerTag: "Zero Added Sugar",
      description: "High-protein study snack packed with Californian almonds, rolled oats, dark cocoa, and organic honey."
    },
    {
      id: "PRD-003",
      name: "Chilled Badam Milk & Saffron Bottle (200ml)",
      category: "Beverages",
      price: 45,
      stock: 25,
      active: true,
      featured: true,
      frequent: true,
      offerTag: "Bestseller",
      description: "Sterilized farm-fresh milk blended with crushed almonds and real Kashmir saffron strands."
    },
    {
      id: "PRD-004",
      name: "Electrolyte Tender Coconut Water (250ml)",
      category: "Beverages",
      price: 50,
      stock: 22,
      active: true,
      featured: false,
      frequent: false,
      offerTag: "Hydration+",
      description: "100% natural tender coconut water with zero preservatives for post-lecture hydration."
    },
    {
      id: "PRD-005",
      name: "Classmate Pulse Unruled Spiral Notebook (300 Pages)",
      category: "Academic Supplies",
      price: 120,
      stock: 40,
      active: true,
      featured: true,
      frequent: true,
      offerTag: "JEE/NEET Prep",
      description: "70 GSM high-opacity smooth paper ideal for physics derivations, rough problem solving, and lecture notes."
    },
    {
      id: "PRD-006",
      name: "Pentonic Gel & Ball Exam Pen Kit (Set of 5)",
      category: "Academic Supplies",
      price: 75,
      stock: 50,
      active: true,
      featured: false,
      frequent: true,
      offerTag: "Exam Ready",
      description: "Ultra-low viscosity waterproof ink pens engineered for fast writing speed in competitive examinations."
    },
    {
      id: "PRD-007",
      name: "Dettol Pocket Hand Sanitizer & Wet Wipes Combo",
      category: "Personal Care",
      price: 85,
      stock: 15,
      active: true,
      featured: false,
      frequent: false,
      offerTag: "Hygiene Essential",
      description: "Alcohol-based herbal hand sanitizer (50ml) paired with 20 antibacterial refreshing facial wipes."
    },
    {
      id: "PRD-008",
      name: "Nivea Lip Care & Travel Face Wash Pack",
      category: "Personal Care",
      price: 140,
      stock: 4,
      active: true,
      featured: false,
      frequent: false,
      offerTag: "Low Stock",
      description: "Compact hostel and day-scholar grooming kit with SPF-15 lip balm and oil-control face wash."
    },
    {
      id: "PRD-009",
      name: "Stainless Steel Insulated Campus Flask (500ml)",
      category: "Daily Essentials",
      price: 250,
      stock: 12,
      active: true,
      featured: true,
      frequent: false,
      offerTag: "15% Campus Off",
      description: "Double-wall vacuum insulated bottle keeping water cold for 18 hours or tea warm during night study hours."
    },
    {
      id: "PRD-010",
      name: "Scientific Exam Pad & Geometry Pouch Bundle",
      category: "Daily Essentials",
      price: 160,
      stock: 0,
      active: true,
      featured: false,
      frequent: false,
      offerTag: "Out of Stock",
      description: "Transparent examination clipboard with non-slip clip and heavy-duty mesh stationery pouch."
    },
    {
      id: "PRD-011",
      name: "Lab Record & Practical Sheet Printing Voucher (50 Pages)",
      category: "Other Services",
      price: 100,
      stock: 100,
      active: true,
      featured: true,
      frequent: false,
      offerTag: "Instant Redemption",
      description: "Prepaid campus reprographics voucher for B&W/color diagram printing and spiral binding at Block B."
    },
    {
      id: "PRD-012",
      name: "Hostel Laundry Express Wash & Iron Token",
      category: "Other Services",
      price: 150,
      stock: 30,
      active: true,
      featured: false,
      frequent: false,
      offerTag: "24h Turnaround",
      description: "15-garment automated wash, steam press, and neatly folded package pickup token."
    }
  ],
  orders: [],
  transactions: [],
  notifications: []
};

export const ORDER_STATUS_STEPS = [
  "Order Placed",
  "Payment Confirmed",
  "Accepted",
  "Preparing",
  "Ready for Collection",
  "Completed"
];

export const CATEGORIES = [
  "All",
  "Food and Snacks",
  "Beverages",
  "Personal Care",
  "Daily Essentials",
  "Academic Supplies",
  "Other Services"
];
