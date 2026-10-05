// Phase 3 Auth Verification Test
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- STARTING PHASE 3 AUTH VERIFICATION ---\n');
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
    // 1. Test /admin unauthorized redirect
    console.log('1. Testing unauthenticated access to /admin...');
    const resAdminNoAuth = await fetch(`${BASE_URL}/admin`, {
      redirect: 'manual',
    });
    assert(
      resAdminNoAuth.status === 307 || resAdminNoAuth.status === 308 || resAdminNoAuth.status === 302,
      `Unauthenticated access to /admin redirects (Status: ${resAdminNoAuth.status})`
    );
    const location = resAdminNoAuth.headers.get('location') || '';
    assert(location.includes('/admin/login'), 'Redirect points to /admin/login');

    // 2. Test login with wrong password
    console.log('\n2. Testing login with invalid credentials...');
    const resBadLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@eswarisound.com', password: 'wrong-password' }),
    });
    assert(resBadLogin.status === 401, 'Invalid credentials rejected with 401');

    // 3. Test login with valid credentials
    console.log('\n3. Testing login with valid credentials...');
    const resGoodLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@eswarisound.com', password: 'eswari-live-2026' }),
    });
    assert(resGoodLogin.status === 200, 'Valid credentials accepted with 200');
    const setCookie = resGoodLogin.headers.get('set-cookie') || '';
    assert(setCookie.includes('eswari_admin_token='), 'Response sets eswari_admin_token cookie');

    // Extract cookie value
    const match = setCookie.match(/eswari_admin_token=([^;]+)/);
    const token = match ? match[1] : '';
    assert(Boolean(token), 'Extracted valid session token');

    // 4. Test GET /api/auth/me with cookie
    console.log('\n4. Testing /api/auth/me with session cookie...');
    const resMe = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: `eswari_admin_token=${token}` },
    });
    assert(resMe.status === 200, '/api/auth/me returns 200');
    const meData = await resMe.json();
    assert(meData.authenticated === true, 'Session is authenticated');
    assert(meData.user.email === 'admin@eswarisound.com', 'Returns correct user email');

    // 5. Test authenticated access to /admin
    console.log('\n5. Testing authenticated access to /admin...');
    const resAdminAuth = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: `eswari_admin_token=${token}` },
      redirect: 'manual',
    });
    assert(resAdminAuth.status === 200, 'Authenticated request to /admin allowed (Status: 200)');

    // 6. Test logout
    console.log('\n6. Testing /api/auth/logout...');
    const resLogout = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: `eswari_admin_token=${token}` },
    });
    assert(resLogout.status === 200, 'Logout returns 200');
    const logoutCookie = resLogout.headers.get('set-cookie') || '';
    assert(logoutCookie.includes('eswari_admin_token=;'), 'Logout clears session cookie');

    // 7. Test /api/auth/me after logout
    console.log('\n7. Testing /api/auth/me without cookie...');
    const resMeLoggedOut = await fetch(`${BASE_URL}/api/auth/me`);
    assert(resMeLoggedOut.status === 401, 'Unauthorized after logout');

    console.log(`\n========================================`);
    console.log(`PHASE 3 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
