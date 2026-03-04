# Property Management Guide

This guide covers managing real estate property listings and customer inquiries using the WIIL Platform JS SDK.

## Quick Start

```typescript
import { WiilClient, PropertyType, PropertySubType, ListingType, ListingStatus } from 'wiil-js';

const client = new WiilClient({
  apiKey: 'your-api-key',
});

// Create a property category
const category = await client.propertyConfig.createCategory({
  organizationId: 'org_123',
  name: 'Luxury Homes',
  propertyType: PropertyType.RESIDENTIAL,
  isDefault: false,
});

// Create a property address
const address = await client.propertyConfig.createAddress({
  organizationId: 'org_123',
  street: '123 Ocean View Drive',
  city: 'Miami',
  state: 'FL',
  postalCode: '33139',
  country: 'USA',
  isVerified: false,
});

// Create a property listing
const property = await client.propertyConfig.create({
  organizationId: 'org_123',
  categoryId: category.id,
  addressId: address.id,
  title: 'Stunning Oceanfront Villa',
  description: 'Luxury 5-bedroom villa with panoramic ocean views',
  propertyType: PropertyType.RESIDENTIAL,
  propertySubType: PropertySubType.VILLA,
  listingType: ListingType.SALE,
  listingStatus: ListingStatus.ACTIVE,
  salePrice: 2500000,
  salePriceCurrency: 'USD',
  features: {
    bedrooms: 5,
    bathrooms: 4.5,
    squareFootage: 4500,
    amenities: ['Pool', 'Ocean view', 'Smart home'],
  },
  isActive: true,
});

console.log('Property created:', property.id);
```

---

## Property Categories

Property categories organize listings by type (e.g., Luxury Homes, Commercial Offices).

### Property Types

```typescript
enum PropertyType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  LAND = 'land'
}
```

### Category Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| organizationId | string | Yes | Business account ID |
| name | string | Yes | Category name |
| description | string | No | Category description |
| propertyType | string | Yes | Type: 'residential', 'commercial', 'land' |
| displayOrder | number | No | Display order in listings |
| isDefault | boolean | No | Default category (default: false) |

### Create Category

```typescript
const category = await client.propertyConfig.createCategory({
  organizationId: 'org_123',
  name: 'Waterfront Properties',
  description: 'Properties with water access or views',
  propertyType: PropertyType.RESIDENTIAL,
  displayOrder: 1,
  isDefault: false,
});

console.log('Category created:', category.id);
```

### Get Category

```typescript
const category = await client.propertyConfig.getCategory('cat_123');

console.log('Category:', category.name);
console.log('Type:', category.propertyType);
```

### List Categories

```typescript
const result = await client.propertyConfig.listCategories({
  page: 1,
  pageSize: 20,
});

console.log('Categories:', result.data.length);
result.data.forEach(cat => {
  console.log('-', cat.name, `(${cat.propertyType})`);
});
```

### Update Category

```typescript
const updated = await client.propertyConfig.updateCategory({
  id: 'cat_123',
  name: 'Premium Waterfront Properties',
  displayOrder: 0,
});

console.log('Updated:', updated.name);
```

### Delete Category

```typescript
const deleted = await client.propertyConfig.deleteCategory('cat_123');

console.log('Deleted:', deleted);
```

---

## Property Addresses

Property addresses are standalone entities that can be verified and associated with properties.

### Address Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| organizationId | string | Yes | Business account ID |
| street | string | Yes | Street address |
| unit | string | No | Unit or apartment number |
| city | string | Yes | City name |
| state | string | Yes | State or province |
| postalCode | string | No | Postal or ZIP code |
| country | string | Yes | Country |
| coordinates | object | No | { latitude, longitude } |
| neighborhood | string | No | Neighborhood or district name |
| district | string | No | Administrative district |
| isVerified | boolean | No | Address verified (default: false) |
| primaryUserAccountId | string | No | User account managing the property |

### Create Address

```typescript
const address = await client.propertyConfig.createAddress({
  organizationId: 'org_123',
  street: '456 Park Avenue',
  unit: 'PH-1',
  city: 'New York',
  state: 'NY',
  postalCode: '10022',
  country: 'USA',
  neighborhood: 'Midtown East',
  coordinates: {
    latitude: 40.7614,
    longitude: -73.9705,
  },
  isVerified: false,
});

console.log('Address created:', address.id);
```

