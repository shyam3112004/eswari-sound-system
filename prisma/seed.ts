import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing seed data in correct foreign key order
  await prisma.booking.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.package.deleteMany();

  const packages = [
    {
      slug: 'basic-sound',
      name: 'Basic Sound Package',
      category: 'audio',
      description: 'Perfect for small gatherings and house parties. Includes 2 speakers, 1 mic, and basic mixer.',
      features: JSON.stringify([
        '2 × 500W Powered Speakers',
        '1 × Wireless Microphone',
        '4-Channel Mixer',
        'Setup & Sound Check',
      ]),
      price: 800000, // ₹8,000
      isPopular: false,
      sortOrder: 1,
    },
    {
      slug: 'premium-dj',
      name: 'Premium DJ Package',
      category: 'combo',
      description: 'Complete DJ setup with lighting for medium-sized events. Includes sound, lights, and DJ console.',
      features: JSON.stringify([
        '4 × 1000W Line Array Speakers',
        '2 × Wireless Mics + 1 Wired Mic',
        'Professional DJ Controller',
        'LED PAR Can Lights (4 units)',
        'Fog Machine',
        'Truss Stand Setup',
        'Sound Engineer + DJ',
      ]),
      price: 2500000, // ₹25,000
      isPopular: true,
      sortOrder: 2,
    },
    {
      slug: 'stage-lighting',
      name: 'Stage Lighting Package',
      category: 'lighting',
      description: 'Dynamic lighting setup to transform any venue into a concert hall.',
      features: JSON.stringify([
        '8 × LED Moving Head Lights',
        '12 × LED PAR Cans',
        '2 × Follow Spots',
        'DMX Controller + Operator',
        'Truss Rigging',
      ]),
      price: 1800000, // ₹18,000
      isPopular: false,
      sortOrder: 3,
    },
    {
      slug: 'mega-event',
      name: 'Mega Event Package',
      category: 'combo',
      description: 'The ultimate production package for weddings, corporate events, and large celebrations.',
      features: JSON.stringify([
        '8 × 1000W Line Array Speakers',
        'Subwoofer Array (4 units)',
        '4 × Wireless Mics',
        'Digital Mixer + Stage Box',
        'LED Wall (P3.9, 3×2m)',
        '12 × Moving Head Lights',
        'CO2 Jet Effects',
        'Full Truss + Stage Setup',
        'Sound Engineer + Lighting Designer',
      ]),
      price: 5500000, // ₹55,000
      isPopular: false,
      sortOrder: 4,
    },
  ];

  for (const pkg of packages) {
    await prisma.package.create({ data: pkg });
  }

  console.log('Packages seeded.');

  const holidays = [
    { date: new Date('2025-01-01'), isBlocked: true, reason: 'holiday' },
    { date: new Date('2025-01-26'), isBlocked: true, reason: 'holiday' },
    { date: new Date('2025-08-15'), isBlocked: true, reason: 'holiday' },
    { date: new Date('2025-10-02'), isBlocked: true, reason: 'holiday' },
  ];

  for (const h of holidays) {
    await prisma.availability.create({ data: h });
  }

  console.log('Availability seeded.');
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
