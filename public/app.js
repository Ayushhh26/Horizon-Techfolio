/**
 * Main Application Logic
 * Pure JavaScript - no frameworks
 */

// Application State
let currentUser = null;
let currentPortfolioId = null;
let authToken = null;

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Set default dates for backtest
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    document.getElementById('backtest-start-date').value = oneYearAgo.toISOString().split('T')[0];
    document.getElementById('backtest-end-date').value = today.toISOString().split('T')[0];

    // Attach form handlers
    document.getElementById('create-user-form').addEventListener('submit', handleCreateUser);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('portfolio-form').addEventListener('submit', handleCreatePortfolio);
    document.getElementById('search-stocks-form').addEventListener('submit', handleSearchStocks);
    document.getElementById('backtest-form').addEventListener('submit', handleRunBacktest);

    // Check if user is already logged in
    await checkAuthState();
    
    // Load dashboard data if authenticated
    if (authToken) {
        loadDashboard();
    } else {
        showSection('login');
    }

    // Load available stocks when portfolio section is shown
    document.getElementById('portfolio').addEventListener('click', () => {
        if (authToken && document.getElementById('stocks-grid').children.length === 0) {
            loadAvailableStocks();
        }
    });
}

// Authentication Management
async function checkAuthState() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        updateAuthUI(false);
        return;
    }

    try {
        authToken = token;
        const result = await api.verifyAuth();
        if (result.authenticated) {
            currentUser = result.user;
            updateAuthUI(true);
        } else {
            clearAuth();
            updateAuthUI(false);
        }
    } catch (error) {
        console.error('Auth verification failed:', error);
        clearAuth();
        updateAuthUI(false);
    }
}

function updateAuthUI(isAuthenticated) {
    if (isAuthenticated) {
        // Show authenticated UI
        document.getElementById('user-info-nav').style.display = 'inline-block';
        document.getElementById('user-name-display').textContent = currentUser.name || currentUser.userId;
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('signup-btn').style.display = 'none';
        
        // Show protected sections
        document.getElementById('portfolio-btn').style.display = 'inline-block';
        document.getElementById('search-stocks-btn').style.display = 'inline-block';
        document.getElementById('backtest-btn').style.display = 'inline-block';
        
        // Show dashboard content
        document.getElementById('dashboard-unauthorized').style.display = 'none';
        document.getElementById('dashboard-authorized').style.display = 'block';
    } else {
        // Show unauthenticated UI
        document.getElementById('user-info-nav').style.display = 'none';
        document.getElementById('login-btn').style.display = 'inline-block';
        document.getElementById('signup-btn').style.display = 'inline-block';
        
        // Hide protected sections
        document.getElementById('portfolio-btn').style.display = 'none';
        document.getElementById('search-stocks-btn').style.display = 'none';
        document.getElementById('backtest-btn').style.display = 'none';
        
        // Show login prompt
        document.getElementById('dashboard-unauthorized').style.display = 'block';
        document.getElementById('dashboard-authorized').style.display = 'none';
    }
}

function clearAuth() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
}

async function handleLogin(e) {
    e.preventDefault();
    const resultDiv = document.getElementById('login-result');
    resultDiv.className = 'result';
    resultDiv.innerHTML = '<span class="loading"></span> Logging in...';

    try {
        const userId = document.getElementById('login-user-id').value.trim();
        const password = document.getElementById('login-password').value;

        if (!userId || !password) {
            throw new Error('Please enter both user ID and password');
        }

        const result = await api.login(userId, password);
        
        // Store token and user info
        authToken = result.token;
        currentUser = result.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        resultDiv.className = 'result success show';
        resultDiv.innerHTML = `
            <h4>✅ Login Successful!</h4>
            <p>Welcome back, ${result.user.name}!</p>
        `;

        // Clear form
        e.target.reset();
        
        // Update UI
        updateAuthUI(true);
        
        // Load dashboard and redirect
        await loadDashboard();
        setTimeout(() => {
            showSection('dashboard');
        }, 1000);
    } catch (error) {
        resultDiv.className = 'result error show';
        resultDiv.innerHTML = `<h4>❌ Login Failed</h4><p>${error.message}</p>`;
    }
}