### Get Address

```typescript
const address = await client.propertyConfig.getAddress('addr_123');

console.log('Street:', address.street);
console.log('City:', address.city);
console.log('Verified:', address.isVerified);
```

### List Addresses

```typescript
const result = await client.propertyConfig.listAddresses({
  page: 1,
  pageSize: 20,
});

console.log('Addresses:', result.data.length);
result.data.forEach(addr => {
  console.log('-', addr.street, addr.city, addr.state);
});
```

### Update Address

```typescript
const updated = await client.propertyConfig.updateAddress({
  id: 'addr_123',
  unit: 'Suite 100',
  neighborhood: 'Financial District',
});

console.log('Updated:', updated.street, updated.unit);
```

### Verify Address

```typescript
const verified = await client.propertyConfig.verifyAddress('addr_123');

console.log('Verified:', verified.isVerified);
console.log('Verified at:', verified.verifiedAt);
```

### Delete Address

```typescript
const deleted = await client.propertyConfig.deleteAddress('addr_123');

console.log('Deleted:', deleted);
```

---

## Properties

Properties represent real estate listings with full details including features, pricing, and media.

### Property Sub-Types

```typescript
enum PropertySubType {
  // Residential
  HOUSE = 'house',
  APARTMENT = 'apartment',
  CONDO = 'condo',
  TOWNHOUSE = 'townhouse',
  VILLA = 'villa',
  // Commercial
  OFFICE = 'office',
  RETAIL = 'retail',
  WAREHOUSE = 'warehouse',
  INDUSTRIAL = 'industrial',
  // Land
  LOT = 'lot',
  FARM = 'farm',
  ACREAGE = 'acreage'
}
```

### Listing Types

```typescript
enum ListingType {
  SALE = 'sale',
  RENT = 'rent',
  BOTH = 'both'
}
```

### Listing Status

```typescript
enum ListingStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  UNDER_OFFER = 'under_offer',
  SOLD = 'sold',
  LEASED = 'leased',
  WITHDRAWN = 'withdrawn'
}
```

### Property Condition

```typescript
enum PropertyCondition {
  NEW = 'new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  NEEDS_WORK = 'needs_work'
}
```

### Rental Period

```typescript
enum RentalPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}
```

### Property Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| organizationId | string | Yes | Business account ID |
| categoryId | string | Yes | Category ID |
| addressId | string | Yes | Address ID |
| title | string | Yes | Listing title |
| description | string | No | Detailed description |
| propertyType | string | Yes | Type: 'residential', 'commercial', 'land' |
| propertySubType | string | Yes | Subtype (house, apartment, etc.) |
| listingType | string | Yes | Listing type: 'sale', 'rent', 'both' |
| listingStatus | string | No | Status (default: 'draft') |
| salePrice | number | No | Sale price |
| salePriceCurrency | string | No | Currency (default: 'USD') |
| rentalPrice | number | No | Rental price |
| rentalPeriod | string | No | Rental period |
| rentalPriceCurrency | string | No | Currency (default: 'USD') |
| priceNegotiable | boolean | No | Negotiable (default: false) |
| features | object | No | Property features (see below) |
| condition | string | No | Condition |
| furnished | boolean | No | Furnished (default: false) |
| images | string[] | No | Image URLs |
| virtualTourUrl | string | No | Virtual tour URL |
| videoUrl | string | No | Video URL |
| availableFrom | number | No | Available from (timestamp) |
| availableTo | number | No | Available until (timestamp) |
| isActive | boolean | No | Active (default: true) |
| isFeatured | boolean | No | Featured (default: false) |
| isVerified | boolean | No | Verified (default: false) |
| externalId | string | No | External system ID |
| mlsNumber | string | No | MLS listing number |

### Property Features Schema

| Field | Type | Description |
|-------|------|-------------|
| bedrooms | number | Number of bedrooms |
| bathrooms | number | Number of bathrooms |
| parkingSpaces | number | Parking spaces |
| squareFootage | number | Total square footage |
| lotSize | number | Lot size |
| lotSizeUnit | string | Unit: 'sqft', 'acres', 'sqm', 'hectares' |
| yearBuilt | number | Year built |
| floors | number | Number of floors |
| amenities | string[] | List of amenities |
| utilities | string[] | Available utilities |

