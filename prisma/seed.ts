import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database seed...');

  const packageCount = await prisma.package.count();
  if (packageCount === 0) {
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
        price: 800000,
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
        price: 2500000,
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
        price: 1800000,
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
        price: 5500000,
        isPopular: false,
        sortOrder: 4,
      },
      {
        slug: 'custom-rig',
        name: 'Custom Rig (Materials Only)',
        category: 'combo',
        description: 'Build your own stage setup by selecting individual materials. Price is determined by your material selections — no fixed package cost.',
        features: JSON.stringify([
          'Choose from Audio, Lighting, Staging, Power & Effects',
          'Mix and match any combination of gear',
          'Pay only for what you need',
          'Delivery, rigging & retrieval included',
          'Pricing calculated per selected item per day',
        ]),
        price: 0,
        isPopular: false,
        sortOrder: 5,
      },
    ];

    for (const pkg of packages) {
      await prisma.package.create({ data: pkg });
    }
    console.log('Packages seeded.');
  }

  const materialCount = await prisma.material.count();
  if (materialCount === 0) {
    const materials = [
      {
        name: 'Line Array Speaker Box (Dual 12")',
        category: 'audio',
        description: 'Professional grade dual 12-inch line array speaker with rigging hardware. Suitable for medium to large venues.',
        pricePerDay: 350000,
        unit: 'unit',
        isAvailable: true,
        sortOrder: 1,
      },
      {
        name: '18" Subwoofer',
        category: 'audio',
        description: 'High-output 18-inch subwoofer for deep bass reinforcement. Ideal for concerts and outdoor events.',
        pricePerDay: 250000,
        unit: 'unit',
        isAvailable: true,
        sortOrder: 2,
      },
      {
        name: 'Wireless Microphone Set',
        category: 'audio',
        description: 'UHF handheld wireless microphone system with receiver. Includes 1 transmitter and 1 receiver.',
        pricePerDay: 80000,
        unit: 'set',
        isAvailable: true,
        sortOrder: 3,
      },
      {
        name: 'Digital Mixing Console (32-ch)',
        category: 'audio',
        description: '32-channel digital audio mixer with built-in effects processor and multitrack recording.',
        pricePerDay: 300000,
        unit: 'unit',
        isAvailable: true,
        sortOrder: 4,
      },
      {
        name: 'Stage Monitor (Floor Wedge)',
        category: 'audio',
        description: '15-inch floor monitor speaker for on-stage foldback. Essential for performer monitoring.',
        pricePerDay: 120000,
        unit: 'unit',
        isAvailable: true,
        sortOrder: 5,
      },
      {
        name: 'LED Moving Head Light',
        category: 'lighting',
        description: 'Professional 150W LED moving head beam/spot hybrid fixture. Programmable via DMX.',
        pricePerDay: 150000,
        unit: 'unit',
        isAvailable: true,
        sortOrder: 6,
      },
      {
        name: 'LED PAR Can (RGBW)',
        category: 'lighting',
        description: '18×10W RGBW LED PAR can for stage wash lighting. Includes DMX control.',
        pricePerDay: 60000,
        unit: 'unit',
        isAvailable: true,
        sortOrder: 7,
      },
      {
        name: 'Follow Spot Light (1200W)',
        category: 'lighting',
        description: 'Manual 1200W follow spot light for tracking performers on stage.',
        pricePerDay: 200000,
        unit: 'unit',
        isAvailable: true,
        sortOrder: 8,
      },
      {
        name: 'DMX Lighting Controller',
        category: 'lighting',
        description: '512-channel DMX lighting controller. Required to program and run all DMX fixtures.',
        pricePerDay: 100000,
        unit: 'unit',
        isAvailable: true,
        sortOrder: 9,
      },
      {
        name: 'LED Truss (3m section)',
        category: 'staging',
        description: '3-meter aluminum box truss section for rigging lights and speakers overhead.',
        pricePerDay: 90000,
        unit: 'piece',
        isAvailable: true,
        sortOrder: 10,
      },
      {
        name: 'Truss Tower Stand',
        category: 'staging',
        description: 'Freestanding vertical tower stand for truss and lighting rigging. Height adjustable up to 5m.',
        pricePerDay: 120000,
        unit: 'unit',
        isAvailable: true,
        sortOrder: 11,
      },
      {
        name: 'Stage Platform (4×4 ft section)',
        category: 'staging',
        description: 'Portable folding stage platform section. Height adjustable 60–90cm.',
        pricePerDay: 80000,
        unit: 'piece',
        isAvailable: true,
        sortOrder: 12,
      },
      {
        name: 'Silent Diesel Generator (7.5 KVA)',
        category: 'power',
        description: 'Soundproof diesel generator rated 7.5 KVA. Sufficient for small audio systems.',
        pricePerDay: 500000,
        unit: 'unit',
        isAvailable: true,
        sortOrder: 13,
      },
      {
        name: 'Silent Diesel Generator (15 KVA)',
        category: 'power',
        description: 'Heavy-duty soundproof diesel generator rated 15 KVA. Suitable for medium events with lighting.',
        pricePerDay: 800000,
        unit: 'unit',
        isAvailable: true,
        sortOrder: 14,
      },
      {
        name: 'Power Distribution Box (32A)',
        category: 'power',
        description: '32A power distribution unit with multiple outlets for safely distributing stage power.',
        pricePerDay: 100000,
        unit: 'unit',
        isAvailable: true,
        sortOrder: 15,
      },
      {
        name: 'CO2 Jet / Cryo Machine',
        category: 'effects',
        description: 'High-pressure CO2 cryo jet effect for concert moments. Shoots 3–5m CO2 blasts.',
        pricePerDay: 250000,
        unit: 'unit',
        isAvailable: true,
        sortOrder: 16,
      },
      {
        name: 'Professional Fog Machine',
        category: 'effects',
        description: 'High-output fog/haze machine for atmosphere and beam visibility. Includes fluid.',
        pricePerDay: 100000,
        unit: 'unit',
        isAvailable: true,
        sortOrder: 17,
      },
      {
        name: 'Confetti Cannon',
        category: 'effects',
        description: 'Electric confetti cannon with multi-color confetti load. Ideal for finales and celebrations.',
        pricePerDay: 150000,
        unit: 'unit',
        isAvailable: true,
        sortOrder: 18,
      },
    ];

    for (const mat of materials) {
      await prisma.material.create({ data: mat });
    }
    console.log('Materials seeded.');
  }

  const availabilityCount = await prisma.availability.count();
  if (availabilityCount === 0) {
    const holidays = [
      { date: new Date('2026-01-01'), isBlocked: true, reason: 'holiday' },
      { date: new Date('2026-01-26'), isBlocked: true, reason: 'holiday' },
      { date: new Date('2026-08-15'), isBlocked: true, reason: 'holiday' },
      { date: new Date('2026-10-02'), isBlocked: true, reason: 'holiday' },
    ];

    for (const h of holidays) {
      await prisma.availability.create({ data: h });
    }
    console.log('Availability seeded.');
  }

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