function handleLogout() {
    clearAuth();
    updateAuthUI(false);
    showSection('login');
    
    // Clear dashboard
    document.getElementById('user-info').innerHTML = '<p>No user loaded.</p>';
    document.getElementById('portfolios-list').innerHTML = '<p>No portfolios yet.</p>';
}

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event?.target?.classList.add('active');

    // Load available stocks when portfolio section is shown
    if (sectionId === 'portfolio' && authToken) {
        // Only load stocks if we're not viewing an existing portfolio
        if (!currentPortfolioId) {
            document.getElementById('portfolio-management').style.display = 'none';
            const portfolioFormContainer = document.getElementById('portfolio-form-container');
            if (portfolioFormContainer) {
                portfolioFormContainer.style.display = 'block';
            }
            loadAvailableStocks();
        }
    }
}

// Dashboard
async function loadDashboard() {
    if (!currentUser) {
        return;
    }

    try {
        // Load user info
        updateUserInfo(currentUser);
        
        // Load portfolios
        const response = await api.getUserPortfolios(currentUser.userId);
        // API returns { userId, portfolios: [], count: number }
        const portfolios = response.portfolios || response || [];
        displayPortfolios(Array.isArray(portfolios) ? portfolios : []);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // User info should still show if we have currentUser
        if (!currentUser) {
            document.getElementById('user-info').innerHTML = `<p>Error loading user info: ${error.message}</p>`;
        }
        document.getElementById('portfolios-list').innerHTML = `<p>Error loading portfolios: ${error.message}</p>`;
    }
}

function displayPortfolios(portfolios) {
    const portfoliosDiv = document.getElementById('portfolios-list');
    
    // Ensure portfolios is an array
    if (!Array.isArray(portfolios)) {
        console.error('Portfolios is not an array:', portfolios);
        portfoliosDiv.innerHTML = '<p>No portfolios yet. Create your first portfolio to get started!</p>';
        return;
    }
    
    if (portfolios.length === 0) {
        portfoliosDiv.innerHTML = '<p>No portfolios yet. Create your first portfolio to get started!</p>';
        return;
    }
    
    let html = '<ul style="list-style: none; padding: 0;">';
    portfolios.forEach(portfolio => {
        // Extract tickers from securities array
        let tickers = 'N/A';
        if (portfolio.securities && Array.isArray(portfolio.securities)) {
            tickers = portfolio.securities.map(s => {
                if (typeof s === 'string') return s;
                if (s.ticker) return s.ticker;
                if (s.symbol) return s.symbol;
                return s;
            }).filter(t => t).join(', ');
        }
        
        html += `
            <li style="padding: 1rem; margin-bottom: 0.5rem; background: var(--bg-color); border-radius: 6px; border: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s;"
                onclick="viewPortfolio('${portfolio.portfolioId}')"
                onmouseover="this.style.background='var(--hover-color)'"
                onmouseout="this.style.background='var(--bg-color)'">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <strong>Portfolio ID:</strong> ${portfolio.portfolioId}<br>
                        <strong>Horizon:</strong> ${portfolio.horizon} year(s)<br>
                        <strong>Stocks:</strong> ${tickers}<br>
                        <strong>Created:</strong> ${new Date(portfolio.createdAt || portfolio.created_at || Date.now()).toLocaleDateString()}
                    </div>
                    <button style="padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 1rem;"
                        onclick="event.stopPropagation(); viewPortfolio('${portfolio.portfolioId}')">
                        View Details
                    </button>
                </div>
            </li>
        `;
    });
    html += '</ul>';
    portfoliosDiv.innerHTML = html;
}

function createNewPortfolio() {
    // Clear current portfolio
    currentPortfolioId = null;
    localStorage.removeItem('currentPortfolioId');
    
    // Show portfolio form
    const portfolioFormContainer = document.getElementById('portfolio-form-container');
    if (portfolioFormContainer) {
        portfolioFormContainer.style.display = 'block';
    }
    
    // Hide portfolio management
    document.getElementById('portfolio-management').style.display = 'none';
    
    // Clear form
    document.getElementById('portfolio-form').reset();
    document.getElementById('portfolio-result').innerHTML = '';
    document.getElementById('selected-count').textContent = '0 selected';
    document.querySelectorAll('input[name="stock-selection"]').forEach(cb => cb.checked = false);
    
    // Switch to portfolio section
    showSection('portfolio');
    
    // Load available stocks
    if (authToken) {
        loadAvailableStocks();
    }
}

