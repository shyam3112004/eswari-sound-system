// Phase 4 Video Frontend Verification Test
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- STARTING PHASE 4 VIDEO FRONTEND VERIFICATION ---\n');
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
    // 1. Test Homepage HTTP 200
    console.log('1. Testing Homepage render (HTTP 200)...');
    const resHome = await fetch(`${BASE_URL}/`);
    assert(resHome.status === 200, 'Homepage returns 200 OK');
    const html = await resHome.text();
    assert(html.includes('Pure Acoustic Power'), 'Contains display headline');
    assert(html.includes('Eswari Sound System'), 'Contains brand title');

    // 2. Test Desktop Frame Sequences for all 6 sections
    console.log('\n2. Testing Desktop WebP Frame Assets across all 6 sections...');
    const sections = ['01_home', '02_about', '03_services', '04_packages', '05_gallery', '06_book'];

    for (const sec of sections) {
      // Test first frame
      const urlFirst = `${BASE_URL}/assets/frames/desktop/${sec}/0001.webp`;
      const resFirst = await fetch(urlFirst);
      assert(resFirst.status === 200, `Desktop ${sec} frame 0001.webp accessible (HTTP 200)`);
      const contentType = resFirst.headers.get('content-type') || '';
      assert(contentType.includes('webp') || contentType.includes('image'), `Desktop ${sec} returns valid image/webp content-type`);

      // Test mid frame (0048)
      const urlMid = `${BASE_URL}/assets/frames/desktop/${sec}/0048.webp`;
      const resMid = await fetch(urlMid);
      assert(resMid.status === 200, `Desktop ${sec} frame 0048.webp accessible (HTTP 200)`);

      // Test last frame (0096)
      const urlLast = `${BASE_URL}/assets/frames/desktop/${sec}/0096.webp`;
      const resLast = await fetch(urlLast);
      assert(resLast.status === 200, `Desktop ${sec} frame 0096.webp accessible (HTTP 200)`);
    }

    // 3. Test Mobile WebP Frame Sequences (64 frames)
    console.log('\n3. Testing Mobile WebP Frame Assets...');
    for (const sec of sections) {
      const urlMobile = `${BASE_URL}/assets/frames/mobile/${sec}/0001.webp`;
      const resMobile = await fetch(urlMobile);
      assert(resMobile.status === 200, `Mobile ${sec} frame 0001.webp accessible (HTTP 200)`);

      const urlMobileLast = `${BASE_URL}/assets/frames/mobile/${sec}/0064.webp`;
      const resMobileLast = await fetch(urlMobileLast);
      assert(resMobileLast.status === 200, `Mobile ${sec} frame 0064.webp accessible (HTTP 200)`);
    }

    console.log(`\n========================================`);
    console.log(`PHASE 4 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
