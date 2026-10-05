// Phase 7 & 8 Payments and Customer Account Verification Test
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- STARTING PHASE 7 & 8 END-TO-END VERIFICATION ---\n');
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
    const testDate = '2026-11-28';
    const testPhone = '9789012345';
    const testEmail = 'suresh.events@example.com';

    // 1. Create draft booking
    console.log('1. Creating draft booking for date: ' + testDate);
    const bookRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageSlug: 'mega-event',
        customerName: 'Suresh Kumar',
        customerEmail: testEmail,
        customerPhone: testPhone,
        eventDate: testDate,
        venueAddress: 'Palace Grounds, Trichy',
        eventType: 'Mega Arena Concert',
        notes: 'Sound check 4 hours prior with dual silent generator synch.',
      }),
    });

    const bookData = await bookRes.json();
    assert(bookRes.status === 201, 'Draft booking created (201)');
    const bookingId = bookData.booking.id;
    assert(Boolean(bookingId), 'Booking ID assigned');
    assert(bookData.booking.totalAmount === 5500000, 'Mega Event total is ₹55,000');
    assert(bookData.advanceRequired === 1375000, '25% Advance calculated as ₹13,750');
    assert(bookData.balanceDue === 4125000, '75% Balance calculated as ₹41,250');

    // 2. Create Razorpay order
    console.log('\n2. Creating Razorpay payment order for 25% advance...');
    const orderRes = await fetch(`${BASE_URL}/api/razorpay/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });

    const orderData = await orderRes.json();
    assert(orderRes.status === 200, 'Order created successfully (200)');
    assert(orderData.amount === 1375000, 'Order amount strictly matches 25% advance (₹13,750)');
    const orderId = orderData.orderId;
    assert(Boolean(orderId), 'Order ID received from payment gateway');

    // 3. Verify Payment
    console.log('\n3. Verifying payment transaction and locking calendar date...');
    const verifyRes = await fetch(`${BASE_URL}/api/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        razorpay_order_id: orderId,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: `mock_sig_${Date.now()}`,
      }),
    });

    const verifyData = await verifyRes.json();
    assert(verifyRes.status === 200, 'Payment verified successfully (200)');
    assert(verifyData.booking.status === 'CONFIRMED', 'Booking transitioned to CONFIRMED');
    assert(verifyData.booking.paymentStatus === 'ADVANCE_PAID', 'Payment status transitioned to ADVANCE_PAID');

    // 4. Verify calendar date is now permanently locked
    console.log('\n4. Verifying calendar blackout on locked date...');
    const checkRes = await fetch(`${BASE_URL}/api/availability/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: testDate }),
    });
    const checkData = await checkRes.json();
    assert(checkData.available === false, 'Locked date is now flagged as unavailable to future clients');

    // 5. Customer Self-Service Lookup via Phone
    console.log('\n5. Verifying customer portal lookup via phone number...');
    const lookupRes = await fetch(`${BASE_URL}/api/my-bookings?query=${testPhone}`);
    const lookupData = await lookupRes.json();
    assert(lookupRes.status === 200, 'Customer lookup returned 200');
    assert(lookupData.bookings.length >= 1, 'Found confirmed booking in customer portal');
    assert(lookupData.bookings[0].paymentStatus === 'ADVANCE_PAID', 'Confirmed booking status visible to customer');
    assert(lookupData.bookings[0].packageName === 'Mega Event Package', 'Correct package displayed');

    console.log(`\n========================================`);
    console.log(`PHASE 7 & 8 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
