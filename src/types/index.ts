export interface MeasurementProfile {
  height: number;      // in cm
  chest: number;       // in cm
  shoulders: number;   // in cm
  sleeve: number;      // in cm
  neck: number;        // in cm
  waist: number;       // in cm
  hips: number;        // in cm
  inseam: number;      // in cm
  thigh: number;       // in cm
  confidenceScore: number; // e.g. 98.4
  scanDate: string;
  unit: 'cm' | 'in';
}

export interface DigitalPassport {
  serialNumber: string;
  garmentName: string;
  productionBatch: string;
  fabricOrigin: string;
  mill: string;
  tailorWorkshop: string;
  carbonFootprintKg: number;
  waterSavedLiters: number;
  repairWarrantyYears: number;
  blockchainHash: string;
  circularStatus: 'Active Circulation' | 'Pre-Loved Verified' | 'Atelier Archival';
  transparencyScore: number;
}

export interface GarmentSizeSpec {
  size: string;
  chest: number;
  waist: number;
  shoulder: number;
  sleeve?: number;
  inseam?: number;
}

export interface Garment {
  id: string;
  name: string;
  tagline: string;
  category: 'Overcoats' | 'Trousers' | 'Knitwear' | 'Blazers & Atelier';
  price: number;
  rentalPrice: number;
  image: string;
  material: string;
  composition: string;
  fitType: 'Structured Tailored' | 'Relaxed Architectural' | 'Contemporary Slim' | 'Bespoke Contour';
  recommendedSize?: string;
  fitConfidence?: number;
  sizes: GarmentSizeSpec[];
  passport: DigitalPassport;
  description: string;
  inStock: boolean;
}

export interface PreLovedListing {
  id: string;
  garment: Garment;
  sellerName: string;
  sellerCity: string;
  size: string;
  condition: 'Pristine / Like New' | 'Gently Worn' | 'Archival Vintage';
  resalePrice: number;
  originalPrice: number;
  buyerFitScore: number;
  verifiedPassport: boolean;
  historySnippet: string;
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  image: string;
  ownershipType: 'Owned' | 'Infinite Closet Rental';
  wearCount: number;
  addedDate: string;
  rentalDueDate?: string;
}

export interface UniversalBrandFit {
  brand: string;
  tier: string;
  recommendedSize: string;
  fitVariance: string; // e.g. "Runs slightly slim in chest; 40R provides pristine drape"
  confidence: number;
}

export interface SocialChallenge {
  id: string;
  title: string;
  theme: string;
  reward: string;
  daysRemaining: number;
  entries: {
    id: string;
    userName: string;
    userHandle: string;
    outfitTitle: string;
    caption: string;
    pieces: string[];
    votes: number;
    hasVoted?: boolean;
    imageThumbnail: string;
  }[];
}

export interface SmartMirrorState {
  currentGarment: Garment;
  lightingMode: 'Daylight 5000K' | 'Evening Gallery 2700K' | 'Cocktail Lounge 2200K';
  mirrorFitFeedback: {
    zone: 'Shoulders' | 'Chest' | 'Waist' | 'Sleeves' | 'Hips';
    status: 'Optimal' | 'Snug' | 'Relaxed';
    note: string;
  }[];
}
