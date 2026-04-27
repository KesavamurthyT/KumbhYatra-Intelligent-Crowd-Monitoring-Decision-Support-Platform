export interface Translations {
  // Common UI elements
  common: {
    skip: string;
    next: string;
    getStarted: string;
    continue: string;
    cancel: string;
    save: string;
    close: string;
    loading: string;
    error: string;
    success: string;
    yes: string;
    no: string;
    ok: string;
  };
  
  // Onboarding
  onboarding: {
    welcome: {
      title: string;
      subtitle: string;
      description: string;
      features: string[];
    };
    map: {
      title: string;
      subtitle: string;
      description: string;
      features: string[];
    };
    safety: {
      title: string;
      subtitle: string;
      description: string;
      features: string[];
    };
    language: {
      title: string;
      subtitle: string;
      description: string;
    };
  };
  
  // Navigation & Dashboard
  navigation: {
    dashboard: string;
    map: string;
    sos: string;
    tickets: string;
    transport: string;
    profile: string;
    admin: string;
    volunteer: string;
    help: string;
    logout: string;
  };
  
  // SOS & Emergency
  sos: {
    title: string;
    subtitle: string;
    medical: string;
    security: string;
    crowd: string;
    lost: string;
    other: string;
    emergency: string;
    creating: string;
    success: string;
    error: string;
    pressHoldInstruction: string;
    emergencyTypes: string;
    emergencyContacts: string;
    quickAccess: string;
    medicalEmergency: string;
    police: string;
    call: string;
    safetyTips: string;
    safetyTipsList: {
      keepPhoneCharged: string;
      stayWithGroup: string;
      knowLocation: string;
    };
    emergencyDescriptions: {
      medical: string;
      security: string;
      lost: string;
      other: string;
    };
  };
  
  // Transport
  transport: {
    booking: string;
    routes: string;
    parking: string;
    shuttle: string;
    bus: string;
    train: string;
    availability: string;
    schedule: string;
    reserve: string;
    intelligence: string;
    smartParking: string;
    parkingManagement: string;
    available: string;
    resetDemo: string;
    smartMobility: string;
    rideshare: string;
    publicTransport: string;
    emergencyTransport: string;
    realTimeInfo: string;
    journeyPlanner: string;
    journeyPlannerDesc: string;
    multiModalJourney: string;
    findTransport: string;
    browseTransportOptions: string;
    availableTransport: string;
    departureTime: string;
    all: string;
    morning: string;
    afternoon: string;
    evening: string;
    searchDestination: string;
    capacity: string;
    eta: string;
    call: string;
    full: string;
    reserveSpace: string;
    reserveParking: string;
    readyToBoard: string;
    bookSelectedTransport: string;
    smartRoutes: string;
    noTransportAvailable: string;
    contactSupport: string;
    currentBookings: string;
    bookRide: string;
    from: string;
    to: string;
    passengers: string;
    estimatedFare: string;
    estimatedTime: string;
    vehicleNumber: string;
    duration: string;
    slotPreference: string;
    totalPrice: string;
    confirmReservation: string;
    bookingConfirmed: string;
    rideConfirmed: string;
    pickupLocation: string;
    destination: string;
    contactNumber: string;
    specialInstructions: string;
    emergencyRide: string;
    yourRideBookings: string;
    pickupLocationPlaceholder: string;
    destinationPlaceholder: string;
    contactPlaceholder: string;
    instructionsPlaceholder: string;
    vehicleNumberPlaceholder: string;
    journeyFromPlaceholder: string;
    journeyToPlaceholder: string;
    status: {
      filling: string;
      boardNow: string;
      waitForNext: string;
      crowded: string;
      requested: string;
      confirmed: string;
      enRoute: string;
      completed: string;
    };
    passengerOptions: {
      one: string;
      two: string;
      three: string;
      four: string;
    };
    passengerDetails: string;
    slot: string;
    vehicle: string;
    hours: string;
    bookingConfirmedTitle: string;
    ticketSuccessfullyBooked: string;
    showQrCode: string;
    bookingId: string;
    directRoute: string;
    singleTransportMode: string;
    fastest: string;
    qrCodeAlt: string;
    fullNamePlaceholder: string;
    agePlaceholder: string;
    selectPlaceholder: string;
    selectStartingPoint: string;
    selectDestination: string;
    selectTime: string;
    selectPreference: string;
    errors: {
      fillAllFields: string;
      providePassengerDetails: string;
    };
  };
  
  // Dashboard
  dashboard: {
    welcome: string;
    devotee: string;
    quickActions: string;
    liveUpdates: string;
    nearbyFacilities: string;
    generatePass: string;
    openMap: string;
    emergencySOS: string;
    lostFound: string;
    crowdLow: string;
    weatherClear: string;
    eveningAarti: string;
    queueLow: string;
    queueMedium: string;
    queueHigh: string;
    status: {
      open: string;
      closed: string;
      full: string;
      available: string;
    };
  };
  
  // Lost & Found
  lostFound: {
    title: string;
    subtitle: string;
    reportItem: string;
    search: string;
    searchPlaceholder: string;
    noItemsFound: string;
    form: {
      itemType: string;
      description: string;
      location: string;
      contactInfo: string;
      submit: string;
      cancel: string;
      selectType: string;
      descriptionPlaceholder: string;
      locationPlaceholder: string;
      contactPlaceholder: string;
    };
    types: {
      bag: string;
      phone: string;
      jewelry: string;
      documents: string;
      clothing: string;
      electronics: string;
      other: string;
    };
    status: {
      active: string;
      claimed: string;
      returned: string;
    };
    tabs: {
      allItems: string;
      lostItems: string;
      foundItems: string;
    };
    viewDetails: string;
    lostItem: string;
    foundItem: string;
    contactSubmitter: string;
    aiMatchesFound: string;
    match: string;
    tryAdjusting: string;
    aiAnalysisText: string;
    uploadImages: string;
    messages: {
      reportSuccess: string;
      reportSuccessDesc: string;
    };
  };

  // Pass Management
  pass: {
    title: string;
    subtitle: string;
    createPass: string;
    myPasses: string;
    noPassesYet: string;
    form: {
      purpose: string;
      timeSlot: string;
      selectPurpose: string;
      selectTimeSlot: string;
      generate: string;
      cancel: string;
    };
    purposes: {
      darshan: string;
      shopping: string;
      food: string;
      accommodation: string;
      volunteer: string;
      emergency: string;
    };
    status: {
      active: string;
      expired: string;
      used: string;
    };
    actions: {
      download: string;
      share: string;
      view: string;
    };
    messages: {
      generateSuccess: string;
      generateSuccessDesc: string;
      generateError: string;
      locationRequired: string;
      noAvailability: string;
    };
  };

  // Language selection
  languages: {
    english: string;
    hindi: string;
    marathi: string;
  };
}