### Create Property for Sale

```typescript
const property = await client.propertyConfig.create({
  organizationId: 'org_123',
  categoryId: 'cat_luxury',
  addressId: 'addr_123',
  title: 'Modern Downtown Condo',
  description: 'Sleek 2BR condo with city skyline views',
  propertyType: PropertyType.RESIDENTIAL,
  propertySubType: PropertySubType.CONDO,
  listingType: ListingType.SALE,
  listingStatus: ListingStatus.ACTIVE,
  salePrice: 750000,
  salePriceCurrency: 'USD',
  priceNegotiable: true,
  features: {
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 1,
    squareFootage: 1200,
    yearBuilt: 2022,
    floors: 1,
    amenities: ['Gym', 'Pool', 'Concierge', 'Rooftop deck'],
    utilities: ['Electric', 'Gas', 'Water', 'Internet'],
  },
  condition: PropertyCondition.NEW,
  furnished: false,
  images: [
    'https://example.com/images/living-room.jpg',
    'https://example.com/images/bedroom.jpg',
  ],
  isActive: true,
  isFeatured: true,
});

console.log('Property created:', property.id);
```

### Create Property for Rent

```typescript
const rental = await client.propertyConfig.create({
  organizationId: 'org_123',
  categoryId: 'cat_apartments',
  addressId: 'addr_456',
  title: 'Cozy Studio Apartment',
  description: 'Charming studio in historic building',
  propertyType: PropertyType.RESIDENTIAL,
  propertySubType: PropertySubType.APARTMENT,
  listingType: ListingType.RENT,
  listingStatus: ListingStatus.ACTIVE,
  rentalPrice: 1800,
  rentalPeriod: RentalPeriod.MONTHLY,
  rentalPriceCurrency: 'USD',
  features: {
    bedrooms: 0,
    bathrooms: 1,
    squareFootage: 450,
    yearBuilt: 1920,
    amenities: ['Laundry in building', 'Pet friendly'],
    utilities: ['Electric', 'Water'],
  },
  condition: PropertyCondition.GOOD,
  furnished: true,
  availableFrom: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week from now
  isActive: true,
});

console.log('Rental created:', rental.id);
```

### Create Commercial Property

```typescript
const commercial = await client.propertyConfig.create({
  organizationId: 'org_123',
  categoryId: 'cat_commercial',
  addressId: 'addr_789',
  title: 'Prime Retail Space',
  description: 'High-traffic retail location on Main Street',
  propertyType: PropertyType.COMMERCIAL,
  propertySubType: PropertySubType.RETAIL,
  listingType: ListingType.BOTH,
  listingStatus: ListingStatus.ACTIVE,
  salePrice: 1500000,
  rentalPrice: 8000,
  rentalPeriod: RentalPeriod.MONTHLY,
  features: {
    squareFootage: 3000,
    parkingSpaces: 10,
    amenities: ['Street frontage', 'Storage basement'],
    utilities: ['Electric', 'Gas', 'Water', 'HVAC'],
  },
  mlsNumber: 'MLS-2024-12345',
  isActive: true,
});

console.log('Commercial property created:', commercial.id);
```

### Get Property

```typescript
const property = await client.propertyConfig.get('prop_123');

console.log('Title:', property.title);
console.log('Price:', property.salePrice, property.salePriceCurrency);
console.log('Status:', property.listingStatus);
console.log('Features:', property.features);
```

### List Properties

```typescript
const result = await client.propertyConfig.list({
  page: 1,
  pageSize: 20,
  includeDeleted: false,
});

console.log('Properties:', result.data.length);
console.log('Total:', result.meta.totalCount);

result.data.forEach(prop => {
  console.log('-', prop.title, `$${prop.salePrice || prop.rentalPrice}`);
});
```

### Get Properties by Category

```typescript
const luxuryHomes = await client.propertyConfig.getByCategory('cat_luxury', {
  page: 1,
  pageSize: 20,
});

console.log('Luxury homes:', luxuryHomes.data.length);
luxuryHomes.data.forEach(prop => {
  console.log('-', prop.title, `$${prop.salePrice}`);
});
```

### Get Property by Address

```typescript
const property = await client.propertyConfig.getByAddress('addr_123');

console.log('Property at address:', property.title);
```

