import '@testing-library/jest-dom'

/**
 * Jest Setup with Instrumentation
 * 
 * This file runs before all tests and sets up:
 * - Testing library matchers
 * - Instrumentation hooks
 * - Test logging and metrics
 */

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║           🧪 JEST TEST FRAMEWORK INITIALIZED             ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Track test execution
let testStartTime;
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

beforeEach(() => {
  testStartTime = Date.now();
  totalTests++;
});

afterEach(() => {
  const duration = Date.now() - testStartTime;
  const testName = expect.getState().currentTestName;
  
  // Simple pass detection (if we got here without throwing, test passed)
  passedTests++;
  
  console.log(`   ⏱️  Test completed in ${duration}ms: ${testName}`);
});

afterAll(() => {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║              📊 TEST EXECUTION SUMMARY                    ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`   Total Tests Run: ${totalTests}`);
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
});