function viewPortfolio(portfolioId) {
    // Set current portfolio
    currentPortfolioId = portfolioId;
    localStorage.setItem('currentPortfolioId', portfolioId);
    
    // Hide the portfolio form container (in case it's visible)
    const portfolioFormContainer = document.getElementById('portfolio-form-container');
    if (portfolioFormContainer) {
        portfolioFormContainer.style.display = 'none';
    }
    
    // Switch to portfolio section
    showSection('portfolio');
    
    // Show portfolio management section
    document.getElementById('portfolio-management').style.display = 'block';
    
    // Load portfolio data
    loadPortfolioData(portfolioId);
}

// User Management
async function handleCreateUser(e) {
    e.preventDefault();
    const resultDiv = document.getElementById('user-result');
    resultDiv.className = 'result';
    resultDiv.innerHTML = '<span class="loading"></span> Creating account...';

    try {
        const userId = document.getElementById('user-id').value.trim();
        const name = document.getElementById('user-name').value.trim();
        const email = document.getElementById('user-email').value.trim() || null;
        const password = document.getElementById('user-password').value;

        if (!password || password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        const result = await api.createUser(userId, name, email, password);

        resultDiv.className = 'result success show';
        resultDiv.innerHTML = `
            <h4>✅ Account Created Successfully!</h4>
            <p><strong>User ID:</strong> ${result.userId}</p>
            <p><strong>Name:</strong> ${result.name}</p>
            ${result.email ? `<p><strong>Email:</strong> ${result.email}</p>` : ''}
            <p style="margin-top: 1rem;">You can now <a href="#" onclick="showSection('login'); return false;">login</a> with your user ID and password.</p>
        `;

        // Clear form
        e.target.reset();
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            showSection('login');
        }, 2000);
    } catch (error) {
        resultDiv.className = 'result error show';
        resultDiv.innerHTML = `<h4>❌ Error</h4><p>${error.message}</p>`;
    }
}

function updateUserInfo(user) {
    document.getElementById('user-info').innerHTML = `
        <p><strong>User ID:</strong> ${user.userId}</p>
        <p><strong>Name:</strong> ${user.name}</p>
        ${user.email ? `<p><strong>Email:</strong> ${user.email}</p>` : ''}
    `;
}

// Load Available Stocks
async function loadAvailableStocks() {
    const loadingDiv = document.getElementById('stocks-loading');
    const selectionDiv = document.getElementById('stocks-selection');
    const errorDiv = document.getElementById('stocks-error');
    const gridDiv = document.getElementById('stocks-grid');

    // Reset UI
    loadingDiv.style.display = 'block';
    selectionDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    try {
        const result = await api.getAvailableStocks();
        
        if (!result.stocks || result.stocks.length === 0) {
            throw new Error('No stocks available in database');
        }

        // Clear existing stocks
        gridDiv.innerHTML = '';

        // Create checkboxes for each stock
        result.stocks.forEach(stock => {
            const label = document.createElement('label');
            label.style.cssText = 'display: flex; align-items: center; padding: 0.5rem; cursor: pointer; border-radius: 4px;';
            label.onmouseover = function() { this.style.background = 'var(--hover-color)'; };
            label.onmouseout = function() { this.style.background = 'transparent'; };

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = stock.ticker;
            checkbox.name = 'stock-selection';
            checkbox.addEventListener('change', updateSelectedCount);

            const tickerSpan = document.createElement('span');
            tickerSpan.textContent = stock.ticker;
            tickerSpan.style.cssText = 'margin-left: 0.5rem; font-weight: bold;';

            const dataSpan = document.createElement('span');
            dataSpan.textContent = `(${stock.dataPoints || 0} days)`;
            dataSpan.style.cssText = 'margin-left: 0.5rem; font-size: 0.85rem; color: #666;';

            label.appendChild(checkbox);
            label.appendChild(tickerSpan);
            label.appendChild(dataSpan);
            gridDiv.appendChild(label);
        });

        loadingDiv.style.display = 'none';
        selectionDiv.style.display = 'block';
        updateSelectedCount();
    } catch (error) {
        console.error('Error loading stocks:', error);
        loadingDiv.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.querySelector('p').textContent = `Error loading stocks: ${error.message}. You can still enter tickers manually:`;
    }
}