### Search Properties

```typescript
const results = await client.propertyConfig.search('oceanfront villa', {
  page: 1,
  pageSize: 10,
});

console.log('Search results:', results.data.length);
results.data.forEach(prop => {
  console.log('-', prop.title);
});
```

### Update Property

```typescript
const updated = await client.propertyConfig.update({
  id: 'prop_123',
  salePrice: 725000,
  listingStatus: ListingStatus.UNDER_OFFER,
  priceNegotiable: false,
});

console.log('Updated price:', updated.salePrice);
console.log('Status:', updated.listingStatus);
```

### Mark Property as Sold

```typescript
const sold = await client.propertyConfig.update({
  id: 'prop_123',
  listingStatus: ListingStatus.SOLD,
  isActive: false,
});

console.log('Property sold');
```

### Delete Property

```typescript
const deleted = await client.propertyConfig.delete('prop_123');

console.log('Deleted:', deleted);
```

---

## Property Inquiries

Property inquiries track customer interest, viewings, and lead management.

### Inquiry Types

```typescript
enum PropertyInquiryType {
  OFFER = 'offer',
  GENERAL = 'general'
}
```

### Inquiry Status

```typescript
enum PropertyInquiryStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  VIEWING_SCHEDULED = 'viewing_scheduled',
  FOLLOW_UP = 'follow_up',
  CONVERTED = 'converted',
  CLOSED = 'closed'
}
```

### Inquiry Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| organizationId | string | Yes | Business account ID |
| propertyId | string | Yes | Property ID |
| customerId | string | No | Existing customer ID |
| customer | object | Yes | Customer details |
| inquiryType | string | Yes | Type: 'offer', 'general' |
| message | string | No | Inquiry message |
| source | string | No | Source (default: 'direct') |
| status | string | No | Status (default: 'new') |
| preferredViewingDate | number | No | Preferred date (timestamp) |
| preferredViewingTime | string | No | Preferred time |
| scheduledViewingDate | number | No | Scheduled date (timestamp) |
| viewingCompleted | boolean | No | Viewing done (default: false) |
| viewingNotes | string | No | Viewing notes |
| followUpDate | number | No | Follow-up date (timestamp) |
| followUpNotes | string | No | Follow-up notes |
| assignedAgentId | string | No | Assigned agent ID |
| convertedToTransaction | boolean | No | Converted (default: false) |
| transactionId | string | No | Transaction ID |
| transactionType | string | No | Type: 'purchase', 'lease' |
| interestedInBuying | boolean | No | Buying interest (default: false) |
| interestedInRenting | boolean | No | Renting interest (default: false) |
| budgetMin | number | No | Minimum budget |
| budgetMax | number | No | Maximum budget |
| notes | string | No | Internal notes |

### Create Inquiry

```typescript
import { PropertyInquiryType, PreferredContactMethod } from 'wiil-js';

const inquiry = await client.propertyInquiries.create({
  organizationId: 'org_123',
  propertyId: 'prop_456',
  customer: {
    organizationId: 'org_123',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-123-4567',
    preferredContactMethod: PreferredContactMethod.EMAIL,
  },
  inquiryType: PropertyInquiryType.GENERAL,
  message: 'I am interested in scheduling a viewing for this property.',
  source: 'website',
  preferredViewingDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days
  preferredViewingTime: '10:00 AM',
  interestedInBuying: true,
  budgetMin: 500000,
  budgetMax: 800000,
});

console.log('Inquiry created:', inquiry.id);
console.log('Status:', inquiry.status);
```

### Create Offer Inquiry

```typescript
const offer = await client.propertyInquiries.create({
  organizationId: 'org_123',
  propertyId: 'prop_789',
  customerId: 'cust_existing',
  customer: {
    organizationId: 'org_123',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '+1-555-987-6543',
    preferredContactMethod: PreferredContactMethod.PHONE,
  },
  inquiryType: PropertyInquiryType.OFFER,
  message: 'I would like to make an offer of $720,000 on this property.',
  source: 'agent_referral',
  interestedInBuying: true,
  budgetMax: 720000,
  notes: 'Pre-approved buyer, motivated to close quickly',
});

console.log('Offer inquiry created:', offer.id);
```

### Get Inquiry

