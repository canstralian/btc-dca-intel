# Pionex Trading Client Configuration

## Overview

The Pionex Trading Client provides automated DCA (Dollar Cost Averaging) trading functionality for the BTC DCA Intel platform. It integrates with Pionex's API to execute intelligent trading strategies based on market conditions and platform analytics.

## Features

- **Automated DCA Execution**: Execute DCA strategies with configurable frequency and amounts
- **Market-Condition Awareness**: Adjust DCA amounts based on Fear & Greed Index
- **ML Integration**: Incorporate ML predictions into trading decisions
- **Portfolio Management**: Monitor and manage trading bot performance
- **Risk Management**: Built-in safeguards and error handling

## File Structure

```
server/
├── pionex_trade_client.py    # Main Pionex trading client
├── pionex_demo.py           # Example usage and integration demo
└── routes.ts                # API endpoints for Pionex integration
```

## Configuration

### Environment Variables

Set the following environment variables to configure the Pionex client:

```bash
export PIONEX_API_KEY='your_api_key_here'
export PIONEX_API_SECRET='your_api_secret_here'
export PIONEX_PASSPHRASE='your_passphrase_here'
```

### API Credentials

1. Create a Pionex account at https://www.pionex.com
2. Navigate to API Management in your account settings
3. Generate new API credentials with appropriate permissions:
   - **Read Permission**: For account info and market data
   - **Trade Permission**: For executing DCA orders (use with caution)
4. Save your credentials securely

### Testnet Configuration

For testing purposes, Pionex provides a testnet environment:

```python
credentials = PionexCredentials(
    api_key="testnet_key",
    api_secret="testnet_secret", 
    passphrase="testnet_passphrase",
    base_url="https://api-testnet.pionex.com"  # Testnet URL
)
```

## Usage Examples

### Basic DCA Execution

```python
import asyncio
from server.pionex_trade_client import create_pionex_client

async def execute_dca():
    async with create_pionex_client() as client:
        result = await client.execute_dca_strategy(
            symbol="BTCUSDT",
            usd_amount=100.0
        )
        print(f"DCA Result: {result}")

asyncio.run(execute_dca())
```

### Intelligent DCA with Market Conditions

```python
from server.pionex_trade_client import PionexDCAManager

async def intelligent_dca():
    async with create_pionex_client() as client:
        dca_manager = PionexDCAManager(client)
        
        # Create strategy
        strategy_id = await dca_manager.create_intelligent_dca(
            symbol="BTCUSDT",
            weekly_amount=100.0
        )
        
        # Execute with current market conditions
        result = await dca_manager.execute_intelligent_dca(
            strategy_id=strategy_id,
            fear_greed_index=35  # Current Fear & Greed Index
        )
        
        print(f"Intelligent DCA Result: {result}")
```

## API Integration

The server exposes the following endpoints for Pionex integration:

### GET /api/pionex/account
Get Pionex account information (requires authentication).

### POST /api/pionex/dca/create
Create a new DCA trading bot.

**Request Body:**
```json
{
  "symbol": "BTCUSDT",
  "investmentAmount": 100.0,
  "frequencyHours": 168
}
```

### POST /api/pionex/execute-dca
Execute a single DCA purchase.

**Request Body:**
```json
{
  "symbol": "BTCUSDT",
  "amount": 100.0
}
```

## Integration with BTC DCA Intel Platform

The Pionex client integrates with the platform's existing features:

### Fear & Greed Index Integration
```javascript
// Frontend: Fetch current Fear & Greed Index
const fearGreedResponse = await fetch('/api/fear-greed');
const { value: fearGreedIndex } = await fearGreedResponse.json();

// Execute DCA with market awareness
const dcaResponse = await fetch('/api/pionex/execute-dca', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: 'BTCUSDT',
    amount: calculateIntelligentAmount(fearGreedIndex)
  })
});
```

### ML Prediction Integration
```javascript
// Get ML prediction
const predictionResponse = await fetch('/api/ml/predict-price', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    timeframe: '7d',
    indicators: ['rsi', 'macd', 'bb']
  })
});

const prediction = await predictionResponse.json();

// Adjust DCA strategy based on prediction
const adjustedAmount = baseDCAAmount * prediction.confidence;
```

## Security Considerations

1. **API Key Security**:
   - Never commit API keys to version control
   - Use environment variables for credentials
   - Rotate API keys regularly
   - Use read-only keys for monitoring, trading keys only for execution

2. **Rate Limiting**:
   - The client implements built-in rate limiting (100ms between requests)
   - Respect Pionex's API rate limits to avoid account suspension

3. **Error Handling**:
   - All trading operations include comprehensive error handling
   - Failed trades are logged with detailed error messages
   - Network failures are handled with automatic retries

4. **Production Deployment**:
   - Use HTTPS for all API communications
   - Implement proper logging and monitoring
   - Set up alerts for failed trades or API errors
   - Regular backup of trading strategies and performance data

## Testing

Run the demo script to test the integration:

```bash
cd /home/runner/work/btc-dca-intel/btc-dca-intel
python3 server/pionex_demo.py
```

The demo will:
1. Test basic client functionality
2. Demonstrate DCA strategy creation
3. Show platform integration capabilities
4. Provide configuration guidance

## Troubleshooting

### Common Issues

1. **"ModuleNotFoundError: No module named 'aiohttp'"**
   ```bash
   pip install aiohttp
   ```

2. **"Invalid authentication credentials"**
   - Verify API credentials are correct
   - Check that API key has necessary permissions
   - Ensure passphrase matches the one used during key creation

3. **Rate limit exceeded**
   - Reduce request frequency
   - Implement exponential backoff
   - Check if multiple instances are running

### Debug Mode

Enable debug logging for troubleshooting:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Future Enhancements

1. **Advanced Trading Strategies**:
   - Grid trading integration
   - Martingale strategy support
   - Custom indicator-based trading

2. **Portfolio Optimization**:
   - Multi-asset DCA strategies
   - Risk-adjusted position sizing
   - Dynamic rebalancing

3. **Performance Analytics**:
   - Trade performance tracking
   - ROI calculation and reporting
   - Comparative analysis vs. manual trading

4. **Enhanced Security**:
   - Hardware security module integration
   - Multi-signature transaction support
   - Advanced audit logging

## Support

For issues specific to the Pionex Trading Client integration:
1. Check the troubleshooting section above
2. Review the demo script for usage examples
3. Verify API credentials and permissions
4. Check Pionex API documentation for changes

For Pionex API-specific issues:
- Visit Pionex's official documentation
- Contact Pionex support
- Check Pionex's status page for service issues