function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('input[name="stock-selection"]:checked');
    const count = checkboxes.length;
    document.getElementById('selected-count').textContent = `${count} selected`;
    
    // Disable submit button if more than 20 selected
    const submitBtn = document.querySelector('#portfolio-form button[type="submit"]');
    if (count > 20) {
        submitBtn.disabled = true;
        submitBtn.title = 'Maximum 20 stocks allowed';
    } else {
        submitBtn.disabled = false;
        submitBtn.title = '';
    }
}

function selectAllStocks() {
    document.querySelectorAll('input[name="stock-selection"]').forEach(cb => cb.checked = true);
    updateSelectedCount();
}

function deselectAllStocks() {
    document.querySelectorAll('input[name="stock-selection"]').forEach(cb => cb.checked = false);
    updateSelectedCount();
}

// Portfolio Management
async function handleCreatePortfolio(e) {
    e.preventDefault();
    const resultDiv = document.getElementById('portfolio-result');
    resultDiv.className = 'result';
    resultDiv.innerHTML = '<span class="loading"></span> Creating portfolio...';

    try {
        // Use current logged-in user
        if (!currentUser) {
            throw new Error('Please login to create a portfolio');
        }
        
        const userId = currentUser.userId;
        const horizon = document.getElementById('horizon').value;

        // Get selected stocks from checkboxes
        const selectedCheckboxes = document.querySelectorAll('input[name="stock-selection"]:checked');
        let tickers = Array.from(selectedCheckboxes).map(cb => cb.value.toUpperCase());

        // Fallback to manual input if no stocks selected
        if (tickers.length === 0) {
            const fallbackInput = document.getElementById('tickers-fallback');
            if (fallbackInput && fallbackInput.value.trim()) {
                tickers = fallbackInput.value.split(',').map(t => t.trim().toUpperCase()).filter(t => t);
            }
        }

        if (tickers.length === 0) {
            throw new Error('Please select at least one stock');
        }

        if (tickers.length > 20) {
            throw new Error('Maximum 20 tickers allowed');
        }

        const result = await api.initializePortfolio(userId, tickers, horizon);
        
        currentPortfolioId = result.portfolioId;
        localStorage.setItem('currentPortfolioId', currentPortfolioId);

        resultDiv.className = 'result success show';
        resultDiv.innerHTML = `
            <h4>✅ Portfolio Created Successfully!</h4>
            <p><strong>Portfolio ID:</strong> ${result.portfolioId}</p>
            <p><strong>Horizon:</strong> ${result.horizon} year(s)</p>
            <p><strong>Securities:</strong> ${result.securities.length}</p>
            <button onclick="loadPortfolioData('${result.portfolioId}')">View Portfolio</button>
        `;

        // Show portfolio management section
        document.getElementById('portfolio-management').style.display = 'block';
        loadPortfolioData(result.portfolioId);
    } catch (error) {
        resultDiv.className = 'result error show';
        resultDiv.innerHTML = `<h4>❌ Error</h4><p>${error.message}</p>`;
    }
}

function showPortfolioTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.portfolio-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');

    // Load tab data
    if (currentPortfolioId) {
        loadPortfolioTabData(tabName, currentPortfolioId);
    }
}

async function loadPortfolioData(portfolioId) {
    if (!portfolioId) {
        console.error('No portfolio ID provided');
        return;
    }
    
    currentPortfolioId = portfolioId;
    
    // Show portfolio management section
    document.getElementById('portfolio-management').style.display = 'block';
    
    // Show signals tab by default
    showPortfolioTab('signals');
    
    // Load all tab data
    try {
        await Promise.all([
            loadPortfolioTabData('signals', portfolioId),
            loadPortfolioTabData('strategy', portfolioId),
            loadPortfolioTabData('performance', portfolioId),
            loadPortfolioTabData('paper-trading', portfolioId)
        ]);
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        document.getElementById('signals-content').innerHTML = `<p class="error">Error loading portfolio: ${error.message}</p>`;
    }
}