```typescript
const inquiry = await client.propertyInquiries.get('inq_123');

console.log('Property:', inquiry.propertyId);
console.log('Customer:', inquiry.customer.firstName, inquiry.customer.lastName);
console.log('Status:', inquiry.status);
console.log('Type:', inquiry.inquiryType);
```

### Get Inquiries by Property

```typescript
const result = await client.propertyInquiries.getByProperty('prop_456', {
  page: 1,
  pageSize: 20,
});

console.log('Inquiries for property:', result.data.length);
result.data.forEach(inq => {
  console.log('-', inq.customer.firstName, inq.customer.lastName, inq.status);
});
```

### Get Inquiries by Customer

```typescript
const result = await client.propertyInquiries.getByCustomer('cust_123', {
  page: 1,
  pageSize: 20,
});

console.log('Customer inquiries:', result.data.length);
result.data.forEach(inq => {
  console.log('-', inq.propertyId, inq.inquiryType, inq.status);
});
```

### List Inquiries

```typescript
const result = await client.propertyInquiries.list({
  page: 1,
  pageSize: 20,
});

console.log('All inquiries:', result.data.length);
console.log('Total:', result.meta.totalCount);
```

### Update Inquiry

```typescript
const updated = await client.propertyInquiries.update({
  id: 'inq_123',
  assignedAgentId: 'agent_456',
  scheduledViewingDate: Date.now() + 2 * 24 * 60 * 60 * 1000,
  notes: 'Client prefers morning viewings',
});

console.log('Updated, assigned to agent:', updated.assignedAgentId);
```

### Update Inquiry Status

```typescript
import { PropertyInquiryStatus } from 'wiil-js';

const updated = await client.propertyInquiries.updateStatus('inq_123', {
  id: 'inq_123',
  status: PropertyInquiryStatus.VIEWING_SCHEDULED,
  scheduledViewingDate: Date.now() + 2 * 24 * 60 * 60 * 1000,
});

console.log('Status updated:', updated.status);
```

### Complete Viewing

```typescript
const updated = await client.propertyInquiries.updateStatus('inq_123', {
  id: 'inq_123',
  status: PropertyInquiryStatus.FOLLOW_UP,
  viewingCompleted: true,
  viewingNotes: 'Client loved the property, interested in making an offer',
  followUpDate: Date.now() + 1 * 24 * 60 * 60 * 1000,
  followUpNotes: 'Call to discuss offer terms',
});

console.log('Viewing completed, follow-up scheduled');
```

### Convert to Transaction

```typescript
const converted = await client.propertyInquiries.update({
  id: 'inq_123',
  convertedToTransaction: true,
  transactionId: 'txn_789',
  transactionType: 'purchase',
});

// Update status to converted
await client.propertyInquiries.updateStatus('inq_123', {
  id: 'inq_123',
  status: PropertyInquiryStatus.CONVERTED,
});

console.log('Inquiry converted to transaction:', converted.transactionId);
```

### Delete Inquiry

```typescript
const deleted = await client.propertyInquiries.delete('inq_123');

console.log('Deleted:', deleted);
```

---

## Complete Example: Real Estate Agency Workflow