export const translations: Record<string, Translations> = {
  en: {
    common: {
      skip: "Skip",
      next: "Next",
      getStarted: "Get Started",
      continue: "Continue",
      cancel: "Cancel", 
      save: "Save",
      close: "Close",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      yes: "Yes",
      no: "No",
      ok: "OK"
    },
    onboarding: {
      welcome: {
        title: "Welcome to Kumbh Yatra",
        subtitle: "Your spiritual journey begins here",
        description: "Navigate crowds, find lost items, and stay safe with AI-powered guidance.",
        features: [
          "Real-time crowd monitoring",
          "Smart navigation", 
          "Emergency assistance"
        ]
      },
      map: {
        title: "Interactive Sacred Map",
        subtitle: "Navigate with divine guidance",
        description: "Find bathing ghats, temples, and facilities with crowd-aware routing.",
        features: [
          "Live crowd density",
          "Sacred site information", 
          "Accessibility routes"
        ]
      },
      safety: {
        title: "QR Pass & Safety",
        subtitle: "Secure and seamless access",
        description: "Digital passes for entry and emergency SOS at your fingertips.",
        features: [
          "Digital QR passes",
          "Emergency SOS",
          "Lost & found with AI"
        ]
      },
      language: {
        title: "Choose Your Language",
        subtitle: "Select your preferred language",
        description: "Choose the language that feels most comfortable for your journey."
      }
    },
    navigation: {
      dashboard: "Dashboard",
      map: "Map",
      sos: "Emergency",
      tickets: "Tickets",
      transport: "Transport",
      profile: "Profile", 
      admin: "Admin",
      volunteer: "Volunteer",
      help: "Help",
      logout: "Logout"
    },
    sos: {
      title: "Emergency SOS",
      subtitle: "Get immediate help",
      medical: "Medical Emergency",
      security: "Security Issue",
      crowd: "Crowd Control",
      lost: "Lost Person/Item",
      other: "Other Emergency",
      emergency: "Emergency",
      creating: "Creating SOS request...",
      success: "Emergency request sent successfully",
      error: "Failed to send emergency request",
      pressHoldInstruction: "Press & hold for 3 seconds to activate",
      emergencyTypes: "Emergency Types",
      emergencyContacts: "Emergency Contacts",
      quickAccess: "Quick access to emergency services",
      medicalEmergency: "Medical Emergency",
      police: "Police",
      call: "Call",
      safetyTips: "Safety Tips",
      safetyTipsList: {
        keepPhoneCharged: "Keep your phone charged and enable location services for faster response.",
        stayWithGroup: "Stay with your group and inform others about your location.",
        knowLocation: "Know your location – memorize nearby landmarks for quick reference."
      },
      emergencyDescriptions: {
        medical: "Health issues, injury, medical assistance needed",
        security: "Safety concerns, theft, or security assistance",
        lost: "Missing family member or getting lost",
        other: "Other urgent situations requiring immediate help"
      }
    },
    transport: {
      booking: "Transport Booking",
      routes: "Routes",
      parking: "Parking",
      shuttle: "Shuttle",
      bus: "Bus",
      train: "Train",
      availability: "Availability",
      schedule: "Schedule",
      reserve: "Reserve",
      intelligence: "Transport & Parking Intelligence",
      smartParking: "Smart Parking",
      parkingManagement: "Smart Parking Management",
      available: "Available",
      resetDemo: "Reset Demo Data",
      smartMobility: "Smart mobility solutions for Kumbh Yatra",
      rideshare: "Rideshare & Taxi",
      publicTransport: "Public Transport",
      emergencyTransport: "Emergency Transport",
      realTimeInfo: "Real-time Transport Information",
      journeyPlanner: "Journey Planner",
      journeyPlannerDesc: "Plan your multi-modal journey",
      multiModalJourney: "Plan your multi-modal journey",
      findTransport: "Find Transport",
      browseTransportOptions: "Browse available transport options",
      availableTransport: "Available Transport",
      departureTime: "Departure Time",
      all: "All",
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      searchDestination: "Search destination...",
      capacity: "Capacity",
      eta: "ETA",
      call: "Call",
      full: "Full",
      reserveSpace: "Reserve Space", 
      reserveParking: "Reserve Parking",
      readyToBoard: "Ready to Board",
      bookSelectedTransport: "Book Selected Transport",
      smartRoutes: "Smart Routes",
      noTransportAvailable: "No transport options available for your criteria",
      contactSupport: "Contact Support",
      currentBookings: "Current Bookings",
      bookRide: "Book Ride",
      from: "From",
      to: "To",
      passengers: "Passengers",
      estimatedFare: "Estimated Fare",
      estimatedTime: "Estimated Time",
      vehicleNumber: "Vehicle Number",
      duration: "Duration (hours)",
      slotPreference: "Slot Preference",
      totalPrice: "Total Price",
      confirmReservation: "Confirm Reservation",
      bookingConfirmed: "Booking Confirmed!",
      rideConfirmed: "Ride Confirmed!",
      pickupLocation: "Pickup Location",
      destination: "Destination",
      contactNumber: "Contact Number",
      specialInstructions: "Special Instructions (Optional)",
      emergencyRide: "Emergency Ride",
      yourRideBookings: "Your Ride Bookings",
      pickupLocationPlaceholder: "Where are you?",
      destinationPlaceholder: "Where to?",
      contactPlaceholder: "Your phone number",
      instructionsPlaceholder: "Any special requirements or instructions",
      vehicleNumberPlaceholder: "e.g., UP16AB1234",
      journeyFromPlaceholder: "Starting location",
      journeyToPlaceholder: "Destination",
      status: {
        filling: "Filling",
        boardNow: "Board Now",
        waitForNext: "Wait for Next",
        crowded: "Crowded",
        requested: "Requested",
        confirmed: "Confirmed",
        enRoute: "En Route",
        completed: "Completed"
      },
      passengerOptions: {
        one: "1 passenger",
        two: "2 passengers",
        three: "3 passengers",
        four: "4 passengers"
      },
      passengerDetails: "Passenger Details",
      slot: "Slot",
      vehicle: "Vehicle",
      hours: "hours",
      bookingConfirmedTitle: "✅ Booking Confirmed!",
      ticketSuccessfullyBooked: "Your ticket has been successfully booked",
      showQrCode: "Show this QR code at the boarding point",
      bookingId: "Booking ID",
      directRoute: "Direct Route (Recommended)",
      singleTransportMode: "Single transport mode",
      fastest: "Fastest",
      qrCodeAlt: "QR Code",
      fullNamePlaceholder: "Full name",
      agePlaceholder: "Age",
      selectPlaceholder: "Select",
      selectStartingPoint: "Select starting point",
      selectDestination: "Select destination",
      selectTime: "Select time",
      selectPreference: "Select preference",
      errors: {
        fillAllFields: "Please fill all required fields",
        providePassengerDetails: "Please provide details for all passengers"
      }
    },
    dashboard: {
      welcome: "Kumbh Yatra",
      devotee: "Welcome, Devotee",
      quickActions: "Quick Actions",
      liveUpdates: "Live Updates",
      nearbyFacilities: "Nearby Facilities",
      generatePass: "Generate QR Pass",
      openMap: "Open Map",
      emergencySOS: "Emergency SOS",
      lostFound: "Lost & Found",
      crowdLow: "Low crowd at Har Ki Pauri - Best time to visit!",
      weatherClear: "Clear skies, temperature 24°C",
      eveningAarti: "Evening Aarti starts at 6:30 PM",
      queueLow: "Low",
      queueMedium: "Medium",
      queueHigh: "High",
      status: {
        open: "Open",
        closed: "Closed",
        full: "Full",
        available: "Available"
      }
    },
    lostFound: {
      title: "Lost & Found",
      subtitle: "AI-powered lost and found system",
      reportItem: "Report Lost Item",
      search: "Search",
      searchPlaceholder: "Search by description, location, or type...",
      noItemsFound: "No items found matching your search",
      form: {
        itemType: "Item Type",
        description: "Description",
        location: "Location Lost",
        contactInfo: "Contact Information",
        submit: "Report Item",
        cancel: "Cancel",
        selectType: "Select item type",
        descriptionPlaceholder: "Describe the lost item in detail...",
        locationPlaceholder: "Where was it last seen?",
        contactPlaceholder: "Your contact number"
      },
      types: {
        bag: "Bag",
        phone: "Phone",
        jewelry: "Jewelry",
        documents: "Documents",
        clothing: "Clothing",
        electronics: "Electronics",
        other: "Other"
      },
      status: {
        active: "Active",
        claimed: "Claimed",
        returned: "Returned"
      },
      tabs: {
        allItems: "All Items",
        lostItems: "Lost Items",
        foundItems: "Found Items",
      },
      viewDetails: "View Details",
      lostItem: "Lost Item",
      foundItem: "Found Item",
      contactSubmitter: "Contact Submitter",
      aiMatchesFound: "AI Matches Found!",
      match: "Match",
      tryAdjusting: "Try adjusting your search terms",
      aiAnalysisText: "AI will analyze images to find potential matches",
      uploadImages: "Upload Images",
      messages: {
        reportSuccess: "Item Reported Successfully",
        reportSuccessDesc: "Your lost item has been added to our database."
      }
    },
    pass: {
      title: "Digital Pass",
      subtitle: "Generate and manage your Kumbh Yatra passes",
      createPass: "Create New Pass",
      myPasses: "My Passes",
      noPassesYet: "No passes generated yet",
      form: {
        purpose: "Purpose of Visit",
        timeSlot: "Time Slot",
        selectPurpose: "Select purpose...",
        selectTimeSlot: "Select time slot...",
        generate: "Generate Pass",
        cancel: "Cancel"
      },
      purposes: {
        darshan: "Darshan",
        shopping: "Shopping",
        food: "Food & Dining",
        accommodation: "Accommodation",
        volunteer: "Volunteer Work",
        emergency: "Emergency"
      },
      status: {
        active: "Active",
        expired: "Expired",
        used: "Used"
      },
      actions: {
        download: "Download",
        share: "Share",
        view: "View Details"
      },
      messages: {
        generateSuccess: "Pass Generated Successfully",
        generateSuccessDesc: "Your digital pass has been created.",
        generateError: "Failed to generate pass",
        locationRequired: "Location access is required",
        noAvailability: "No slots available for selected time"
      }
    },
    languages: {
      english: "English",
      hindi: "Hindi", 
      marathi: "Marathi"
    }
  },
  
  hi: {
    common: {
      skip: "छोड़ें",
      next: "आगे",
      getStarted: "शुरू करें",
      continue: "जारी रखें",
      cancel: "रद्द करें",
      save: "सहेजें",
      close: "बंद करें",
      loading: "लोड हो रहा है...",
      error: "त्रुटि",
      success: "सफलता",
      yes: "हाँ",
      no: "नहीं",
      ok: "ठीक है"
    },
    onboarding: {
      welcome: {
        title: "कुंभ यात्रा में आपका स्वागत है",
        subtitle: "आपकी आध्यात्मिक यात्रा यहाँ से शुरू होती है",
        description: "AI-संचालित मार्गदर्शन के साथ भीड़ में नेविगेट करें, खोई हुई वस्तुओं को खोजें और सुरक्षित रहें।",
        features: [
          "रियल-टाइम भीड़ निगरानी",
          "स्मार्ट नेविगेशन",
          "आपातकालीन सहायता"
        ]
      },
      map: {
        title: "इंटरैक्टिव पवित्र मानचित्र",
        subtitle: "दिव्य मार्गदर्शन के साथ नेविगेट करें",
        description: "भीड़-जागरूक रूटिंग के साथ स्नान घाट, मंदिर और सुविधाएं खोजें।",
        features: [
          "लाइव भीड़ घनत्व",
          "पवित्र स्थल जानकारी",
          "पहुंच योग्यता मार्ग"
        ]
      },
      safety: {
        title: "QR पास और सुरक्षा",
        subtitle: "सुरक्षित और निर्बाध पहुंच",
        description: "प्रवेश के लिए डिजिटल पास और आपकी उंगलियों पर आपातकालीन SOS।",
        features: [
          "डिजिटल QR पास",
          "आपातकालीन SOS",
          "AI के साथ खोया और मिला"
        ]
      },
      language: {
        title: "अपनी भाषा चुनें",
        subtitle: "अपनी पसंदीदा भाषा चुनें",
        description: "वह भाषा चुनें जो आपकी यात्रा के लिए सबसे आरामदायक लगे।"
      }
    },
    navigation: {
      dashboard: "डैशबोर्ड",
      map: "मानचित्र",
      sos: "आपातकाल",
      tickets: "टिकट",
      transport: "परिवहन",
      profile: "प्रोफाइल",
      admin: "प्रशासक",
      volunteer: "स्वयंसेवक",
      help: "सहायता",
      logout: "लॉगआउट"
    },
    sos: {
      title: "आपातकालीन SOS",
      subtitle: "तुरंत सहायता प्राप्त करें",
      medical: "चिकित्सा आपातकाल",
      security: "सुरक्षा समस्या",
      crowd: "भीड़ नियंत्रण",
      lost: "खोया व्यक्ति/वस्तु",
      other: "अन्य आपातकाल",
      emergency: "आपातकाल",
      creating: "SOS अनुरोध बनाया जा रहा है...",
      success: "आपातकालीन अनुरोध सफलतापूर्वक भेजा गया",
      error: "आपातकालीन अनुरोध भेजने में विफल",
      pressHoldInstruction: "सक्रिय करने के लिए 3 सेकंड दबाकर रखें",
      emergencyTypes: "आपातकाल के प्रकार",
      emergencyContacts: "आपातकालीन संपर्क",
      quickAccess: "आपातकालीन सेवाओं तक त्वरित पहुंच",
      medicalEmergency: "चिकित्सा आपातकाल",
      police: "पुलिस",
      call: "कॉल करें",
      safetyTips: "सुरक्षा सुझाव",
      safetyTipsList: {
        keepPhoneCharged: "अपना फोन चार्ज रखें और तेज़ प्रतिक्रिया के लिए स्थान सेवाएं सक्षम करें।",
        stayWithGroup: "अपने समूह के साथ रहें और दूसरों को अपने स्थान की जानकारी दें।",
        knowLocation: "अपना स्थान जानें - त्वरित संदर्भ के लिए नजदीकी स्थलचिह्नों को याद रखें।"
      },
      emergencyDescriptions: {
        medical: "स्वास्थ्य समस्याएं, चोट, चिकित्सा सहायता की आवश्यकता",
        security: "सुरक्षा चिंताएं, चोरी, या सुरक्षा सहायता",
        lost: "परिवार का सदस्य खो जाना या रास्ता भटकना",
        other: "तत्काल सहायता की आवश्यकता वाली अन्य आपातकालीन स्थितियां"
      }
    },
    transport: {
      booking: "परिवहन बुकिंग",
      routes: "मार्ग",
      parking: "पार्किंग",
      shuttle: "शटल",
      bus: "बस",
      train: "ट्रेन",
      availability: "उपलब्धता",
      schedule: "समय सारणी",
      reserve: "आरक्षित करें",
      intelligence: "परिवहन और पार्किंग इंटेलिजेंस",
      smartParking: "स्मार्ट पार्किंग",
      parkingManagement: "स्मार्ट पार्किंग प्रबंधन",
      available: "उपलब्ध",
      resetDemo: "डेमो डेटा रीसेट करें",
      smartMobility: "कुंभ मेले के लिए स्मार्ट मोबिलिटी समाधान",
      rideshare: "राइडशेयर और टैक्सी",
      publicTransport: "सार्वजनिक परिवहन",
      emergencyTransport: "आपातकालीन परिवहन",
      realTimeInfo: "रियल-टाइम परिवहन जानकारी",
      journeyPlanner: "यात्रा योजनाकार",
      journeyPlannerDesc: "अपनी बहु-साधन यात्रा की योजना बनाएं",
      multiModalJourney: "अपनी बहु-साधन यात्रा की योजना बनाएं",
      findTransport: "परिवहन खोजें",
      browseTransportOptions: "उपलब्ध परिवहन विकल्प देखें",
      availableTransport: "उपलब्ध परिवहन",
      departureTime: "प्रस्थान समय",
      all: "सभी",
      morning: "सुबह",
      afternoon: "दोपहर",
      evening: "शाम",
      searchDestination: "गंतव्य खोजें...",
      capacity: "क्षमता",
      eta: "अनुमानित पहुंचने का समय",
      call: "कॉल करें",
      full: "भरा हुआ",
      reserveSpace: "स्थान आरक्षित करें",
      reserveParking: "पार्किंग आरक्षित करें",
      readyToBoard: "बोर्ड करने के लिए तैयार",
      bookSelectedTransport: "चयनित परिवहन बुक करें",
      smartRoutes: "स्मार्ट रूट",
      noTransportAvailable: "आपके मानदंडों के लिए कोई परिवहन विकल्प उपलब्ध नहीं है",
      contactSupport: "सहायता से संपर्क करें",
      currentBookings: "वर्तमान बुकिंग",
      bookRide: "राइड बुक करें",
      from: "से",
      to: "तक",
      passengers: "यात्री",
      estimatedFare: "अनुमानित किराया",
      estimatedTime: "अनुमानित समय",
      vehicleNumber: "वाहन संख्या",
      duration: "अवधि (घंटे)",
      slotPreference: "स्लॉट पसंद",
      totalPrice: "कुल मूल्य",
      confirmReservation: "आरक्षण की पुष्टि करें",
      bookingConfirmed: "बुकिंग की पुष्टि!",
      rideConfirmed: "राइड की पुष्टि!",
      pickupLocation: "पिकअप स्थान",
      destination: "गंतव्य",
      contactNumber: "संपर्क नंबर",
      specialInstructions: "विशेष निर्देश (वैकल्पिक)",
      emergencyRide: "आपातकालीन राइड",
      yourRideBookings: "आपकी राइड बुकिंग",
      pickupLocationPlaceholder: "आप कहाँ हैं?",
      destinationPlaceholder: "कहाँ जाना है?",
      contactPlaceholder: "आपका फोन नंबर",
      instructionsPlaceholder: "कोई विशेष आवश्यकताएं या निर्देश",
      vehicleNumberPlaceholder: "जैसे, UP16AB1234",
      journeyFromPlaceholder: "प्रारंभिक स्थान",
      journeyToPlaceholder: "गंतव्य",
      status: {
        filling: "भर रहा है",
        boardNow: "अभी बोर्ड करें",
        waitForNext: "अगले की प्रतीक्षा करें",
        crowded: "भीड़भाड़",
        requested: "अनुरोधित",
        confirmed: "पुष्ट",
        enRoute: "रास्ते में",
        completed: "पूर्ण"
      },
      passengerOptions: {
        one: "1 यात्री",
        two: "2 यात्री",
        three: "3 यात्री",
        four: "4 यात्री"
      },
      passengerDetails: "यात्री विवरण",
      slot: "स्लॉट",
      vehicle: "वाहन",
      hours: "घंटे",
      bookingConfirmedTitle: "✅ बुकिंग पुष्ट!",
      ticketSuccessfullyBooked: "आपका टिकट सफलतापूर्वक बुक हो गया है",
      showQrCode: "बोर्डिंग पॉइंट पर यह QR कोड दिखाएं",
      bookingId: "बुकिंग ID",
      directRoute: "प्रत्यक्ष मार्ग (अनुशंसित)",
      singleTransportMode: "एकल परिवहन मोड",
      fastest: "सबसे तेज़",
      qrCodeAlt: "QR कोड",
      fullNamePlaceholder: "पूरा नाम",
      agePlaceholder: "उम्र",
      selectPlaceholder: "चुनें",
      selectStartingPoint: "प्रारंभिक स्थान चुनें",
      selectDestination: "गंतव्य चुनें",
      selectTime: "समय चुनें",
      selectPreference: "प्राथमिकता चुनें",
      errors: {
        fillAllFields: "कृपया सभी आवश्यक फ़ील्ड भरें",
        providePassengerDetails: "कृपया सभी यात्रियों के लिए विवरण प्रदान करें"
      }
    },
    dashboard: {
      welcome: "कुंभ यात्रा",
      devotee: "नमस्कार, भक्त",
      quickActions: "त्वरित कार्य",
      liveUpdates: "लाइव अपडेट",
      nearbyFacilities: "नजदीकी सुविधाएं",
      generatePass: "QR पास बनाएं",
      openMap: "मानचित्र खोलें",
      emergencySOS: "आपातकालीन SOS",
      lostFound: "खोया और मिला",
      crowdLow: "हर की पौड़ी में कम भीड़ - जाने का सबसे अच्छा समय!",
      weatherClear: "साफ आकाश, तापमान 24°C",
      eveningAarti: "शाम की आरती 6:30 बजे शुरू होती है",
      queueLow: "कम",
      queueMedium: "मध्यम",
      queueHigh: "अधिक",
      status: {
        open: "खुला",
        closed: "बंद",
        full: "भरा हुआ",
        available: "उपलब्ध"
      }
    },
    lostFound: {
      title: "खोया पाया",
      subtitle: "AI-संचालित खोया पाया प्रणाली",
      reportItem: "खोई हुई वस्तु की रिपोर्ट करें",
      search: "खोजें",
      searchPlaceholder: "विवरण, स्थान या प्रकार से खोजें...",
      noItemsFound: "आपकी खोज से मेल खाने वाली कोई वस्तु नहीं मिली",
      form: {
        itemType: "वस्तु का प्रकार",
        description: "विवरण",
        location: "खोने का स्थान",
        contactInfo: "संपर्क जानकारी",
        submit: "वस्तु की रिपोर्ट करें",
        cancel: "रद्द करें",
        selectType: "वस्तु का प्रकार चुनें",
        descriptionPlaceholder: "खोई हुई वस्तु का विस्तृत विवरण दें...",
        locationPlaceholder: "यह आखिरी बार कहाँ देखी गई थी?",
        contactPlaceholder: "आपका संपर्क नंबर"
      },
      types: {
        bag: "बैग",
        phone: "फोन",
        jewelry: "आभूषण",
        documents: "दस्तावेज़",
        clothing: "कपड़े",
        electronics: "इलेक्ट्रॉनिक्स",
        other: "अन्य"
      },
      status: {
        active: "सक्रिय",
        claimed: "दावा किया गया",
        returned: "वापस किया गया"
      },
      tabs: {
        allItems: "सभी वस्तुएं",
        lostItems: "खोई हुई वस्तुएं",
        foundItems: "मिली हुई वस्तुएं",
      },
      viewDetails: "विवरण देखें",
      lostItem: "खोई हुई वस्तु",
      foundItem: "मिली हुई वस्तु",
      contactSubmitter: "प्रस्तुतकर्ता से संपर्क करें",
      aiMatchesFound: "AI मैच मिले!",
      match: "मैच",
      tryAdjusting: "अपने खोज शब्दों को समायोजित करने का प्रयास करें",
      aiAnalysisText: "AI संभावित मैच खोजने के लिए छवियों का विश्लेषण करेगा",
      uploadImages: "छवियां अपलोड करें",
      messages: {
        reportSuccess: "वस्तु की रिपोर्ट सफलतापूर्वक दर्ज की गई",
        reportSuccessDesc: "आपकी खोई हुई वस्तु हमारे डेटाबेस में जोड़ दी गई है।"
      }
    },
    pass: {
      title: "डिजिटल पास",
      subtitle: "अपने कुंभ मेला पास बनाएं और प्रबंधित करें",
      createPass: "नया पास बनाएं",
      myPasses: "मेरे पास",
      noPassesYet: "अभी तक कोई पास नहीं बना",
      form: {
        purpose: "यात्रा का उद्देश्य",
        timeSlot: "समय स्लॉट",
        selectPurpose: "उद्देश्य चुनें...",
        selectTimeSlot: "समय स्लॉट चुनें...",
        generate: "पास बनाएं",
        cancel: "रद्द करें"
      },
      purposes: {
        darshan: "दर्शन",
        shopping: "खरीदारी",
        food: "भोजन एवं भोजनालय",
        accommodation: "आवास",
        volunteer: "स्वयंसेवी कार्य",
        emergency: "आपातकाल"
      },
      status: {
        active: "सक्रिय",
        expired: "समाप्त",
        used: "उपयोग किया गया"
      },
      actions: {
        download: "डाउनलोड करें",
        share: "साझा करें",
        view: "विवरण देखें"
      },
      messages: {
        generateSuccess: "पास सफलतापूर्वक बनाया गया",
        generateSuccessDesc: "आपका डिजिटल पास तैयार हो गया है।",
        generateError: "पास बनाने में विफल",
        locationRequired: "स्थान की पहुंच आवश्यक है",
        noAvailability: "चुने गए समय के लिए कोई स्लॉट उपलब्ध नहीं"
      }
    },
    languages: {
      english: "अंग्रेजी",
      hindi: "हिंदी",
      marathi: "मराठी"
    }
  },
  
  mr: {
    common: {
      skip: "वगळा",
      next: "पुढे",
      getStarted: "सुरू करा",
      continue: "सुरू ठेवा",
      cancel: "रद्द करा",
      save: "सेव्ह करा",
      close: "बंद करा",
      loading: "लोड होत आहे...",
      error: "त्रुटी",
      success: "यश",
      yes: "होय",
      no: "नाही",
      ok: "ठीक आहे"
    },
    onboarding: {
      welcome: {
        title: "कुंभ यात्रेत आपले स्वागत आहे",
        subtitle: "आपला आध्यात्मिक प्रवास येथे सुरू होतो",
        description: "AI-चालित मार्गदर्शनासह गर्दीमध्ये नेव्हिगेट करा, हरवलेल्या वस्तू शोधा आणि सुरक्षित रहा।",
        features: [
          "रिअल-टाइम गर्दी निरीक्षण",
          "स्मार्ट नेव्हिगेशन",
          "आपत्कालीन सहाय्य"
        ]
      },
      map: {
        title: "परस्परसंवादी पवित्र नकाशा",
        subtitle: "दिव्य मार्गदर्शनासह नेव्हिगेट करा",
        description: "गर्दी-जागरूक रूटिंगसह स्नान घाट, मंदिरे आणि सुविधा शोधा।",
        features: [
          "लाइव्ह गर्दी घनता",
          "पवित्र स्थळाची माहिती",
          "प्रवेशयोग्यता मार्ग"
        ]
      },
      safety: {
        title: "QR पास आणि सुरक्षा",
        subtitle: "सुरक्षित आणि निर्बाध प्रवेश",
        description: "प्रवेशासाठी डिजिटल पास आणि आपल्या बोटांच्या टोकावर आपत्कालीन SOS।",
        features: [
          "डिजिटल QR पास",
          "आपत्कालीन SOS",
          "AI सह हरवले आणि सापडले"
        ]
      },
      language: {
        title: "आपली भाषा निवडा",
        subtitle: "आपली पसंतीची भाषा निवडा",
        description: "आपल्या प्रवासासाठी सर्वात आरामदायक वाटणारी भाषा निवडा।"
      }
    },
    navigation: {
      dashboard: "डॅशबोर्ड",
      map: "नकाशा",
      sos: "आपत्कालीन",
      tickets: "तिकिटे",
      transport: "वाहतूक",
      profile: "प्रोफाइल",
      admin: "प्रशासक",
      volunteer: "स्वयंसेवक",
      help: "मदत",
      logout: "लॉगआउट"
    },
    sos: {
      title: "आपत्कालीन SOS",
      subtitle: "त्वरित मदत मिळवा",
      medical: "वैद्यकीय आपत्काल",
      security: "सुरक्षा समस्या",
      crowd: "गर्दी नियंत्रण",
      lost: "हरवलेली व्यक्ती/वस्तू",
      other: "इतर आपत्काल",
      emergency: "आपत्काल",
      creating: "SOS विनंती तयार करत आहे...",
      success: "आपत्कालीन विनंती यशस्वीरित्या पाठवली",
      error: "आपत्कालीन विनंती पाठवण्यात अयशस्वी",
      pressHoldInstruction: "सक्रिय करण्यासाठी 3 सेकंद दाबून ठेवा",
      emergencyTypes: "आपत्कालीन प्रकार",
      emergencyContacts: "आपत्कालीन संपर्क",
      quickAccess: "आपत्कालीन सेवांमध्ये त्वरित प्रवेश",
      medicalEmergency: "वैद्यकीय आपत्काल",
      police: "पोलिस",
      call: "कॉल करा",
      safetyTips: "सुरक्षा टिपा",
      safetyTipsList: {
        keepPhoneCharged: "तुमचा फोन चार्ज ठेवा आणि जलद प्रतिसादासाठी स्थान सेवा सक्षम करा।",
        stayWithGroup: "तुमच्या गटासोबत राहा आणि इतरांना तुमच्या स्थानाची माहिती द्या।",
        knowLocation: "तुमचे स्थान जाणून घ्या - त्वरित संदर्भासाठी जवळपासची खुणा लक्षात ठेवा।"
      },
      emergencyDescriptions: {
        medical: "आरोग्य समस्या, जखम, वैद्यकीय मदतीची गरज",
        security: "सुरक्षा चिंता, चोरी, किंवा सुरक्षा मदत",
        lost: "कुटुंबातील सदस्य हरवणे किंवा मार्ग चुकणे",
        other: "त्वरित मदतीची आवश्यकता असलेल्या इतर आपत्कालीन परिस्थिती"
      }
    },
    transport: {
      booking: "वाहतूक बुकिंग",
      routes: "मार्ग",
      parking: "पार्किंग",
      shuttle: "शटल",
      bus: "बस",
      train: "ट्रेन",
      availability: "उपलब्धता",
      schedule: "वेळापत्रक",
      reserve: "आरक्षित करा",
      intelligence: "वाहतूक आणि पार्किंग इंटेलिजन्स",
      smartParking: "स्मार्ट पार्किंग",
      parkingManagement: "स्मार्ट पार्किंग व्यवस्थापन",
      available: "उपलब्ध",
      resetDemo: "डेमो डेटा रीसेट करा",
      smartMobility: "कुंभ मेळ्यासाठी स्मार्ट मोबिलिटी सोल्यूशन्स",
      rideshare: "राइडशेअर आणि टॅक्सी",
      publicTransport: "सार्वजनिक वाहतूक",
      emergencyTransport: "आपत्कालीन वाहतूक",
      realTimeInfo: "रिअल-टाइम वाहतूक माहिती",
      journeyPlanner: "प्रवास नियोजक",
      journeyPlannerDesc: "तुमच्या मल्टी-मोडल प्रवासाची योजना करा",
      multiModalJourney: "तुमच्या मल्टी-मोडल प्रवासाची योजना करा",
      findTransport: "वाहतूक शोधा",
      browseTransportOptions: "उपलब्ध वाहतूक पर्याय पहा",
      availableTransport: "उपलब्ध वाहतूक",
      departureTime: "प्रस्थान वेळ",
      all: "सर्व",
      morning: "सकाळ",
      afternoon: "दुपार",
      evening: "संध्याकाळ",
      searchDestination: "गंतव्य शोधा...",
      capacity: "क्षमता",
      eta: "अंदाजित पोहोचण्याची वेळ",
      call: "कॉल करा",
      full: "भरलेले",
      reserveSpace: "जागा राखीव करा",
      reserveParking: "पार्किंग राखीव करा",
      readyToBoard: "चढण्यासाठी तयार",
      bookSelectedTransport: "निवडलेले वाहतूक बुक करा",
      smartRoutes: "स्मार्ट रूट",
      noTransportAvailable: "तुमच्या निकषांसाठी कोणते वाहतूक पर्याय उपलब्ध नाहीत",
      contactSupport: "सहाय्यकेशी संपर्क करा",
      currentBookings: "सध्याच्या बुकिंग्ज",
      bookRide: "राइड बुक करा",
      from: "पासून",
      to: "पर्यंत",
      passengers: "प्रवासी",
      estimatedFare: "अंदाजित भाडे",
      estimatedTime: "अंदाजित वेळ",
      vehicleNumber: "वाहन क्रमांक",
      duration: "कालावधी (तास)",
      slotPreference: "स्लॉट प्राधान्य",
      totalPrice: "एकूण किंमत",
      confirmReservation: "आरक्षणाची पुष्टी करा",
      bookingConfirmed: "बुकिंग पुष्ट!",
      rideConfirmed: "राइड पुष्ट!",
      pickupLocation: "पिकअप स्थान",
      destination: "गंतव्य",
      contactNumber: "संपर्क नंबर",
      specialInstructions: "विशेष सूचना (पर्यायी)",
      emergencyRide: "आपत्कालीन राइड",
      yourRideBookings: "तुमच्या राइड बुकिंग्ज",
      pickupLocationPlaceholder: "तुम्ही कुठे आहात?",
      destinationPlaceholder: "कुठे जायचे आहे?",
      contactPlaceholder: "तुमचा फोन नंबर",
      instructionsPlaceholder: "काही विशेष आवश्यकता किंवा सूचना",
      vehicleNumberPlaceholder: "उदा., MH12AB1234",
      journeyFromPlaceholder: "प्रारंभिक स्थान",
      journeyToPlaceholder: "गंतव्य",
      status: {
        filling: "भरत आहे",
        boardNow: "आता बोर्ड करा",
        waitForNext: "पुढच्याची प्रतीक्षा करा",
        crowded: "गर्दी",
        requested: "विनंती केली",
        confirmed: "पुष्ट",
        enRoute: "मार्गावर",
        completed: "पूर्ण"
      },
      passengerOptions: {
        one: "1 प्रवासी",
        two: "2 प्रवासी",
        three: "3 प्रवासी",
        four: "4 प्रवासी"
      },
      passengerDetails: "प्रवासी तपशील",
      slot: "स्लॉट",
      vehicle: "वाहन",
      hours: "तास",
      bookingConfirmedTitle: "✅ बुकिंग पुष्ट!",
      ticketSuccessfullyBooked: "तुमचे तिकीट यशस्वीरित्या बुक झाले आहे",
      showQrCode: "बोर्डिंग पॉइंटवर हा QR कोड दाखवा",
      bookingId: "बुकिंग ID",
      directRoute: "थेट मार्ग (शिफारसीत)",
      singleTransportMode: "एकल वाहतूक मोड",
      fastest: "सर्वात वेगवान",
      qrCodeAlt: "QR कोड",
      fullNamePlaceholder: "पूर्ण नाव",
      agePlaceholder: "वय",
      selectPlaceholder: "निवडा",
      selectStartingPoint: "प्रारंभिक स्थान निवडा",
      selectDestination: "गंतव्य निवडा",
      selectTime: "वेळ निवडा",
      selectPreference: "प्राधान्य निवडा",
      errors: {
        fillAllFields: "कृपया सर्व आवश्यक फील्ड भरा",
        providePassengerDetails: "कृपया सर्व प्रवाशांसाठी तपशील प्रदान करा"
      }
    },
    dashboard: {
      welcome: "कुंभ यात्रा",
      devotee: "नमस्कार, भक्त",
      quickActions: "त्वरित कृती",
      liveUpdates: "लाइव्ह अपडेट्स",
      nearbyFacilities: "जवळच्या सुविधा",
      generatePass: "QR पास तयार करा",
      openMap: "नकाशा उघडा",
      emergencySOS: "आपत्कालीन SOS",
      lostFound: "हरवले आणि सापडले",
      crowdLow: "हर की पौड़ी येथे कमी गर्दी - भेट देण्याची सर्वोत्तम वेळ!",
      weatherClear: "स्वच्छ आकाश, तापमान 24°C",
      eveningAarti: "संध्याकाळची आरती 6:30 वाजता सुरू होते",
      queueLow: "कमी",
      queueMedium: "मध्यम",
      queueHigh: "जास्त",
      status: {
        open: "उघडे",
        closed: "बंद",
        full: "भरले",
        available: "उपलब्ध"
      }
    },
    lostFound: {
      title: "हरवलेल्या वस्तू",
      subtitle: "AI-चालित हरवलेल्या वस्तूंची प्रणाली",
      reportItem: "हरवलेली वस्तू नोंदवा",
      search: "शोधा",
      searchPlaceholder: "वर्णन, ठिकाण किंवा प्रकारानुसार शोधा...",
      noItemsFound: "तुमच्या शोधाशी जुळणाऱ्या वस्तू आढळल्या नाहीत",
      form: {
        itemType: "वस्तूचा प्रकार",
        description: "वर्णन",
        location: "हरवण्याचे ठिकाण",
        contactInfo: "संपर्क माहिती",
        submit: "वस्तू नोंदवा",
        cancel: "रद्द करा",
        selectType: "वस्तूचा प्रकार निवडा",
        descriptionPlaceholder: "हरवलेल्या वस्तूचे तपशीलवार वर्णन द्या...",
        locationPlaceholder: "ती शेवटच्या वेळी कुठे दिसली होती?",
        contactPlaceholder: "तुमचा संपर्क नंबर"
      },
      types: {
        bag: "पिशवी",
        phone: "फोन",
        jewelry: "दागिने",
        documents: "कागदपत्रे",
        clothing: "कपडे",
        electronics: "इलेक्ट्रॉनिक्स",
        other: "इतर"
      },
      status: {
        active: "सक्रिय",
        claimed: "दावा केला",
        returned: "परत केले"
      },
      tabs: {
        allItems: "सर्व वस्तू",
        lostItems: "हरवलेल्या वस्तू",
        foundItems: "सापडलेल्या वस्तू",
      },
      viewDetails: "तपशील पहा",
      lostItem: "हरवलेली वस्तू",
      foundItem: "सापडलेली वस्तू",
      contactSubmitter: "सबमिटरशी संपर्क करा",
      aiMatchesFound: "AI जुळणी सापडली!",
      match: "जुळणी",
      tryAdjusting: "तुमचे शोध शब्द समायोजित करण्याचा प्रयत्न करा",
      aiAnalysisText: "AI संभाव्य जुळणी शोधण्यासाठी प्रतिमांचे विश्लेषण करेल",
      uploadImages: "प्रतिमा अपलोड करा",
      messages: {
        reportSuccess: "वस्तू यशस्वीरित्या नोंदवली गेली",
        reportSuccessDesc: "तुमची हरवलेली वस्तू आमच्या डेटाबेसमध्ये जोडली गेली आहे."
      }
    },
    pass: {
      title: "डिजिटल पास",
      subtitle: "तुमचे कुंभ मेळा पास तयार करा आणि व्यवस्थापित करा",
      createPass: "नवीन पास तयार करा",
      myPasses: "माझे पास",
      noPassesYet: "अजून कोणतेही पास तयार केले नाहीत",
      form: {
        purpose: "भेटीचा उद्देश",
        timeSlot: "वेळेचा स्लॉट",
        selectPurpose: "उद्देश निवडा...",
        selectTimeSlot: "वेळेचा स्लॉट निवडा...",
        generate: "पास तयार करा",
        cancel: "रद्द करा"
      },
      purposes: {
        darshan: "दर्शन",
        shopping: "खरेदी",
        food: "जेवण आणि भोजनालय",
        accommodation: "निवास",
        volunteer: "स्वयंसेवक कार्य",
        emergency: "आणीबाणी"
      },
      status: {
        active: "सक्रिय",
        expired: "संपले",
        used: "वापरले"
      },
      actions: {
        download: "डाउनलोड करा",
        share: "शेअर करा",
        view: "तपशील पहा"
      },
      messages: {
        generateSuccess: "पास यशस्वीरित्या तयार केला गेला",
        generateSuccessDesc: "तुमचा डिजिटल पास तयार झाला आहे.",
        generateError: "पास तयार करण्यात अयशस्वी",
        locationRequired: "स्थान प्रवेश आवश्यक आहे",
        noAvailability: "निवडलेल्या वेळेसाठी कोणतेही स्लॉट उपलब्ध नाहीत"
      }
    },
    languages: {
      english: "इंग्रजी",
      hindi: "हिंदी",
      marathi: "मराठी"
    }
  }
};