async function loadPortfolioTabData(tabName, portfolioId) {
    const contentDiv = document.getElementById(`${tabName}-content`);
    contentDiv.innerHTML = '<span class="loading"></span> Loading...';

    try {
        let data;
        switch(tabName) {
            case 'signals':
                data = await api.getPortfolioSignals(portfolioId);
                displaySignals(data);
                break;
            case 'strategy':
                data = await api.getPortfolioStrategy(portfolioId);
                displayStrategy(data);
                break;
            case 'performance':
                data = await api.getPortfolioPerformance(portfolioId);
                displayPerformance(data);
                break;
            case 'paper-trading':
                data = await api.getPaperTradingStatus(portfolioId);
                displayPaperTrading(data);
                break;
        }
    } catch (error) {
        contentDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

function displaySignals(data) {
    const contentDiv = document.getElementById('signals-content');
    
    if (!data.signals || data.signals.length === 0) {
        contentDiv.innerHTML = '<p>No signals available.</p>';
        return;
    }

    let html = '<table><thead><tr><th>Ticker</th><th>Signal</th><th>Strength</th><th>Price</th></tr></thead><tbody>';
    
    data.signals.forEach(signal => {
        const signalClass = signal.signal.toLowerCase();
        html += `
            <tr>
                <td><strong>${signal.ticker}</strong></td>
                <td><span class="signal-badge ${signalClass}">${signal.signal}</span></td>
                <td>${signal.strength || 'N/A'}</td>
                <td>$${signal.price ? signal.price.toFixed(2) : 'N/A'}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    contentDiv.innerHTML = html;
}

function displayStrategy(data) {
    const contentDiv = document.getElementById('strategy-content');
    
    let html = '<div class="card">';
    
    // Handle strategy object structure
    if (data.strategy) {
        if (typeof data.strategy === 'object') {
            // Strategy is an object with name, description, etc.
            html += `<h4>${data.strategy.name || 'N/A'}</h4>`;
            if (data.strategy.description) {
                html += `<p><strong>Description:</strong> ${data.strategy.description}</p>`;
            }
            if (data.strategy.frequency) {
                html += `<p><strong>Trading Frequency:</strong> ${data.strategy.frequency}</p>`;
            }
            if (data.strategy.indicators && Array.isArray(data.strategy.indicators)) {
                html += `<p><strong>Indicators Used:</strong> ${data.strategy.indicators.join(', ')}</p>`;
            }
        } else {
            // Strategy is a string
            html += `<h4>${data.strategy}</h4>`;
        }
    } else {
        html += `<h4>N/A</h4>`;
    }
    
    if (data.recommendation) {
        html += `<p><strong>Recommendation:</strong> ${data.recommendation}</p>`;
    }
    
    if (data.reasoning) {
        html += `<p><strong>Reasoning:</strong> ${data.reasoning}</p>`;
    }
    
    if (data.confidence !== undefined) {
        html += `<p><strong>Confidence:</strong> ${(data.confidence * 100).toFixed(0)}%</p>`;
    }
    
    html += '</div>';
    contentDiv.innerHTML = html;
}

function displayPerformance(data) {
    const contentDiv = document.getElementById('performance-content');
    
    let html = '<div class="card">';
    
    if (data.totalValue !== undefined) {
        html += `<p><strong>Total Portfolio Value:</strong> $${data.totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>`;
    }
    
    if (data.totalReturn !== undefined) {
        html += `<p><strong>Total Return:</strong> ${data.totalReturn.toFixed(2)}%</p>`;
    }
    
    if (data.positions && data.positions.length > 0) {
        html += '<h5>Positions:</h5><table><thead><tr><th>Ticker</th><th>Shares</th><th>Cost Basis</th><th>P&L</th></tr></thead><tbody>';
        data.positions.forEach(pos => {
            html += `
                <tr>
                    <td>${pos.ticker}</td>
                    <td>${pos.shares}</td>
                    <td>$${pos.avgCost ? pos.avgCost.toFixed(2) : '0.00'}</td>
                    <td>${pos.pnl ? pos.pnl.toFixed(2) : '0.00'}</td>
                </tr>
            `;
        });
        html += '</tbody></table>';
    }
    
    html += '</div>';
    contentDiv.innerHTML = html;
}

function displayPaperTrading(data) {
    const contentDiv = document.getElementById('paper-trading-content');
    
    let html = '<div class="card">';
    html += `<p><strong>Status:</strong> ${data.status || 'N/A'}</p>`;
    html += `<p><strong>Initial Value:</strong> $${data.initialValue ? data.initialValue.toLocaleString() : 'N/A'}</p>`;
    html += `<p><strong>Current Value:</strong> $${data.currentValue ? data.currentValue.toLocaleString() : 'N/A'}</p>`;
    html += `<p><strong>Total Return:</strong> ${data.totalReturn ? data.totalReturn.toFixed(2) + '%' : 'N/A'}</p>`;
    html += '</div>';
    
    contentDiv.innerHTML = html;
}

// Stock Search
async function handleSearchStocks(e) {
    e.preventDefault();
    const resultDiv = document.getElementById('stocks-result');
    resultDiv.className = 'result';
    resultDiv.innerHTML = '<span class="loading"></span> Searching stocks...';

    try {
        const symbolsInput = document.getElementById('stock-symbols').value.trim();
        
        if (!symbolsInput) {
            throw new Error('Please enter at least one stock symbol');
        }

        const symbols = symbolsInput.split(',').map(s => s.trim().toUpperCase()).filter(s => s);

        if (symbols.length === 0) {
            throw new Error('Please enter valid stock symbols');
        }

        const result = await api.searchStocks(symbols);
        
        resultDiv.className = 'result info show';
        
        let html = `<h4>Stock Search Results</h4>`;
        html += `<p><strong>Total:</strong> ${result.total} | <strong>Valid:</strong> ${result.valid} | <strong>Invalid:</strong> ${result.invalid}</p>`;
        
        if (result.results && result.results.length > 0) {
            html += '<table><thead><tr><th>Symbol</th><th>Status</th><th>Name</th><th>Exchange</th><th>Sector</th></tr></thead><tbody>';
            
            result.results.forEach(stock => {
                if (stock.valid) {
                    const meta = stock.metadata || {};
                    html += `
                        <tr>
                            <td><strong>${stock.symbol}</strong></td>
                            <td><span class="signal-badge buy">Valid</span></td>
                            <td>${meta.name || 'N/A'}</td>
                            <td>${meta.exchange || 'N/A'}</td>
                            <td>${meta.sector || 'N/A'}</td>
                        </tr>
                    `;
                } else {
                    html += `
                        <tr>
                            <td><strong>${stock.symbol}</strong></td>
                            <td><span class="signal-badge sell">Invalid</span></td>
                            <td colspan="3">${stock.error || 'Not found'}</td>
                        </tr>
                    `;
                }
            });
            
            html += '</tbody></table>';
        }
        
        resultDiv.innerHTML = html;
    } catch (error) {
        resultDiv.className = 'result error show';
        resultDiv.innerHTML = `<h4>❌ Error</h4><p>${error.message}</p>`;
    }
}

// Backtesting
async function handleRunBacktest(e) {
    e.preventDefault();
    const resultDiv = document.getElementById('backtest-result');
    resultDiv.className = 'result';
    resultDiv.innerHTML = '<span class="loading"></span> Running backtest...';

    try {
        const portfolioId = document.getElementById('backtest-portfolio-id').value.trim();
        const startDate = document.getElementById('backtest-start-date').value;
        const endDate = document.getElementById('backtest-end-date').value;

        const result = await api.runBacktest(portfolioId, startDate, endDate);
        
        resultDiv.className = 'result success show';
        
        let html = '<h4>✅ Backtest Results</h4>';
        
        if (result.metrics) {
            const metrics = result.metrics;
            html += '<div class="card">';
            html += `<p><strong>CAGR:</strong> ${metrics.cagr ? metrics.cagr.toFixed(2) + '%' : 'N/A'}</p>`;
            html += `<p><strong>Sharpe Ratio:</strong> ${metrics.sharpe ? metrics.sharpe.toFixed(2) : 'N/A'}</p>`;
            html += `<p><strong>Max Drawdown:</strong> ${metrics.maxDrawdown ? metrics.maxDrawdown.toFixed(2) + '%' : 'N/A'}</p>`;
            html += `<p><strong>Total Return:</strong> ${metrics.totalReturn ? metrics.totalReturn.toFixed(2) + '%' : 'N/A'}</p>`;
            html += '</div>';
        }
        
        resultDiv.innerHTML = html;
    } catch (error) {
        resultDiv.className = 'result error show';
        resultDiv.innerHTML = `<h4>❌ Error</h4><p>${error.message}</p>`;
    }
}

// Make functions available globally
window.showSection = showSection;
window.showPortfolioTab = showPortfolioTab;
window.loadPortfolioData = loadPortfolioData;
window.handleLogout = handleLogout;
window.selectAllStocks = selectAllStocks;
window.deselectAllStocks = deselectAllStocks;
window.viewPortfolio = viewPortfolio;
window.createNewPortfolio = createNewPortfolio;

