/**
 * Trading System Test Script
 * Tests wallet creation, deposits, buying, selling, and transaction history
 */

const BASE_URL = 'http://localhost:3000';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Helper to display results
function displayResult(testName, result) {
  console.log('\n' + '='.repeat(70));
  console.log(`TEST: ${testName}`);
  console.log('='.repeat(70));
  
  if (result.success) {
    console.log('✅ SUCCESS');
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    console.log('❌ FAILED');
    console.log(`Error: ${result.error}`);
  }
}

async function runTests() {
  console.log('\n🚀 Starting Trading System Tests...\n');
  
  // Generate unique test user ID
  const testUserId = `trader_${Date.now()}`;
  const testUserName = 'Trading Test User';
  const testUserEmail = `${testUserId}@test.com`;
  
  console.log(`Test User ID: ${testUserId}`);
  
  // Test 1: Create User
  const createUserResult = await apiCall('/user', 'POST', {
    userId: testUserId,
    name: testUserName,
    email: testUserEmail
  });
  displayResult('Create User', createUserResult);
  
  if (!createUserResult.success) {
    console.log('\n❌ Cannot proceed without user creation');
    return;
  }
  
  // Wait a bit for database to sync
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test 2: Get Initial Wallet (should auto-create)
  const getWalletResult = await apiCall(`/wallet/${testUserId}`);
  displayResult('Get Initial Wallet', getWalletResult);
  
  // Test 3: Deposit Additional Funds
  const depositResult = await apiCall('/wallet/deposit', 'POST', {
    userId: testUserId,
    amount: 50000,
    notes: 'Test deposit for trading'
  });
  displayResult('Deposit Funds', depositResult);
  
  // Test 4: Get Updated Wallet Balance
  const getWalletAfterDepositResult = await apiCall(`/wallet/${testUserId}`);
  displayResult('Wallet After Deposit', getWalletAfterDepositResult);
  
  // Test 5: Create Portfolio
  const createPortfolioResult = await apiCall('/portfolio/initialize', 'POST', {
    userId: testUserId,
    tickers: ['AAPL'],
    horizon: 2
  });
  displayResult('Create Portfolio', createPortfolioResult);
  
  let portfolioId = null;
  if (createPortfolioResult.success && createPortfolioResult.data.portfolio) {
    portfolioId = createPortfolioResult.data.portfolio.portfolioId;
    console.log(`\n📊 Portfolio ID: ${portfolioId}`);
  }
  
  // Test 6: Buy Stock (AAPL)
  const buyResult = await apiCall('/wallet/buy', 'POST', {
    userId: testUserId,
    ticker: 'AAPL',
    quantity: 10,
    portfolioId: portfolioId
  });
  displayResult('Buy 10 Shares of AAPL', buyResult);
  
  // Test 7: Get Wallet After Purchase
  const getWalletAfterBuyResult = await apiCall(`/wallet/${testUserId}`);
  displayResult('Wallet After Purchase', getWalletAfterBuyResult);
  
  // Test 8: Buy More Stock (different ticker if available)
  const buyResult2 = await apiCall('/wallet/buy', 'POST', {
    userId: testUserId,
    ticker: 'MSFT',
    quantity: 5,
    portfolioId: portfolioId
  });
  displayResult('Buy 5 Shares of MSFT', buyResult2);
  
  // Test 9: Get Holdings
  const getHoldingsResult = await apiCall(`/wallet/${testUserId}/holdings`);
  displayResult('Get Holdings', getHoldingsResult);
  
  // Test 10: Sell Some Stock
  const sellResult = await apiCall('/wallet/sell', 'POST', {
    userId: testUserId,
    ticker: 'AAPL',
    quantity: 5,
    portfolioId: portfolioId
  });
  displayResult('Sell 5 Shares of AAPL', sellResult);
  
  // Test 11: Get Transaction History
  const getTransactionsResult = await apiCall(`/wallet/${testUserId}/transactions?limit=20`);
  displayResult('Transaction History', getTransactionsResult);
  
  // Test 12: Get Wallet Summary
  const getSummaryResult = await apiCall(`/wallet/${testUserId}/summary`);
  displayResult('Wallet Summary', getSummaryResult);
  
  // Test 13: Try to Sell More Than Owned (Should Fail)
  const sellFailResult = await apiCall('/wallet/sell', 'POST', {
    userId: testUserId,
    ticker: 'AAPL',
    quantity: 100,
    portfolioId: portfolioId
  });
  displayResult('Sell More Than Owned (Expected to Fail)', sellFailResult);
  
  // Test 14: Try to Buy with Insufficient Funds (Should Fail)
  const buyFailResult = await apiCall('/wallet/buy', 'POST', {
    userId: testUserId,
    ticker: 'AAPL',
    quantity: 10000,
    portfolioId: portfolioId
  });
  displayResult('Buy with Insufficient Funds (Expected to Fail)', buyFailResult);
  
  // Test 15: Get Final Wallet State
  const getFinalWalletResult = await apiCall(`/wallet/${testUserId}`);
  displayResult('Final Wallet State', getFinalWalletResult);
  
  console.log('\n' + '='.repeat(70));
  console.log('🎉 All Tests Completed!');
  console.log('='.repeat(70));
  console.log(`\nTest User ID: ${testUserId}`);
  console.log('You can view this user\'s data in the database or through the API.\n');
}

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Test execution failed:', error);
  process.exit(1);
});

