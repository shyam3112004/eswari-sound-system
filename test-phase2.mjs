// Phase 2 API End-to-End Verification Test
const BASE_URL = 'http://localhost:3000';

// Dates lock permanently once a booking exists, so pick the first open date
// from a starting point instead of hardcoding one. Keeps the suite re-runnable.
async function findOpenDate(startDate) {
  const cursor = new Date(`${startDate}T00:00:00Z`);
  for (let i = 0; i < 60; i += 1) {
    const date = cursor.toISOString().slice(0, 10);
    const res = await fetch(`${BASE_URL}/api/availability/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    const data = await res.json();
    if (data.available === true) return date;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  throw new Error('No open date found within 60 days of ' + startDate);
}

async function runTests() {
  console.log('--- STARTING PHASE 2 API VERIFICATION ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Test GET /api/packages
    console.log('1. Testing GET /api/packages...');
    const resPackages = await fetch(`${BASE_URL}/api/packages`);
    const dataPackages = await resPackages.json();
    assert(resPackages.status === 200, 'GET /api/packages returns 200');
    assert(dataPackages.success === true, 'Response has success: true');
    assert(dataPackages.packages.length === 4, 'Catalog contains 4 seeded packages');
    assert(Array.isArray(dataPackages.packages[0].features), 'Features parsed as JSON array');

    // 2. Test GET /api/packages/[slug]
    console.log('\n2. Testing GET /api/packages/premium-dj...');
    const resPkg = await fetch(`${BASE_URL}/api/packages/premium-dj`);
    const dataPkg = await resPkg.json();
    assert(resPkg.status === 200, 'GET /api/packages/premium-dj returns 200');
    assert(dataPkg.package.name === 'Premium DJ Package', 'Returns correct package name');
    assert(dataPkg.package.price === 2500000, 'Returns correct price (₹25,000 in paise)');

    // 3. Test GET /api/availability
    console.log('\n3. Testing GET /api/availability...');
    const resAvail = await fetch(`${BASE_URL}/api/availability`);
    const dataAvail = await resAvail.json();
    assert(resAvail.status === 200, 'GET /api/availability returns 200');
    assert(dataAvail.success === true, 'Response has success: true');
    assert(dataAvail.blockedDates.length >= 0, 'Returns blockedDates array');

    // 4. Test POST /api/availability/check (Blocked date: 2025-01-26 Republic Day)
    console.log('\n4. Testing POST /api/availability/check on blocked date...');
    const resCheckBlocked = await fetch(`${BASE_URL}/api/availability/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2025-01-26' }),
    });
    const dataCheckBlocked = await resCheckBlocked.json();
    assert(resCheckBlocked.status === 200, 'Check returns 200');
    assert(dataCheckBlocked.available === false, 'Correctly flags holiday as unavailable');

    // 5. Test POST /api/availability/check on open date
    console.log('\n5. Testing POST /api/availability/check on open future date...');
    const testDate = await findOpenDate('2026-11-20');
    console.log(`   (open date selected: ${testDate})`);
    const resCheckOpen = await fetch(`${BASE_URL}/api/availability/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: testDate }),
    });
    const dataCheckOpen = await resCheckOpen.json();
    assert(dataCheckOpen.available === true, 'Correctly flags open future date as available');

    // 6. Test POST /api/bookings (Create draft booking)
    console.log('\n6. Testing POST /api/bookings with valid data...');
    const bookingPayload = {
      packageSlug: 'premium-dj',
      customerName: 'Karthik Raja',
      customerEmail: 'karthik@example.com',
      customerPhone: '9876543210',
      eventDate: testDate,
      venueAddress: 'Kalyana Mandapam, T. Nagar, Chennai',
      eventType: 'Wedding Reception',
      notes: 'Please ensure subwoofer line-check by 4 PM.',
    };

    const resBook = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload),
    });
    const dataBook = await resBook.json();
    assert(resBook.status === 201, 'POST /api/bookings returns 201 Created');
    assert(dataBook.success === true, 'Booking created successfully');
    assert(dataBook.booking.totalAmount === 2500000, 'Total amount matches package price');
    assert(dataBook.advanceRequired === 625000, 'Advance required is exactly 25% (₹6,250)');
    assert(dataBook.balanceDue === 1875000, 'Balance due is exactly 75% (₹18,750)');

    // 7. Test Duplicate Booking on same date (Conflict prevention)
    console.log('\n7. Testing POST /api/bookings duplicate date prevention...');
    const resConflict = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload),
    });
    assert(resConflict.status === 409, 'Returns 409 Conflict when date is already booked');

    // 8. Test POST /api/inquiries
    console.log('\n8. Testing POST /api/inquiries...');
    const inquiryPayload = {
      name: 'Sunil Kumar',
      email: 'sunil@eventprod.in',
      phone: '9840123456',
      eventType: 'Music Festival (3 Days)',
      eventDate: '2026-12-15',
      venue: 'YMCA Grounds, Royapettah',
      message: 'Need 16-box line array setup, 24 moving heads, and 3 days of on-site FOH engineers.',
    };
    const resInquiry = await fetch(`${BASE_URL}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryPayload),
    });
    const dataInquiry = await resInquiry.json();
    assert(resInquiry.status === 201, 'POST /api/inquiries returns 201 Created');
    assert(Boolean(dataInquiry.inquiryId), 'Returns unique inquiryId');

    // 9. Test GET /api/my-bookings?query=9876543210
    console.log('\n9. Testing GET /api/my-bookings lookup...');
    const resLookup = await fetch(`${BASE_URL}/api/my-bookings?query=9876543210`);
    const dataLookup = await resLookup.json();
    assert(resLookup.status === 200, 'GET /api/my-bookings returns 200');
    assert(dataLookup.count >= 1, 'Finds at least 1 booking for test phone number');
    assert(dataLookup.bookings[0].customerName === 'Karthik Raja', 'Returns matching customer booking');

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