```typescript
import {
  WiilClient,
  PropertyType,
  PropertySubType,
  ListingType,
  ListingStatus,
  PropertyCondition,
  PropertyInquiryType,
  PropertyInquiryStatus,
  PreferredContactMethod
} from 'wiil-js';

async function realEstateWorkflow() {
  const client = new WiilClient({
    apiKey: process.env.WIIL_API_KEY!,
  });

  // 1. Create property categories
  const luxuryCategory = await client.propertyConfig.createCategory({
    organizationId: 'org_123',
    name: 'Luxury Homes',
    description: 'Premium properties over $1M',
    propertyType: PropertyType.RESIDENTIAL,
    displayOrder: 1,
    isDefault: false,
  });

  console.log('Category created:', luxuryCategory.name);

  // 2. Create property address
  const address = await client.propertyConfig.createAddress({
    organizationId: 'org_123',
    street: '100 Billionaire Row',
    city: 'Palm Beach',
    state: 'FL',
    postalCode: '33480',
    country: 'USA',
    neighborhood: 'Estates Section',
    coordinates: {
      latitude: 26.7056,
      longitude: -80.0364,
    },
    isVerified: false,
  });

  console.log('Address created:', address.street);

  // 3. Verify the address
  const verifiedAddress = await client.propertyConfig.verifyAddress(address.id);
  console.log('Address verified:', verifiedAddress.isVerified);

  // 4. Create property listing
  const property = await client.propertyConfig.create({
    organizationId: 'org_123',
    categoryId: luxuryCategory.id,
    addressId: address.id,
    title: 'Oceanfront Estate with Private Beach',
    description: `
      Magnificent 8-bedroom estate on 2 acres with 200 feet of ocean frontage.
      Features include infinity pool, tennis court, and private dock.
    `,
    propertyType: PropertyType.RESIDENTIAL,
    propertySubType: PropertySubType.VILLA,
    listingType: ListingType.SALE,
    listingStatus: ListingStatus.ACTIVE,
    salePrice: 45000000,
    salePriceCurrency: 'USD',
    priceNegotiable: true,
    features: {
      bedrooms: 8,
      bathrooms: 10,
      parkingSpaces: 6,
      squareFootage: 15000,
      lotSize: 2,
      lotSizeUnit: 'acres',
      yearBuilt: 2020,
      floors: 3,
      amenities: [
        'Private beach',
        'Infinity pool',
        'Tennis court',
        'Home theater',
        'Wine cellar',
        'Smart home',
        'Private dock',
      ],
      utilities: ['Electric', 'Gas', 'Water', 'Fiber internet'],
    },
    condition: PropertyCondition.EXCELLENT,
    furnished: false,
    images: [
      'https://example.com/estate-exterior.jpg',
      'https://example.com/estate-pool.jpg',
      'https://example.com/estate-interior.jpg',
    ],
    virtualTourUrl: 'https://tour.example.com/estate-100',
    isActive: true,
    isFeatured: true,
    mlsNumber: 'MLS-FL-2024-00001',
  });

  console.log('Property listed:', property.title);
  console.log('Price: $', property.salePrice.toLocaleString());

  // 5. Receive inquiry from interested buyer
  const inquiry = await client.propertyInquiries.create({
    organizationId: 'org_123',
    propertyId: property.id,
    customer: {
      organizationId: 'org_123',
      firstName: 'Richard',
      lastName: 'Branson',
      email: 'richard@example.com',
      phone: '+1-555-000-0001',
      preferredContactMethod: PreferredContactMethod.PHONE,
    },
    inquiryType: PropertyInquiryType.GENERAL,
    message: 'Interested in a private showing of this estate.',
    source: 'agent_referral',
    preferredViewingDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    preferredViewingTime: '2:00 PM',
    interestedInBuying: true,
    budgetMin: 40000000,
    budgetMax: 50000000,
  });

  console.log('Inquiry received from:', inquiry.customer.firstName, inquiry.customer.lastName);

  // 6. Contact client and schedule viewing
  await client.propertyInquiries.updateStatus(inquiry.id, {
    id: inquiry.id,
    status: PropertyInquiryStatus.CONTACTED,
  });

  const scheduledInquiry = await client.propertyInquiries.updateStatus(inquiry.id, {
    id: inquiry.id,
    status: PropertyInquiryStatus.VIEWING_SCHEDULED,
    scheduledViewingDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
  });

  console.log('Viewing scheduled for:', new Date(scheduledInquiry.scheduledViewingDate!));

  // 7. Complete viewing with positive feedback
  await client.propertyInquiries.updateStatus(inquiry.id, {
    id: inquiry.id,
    status: PropertyInquiryStatus.FOLLOW_UP,
    viewingCompleted: true,
    viewingNotes: 'Client very interested. Loved the private beach and dock.',
    followUpDate: Date.now() + 1 * 24 * 60 * 60 * 1000,
    followUpNotes: 'Client consulting with advisors, will call tomorrow.',
  });

  console.log('Viewing completed successfully');

  // 8. Client makes an offer
  const offerInquiry = await client.propertyInquiries.create({
    organizationId: 'org_123',
    propertyId: property.id,
    customerId: inquiry.customerId,
    customer: inquiry.customer,
    inquiryType: PropertyInquiryType.OFFER,
    message: 'Offering $43,000,000 with 30-day close.',
    interestedInBuying: true,
    budgetMax: 43000000,
    notes: 'Buyer pre-qualified, cash offer',
  });

  console.log('Offer received: $', 43000000.toLocaleString());

  // 9. Update property status
  await client.propertyConfig.update({
    id: property.id,
    listingStatus: ListingStatus.UNDER_OFFER,
  });

  console.log('Property marked as under offer');

  // 10. Convert inquiry to transaction
  await client.propertyInquiries.update({
    id: offerInquiry.id,
    convertedToTransaction: true,
    transactionId: 'txn_estate_001',
    transactionType: 'purchase',
  });

  await client.propertyInquiries.updateStatus(offerInquiry.id, {
    id: offerInquiry.id,
    status: PropertyInquiryStatus.CONVERTED,
  });

  // 11. Mark property as sold
  await client.propertyConfig.update({
    id: property.id,
    listingStatus: ListingStatus.SOLD,
    isActive: false,
  });

  console.log('Property sold!');

  // 12. View inquiry history for the property
  const allInquiries = await client.propertyInquiries.getByProperty(property.id);
  console.log(`Property had ${allInquiries.data.length} inquiries`);

  // 13. Search for similar properties
  const similar = await client.propertyConfig.search('oceanfront', {
    page: 1,
    pageSize: 5,
  });

  console.log('Similar properties available:', similar.data.length);
}
```

---

## Best Practices

### Property Categories
- Create specific categories to organize listings effectively
- Use `displayOrder` to control category presentation
- Set one category as default for quick listing creation

### Property Addresses
- Always verify addresses before creating property listings
- Include coordinates for map-based property searches
- Store neighborhood information for local search filtering

### Property Listings
- Use descriptive titles that highlight key features
- Include complete feature information for search filtering
- Upload multiple high-quality images
- Add virtual tour URLs for remote buyers
- Keep MLS numbers updated for syndication
- Set appropriate listing status throughout the sales cycle

### Property Inquiries
- Assign inquiries to agents promptly
- Track all customer interactions in notes
- Use status updates to manage pipeline
- Schedule follow-ups to maintain engagement
- Record viewing feedback for property improvements
- Convert inquiries to transactions when deals close

### Lead Management Workflow
Follow this typical lifecycle:
1. Inquiry received → 'new'
2. Agent contacts client → 'contacted'
3. Viewing scheduled → 'viewing_scheduled'
4. Post-viewing follow-up → 'follow_up'
5. Deal closed → 'converted'
6. Or no longer interested → 'closed'

---

## Troubleshooting

### Problem: Category not found

**Error:**
```
ValidationError: Category ID not found
```

**Solution:**
Verify the category exists before creating a property:
```typescript
const category = await client.propertyConfig.getCategory('cat_123');
if (category) {
  await client.propertyConfig.create({
    categoryId: category.id,
    // ... other fields
  });
}
```

### Problem: Address not verified

**Error:**
```
ValidationError: Address must be verified
```

**Solution:**
Verify the address before listing:
```typescript
const address = await client.propertyConfig.getAddress('addr_123');
if (!address.isVerified) {
  await client.propertyConfig.verifyAddress('addr_123');
}
```

### Problem: Invalid property type combination

**Error:**
```
ValidationError: PropertySubType does not match PropertyType
```

**Solution:**
Ensure subtype matches type:
```typescript
// Correct
propertyType: PropertyType.RESIDENTIAL,
propertySubType: PropertySubType.HOUSE, // residential subtype

// Incorrect
propertyType: PropertyType.RESIDENTIAL,
propertySubType: PropertySubType.WAREHOUSE, // commercial subtype
```

### Problem: Missing customer for inquiry

**Error:**
```
ValidationError: customer is required
```

**Solution:**
Always include customer details:
```typescript
const inquiry = await client.propertyInquiries.create({
  propertyId: 'prop_123',
  customer: {
    organizationId: 'org_123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1-555-123-4567',
    preferredContactMethod: PreferredContactMethod.EMAIL,
  },
  inquiryType: PropertyInquiryType.GENERAL,
  // ... other fields
});
```

### Problem: Listing status transition invalid

**Error:**
```
ValidationError: Invalid status transition
```

**Solution:**
Follow valid status transitions:
- DRAFT → ACTIVE → UNDER_OFFER → SOLD/LEASED
- Any status → WITHDRAWN
