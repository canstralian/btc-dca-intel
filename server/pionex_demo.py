#!/usr/bin/env python3
"""
Example usage of the Pionex Trading Client

This script demonstrates how to integrate the Pionex trading client
with the BTC DCA Intel platform for automated trading strategies.
"""

import asyncio
import os
import sys
from typing import Optional

# Add the server directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pionex_trade_client import (
    create_pionex_client,
    PionexDCAManager,
    DCAConfig,
    OrderSide
)


async def demo_basic_operations():
    """Demonstrate basic Pionex trading operations"""
    print("=== Pionex Trading Client Demo ===\n")
    
    try:
        # Create client (requires environment variables)
        print("1. Creating Pionex client...")
        async with create_pionex_client() as client:
            print("✓ Client created successfully\n")
            
            # Get account information
            print("2. Fetching account information...")
            try:
                account_info = await client.get_account_info()
                print(f"✓ Account info retrieved: {account_info}")
            except Exception as e:
                print(f"⚠ Account info failed (expected without real credentials): {e}")
            print()
            
            # Get Bitcoin ticker
            print("3. Fetching Bitcoin ticker...")
            try:
                ticker = await client.get_ticker("BTCUSDT")
                print(f"✓ Bitcoin ticker: {ticker}")
            except Exception as e:
                print(f"⚠ Ticker request failed (expected without real credentials): {e}")
            print()
            
    except ValueError as e:
        print(f"⚠ Configuration error: {e}")
        print("Please set the following environment variables:")
        print("- PIONEX_API_KEY")
        print("- PIONEX_API_SECRET") 
        print("- PIONEX_PASSPHRASE")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    return True


async def demo_dca_strategy():
    """Demonstrate DCA strategy creation and management"""
    print("=== DCA Strategy Demo ===\n")
    
    try:
        async with create_pionex_client() as client:
            # Create DCA manager
            dca_manager = PionexDCAManager(client)
            print("1. DCA Manager created\n")
            
            # Create intelligent DCA strategy
            print("2. Creating intelligent DCA strategy...")
            strategy_id = await dca_manager.create_intelligent_dca(
                symbol="BTCUSDT",
                weekly_amount=100.0,
                fear_greed_threshold=50
            )
            print(f"✓ Strategy created with ID: {strategy_id}\n")
            
            # Simulate DCA execution with different market conditions
            print("3. Simulating DCA execution under different market conditions...")
            
            # Extreme Fear scenario
            print("   Scenario 1: Extreme Fear (Fear & Greed Index: 15)")
            result = await dca_manager.execute_intelligent_dca(
                strategy_id=strategy_id,
                fear_greed_index=15
            )
            print(f"   Result: {result.message}")
            
            # Neutral scenario
            print("   Scenario 2: Neutral market (Fear & Greed Index: 50)")
            result = await dca_manager.execute_intelligent_dca(
                strategy_id=strategy_id,
                fear_greed_index=50
            )
            print(f"   Result: {result.message}")
            
            # Extreme Greed scenario
            print("   Scenario 3: Extreme Greed (Fear & Greed Index: 85)")
            result = await dca_manager.execute_intelligent_dca(
                strategy_id=strategy_id,
                fear_greed_index=85
            )
            print(f"   Result: {result.message}")
            
    except Exception as e:
        print(f"⚠ DCA demo failed (expected without real credentials): {e}")


async def demo_integration_with_platform():
    """Demonstrate integration with BTC DCA Intel platform data"""
    print("\n=== Platform Integration Demo ===\n")
    
    print("This demo shows how the Pionex client would integrate with:")
    print("1. Fear & Greed Index data from the platform")
    print("2. Market analysis from the ML service")
    print("3. User portfolio data")
    print("4. Historical DCA performance")
    print()
    
    # Simulate fetching data from the platform
    mock_fear_greed = 35  # Current Fear & Greed Index
    mock_ml_prediction = {"trend": "bullish", "confidence": 0.72}
    mock_portfolio = {"btc_holdings": 0.5, "total_invested": 2500}
    
    print(f"Current Fear & Greed Index: {mock_fear_greed}")
    print(f"ML Prediction: {mock_ml_prediction}")
    print(f"Portfolio: {mock_portfolio}")
    print()
    
    # Calculate intelligent DCA amount based on platform data
    base_amount = 100.0
    
    # Adjust based on Fear & Greed
    if mock_fear_greed < 25:
        adjustment = 1.5  # Buy more during fear
    elif mock_fear_greed > 75:
        adjustment = 0.5  # Buy less during greed
    else:
        adjustment = 1.0
    
    # Adjust based on ML prediction confidence
    if mock_ml_prediction["confidence"] > 0.8:
        if mock_ml_prediction["trend"] == "bullish":
            adjustment *= 1.2
        else:
            adjustment *= 0.8
    
    recommended_amount = base_amount * adjustment
    
    print(f"Recommended DCA amount: ${recommended_amount:.2f}")
    print(f"Adjustment factor: {adjustment:.2f}")
    print()
    
    print("This integration allows for:")
    print("- Market-condition-aware DCA execution")
    print("- ML-driven investment optimization")
    print("- Portfolio-balanced purchasing decisions")
    print("- Risk-adjusted trading strategies")


def print_configuration_help():
    """Print help for configuring the Pionex client"""
    print("\n=== Configuration Help ===\n")
    print("To use the Pionex Trading Client with real credentials:")
    print()
    print("1. Create a Pionex account at https://www.pionex.com")
    print("2. Generate API credentials in your account settings")
    print("3. Set the following environment variables:")
    print()
    print("   export PIONEX_API_KEY='your_api_key_here'")
    print("   export PIONEX_API_SECRET='your_api_secret_here'")
    print("   export PIONEX_PASSPHRASE='your_passphrase_here'")
    print()
    print("4. For testing, you can use Pionex's testnet:")
    print("   - Use testnet credentials")
    print("   - Set base URL to testnet endpoint")
    print()
    print("Security Notes:")
    print("- Never commit credentials to version control")
    print("- Use read-only API keys for monitoring")
    print("- Use trading keys only on secure servers")
    print("- Regularly rotate your API keys")
    print()


async def main():
    """Main demo function"""
    print("Pionex Trading Client Integration Demo")
    print("======================================\n")
    
    # Check if credentials are configured
    credentials_configured = all([
        os.getenv("PIONEX_API_KEY"),
        os.getenv("PIONEX_API_SECRET"),
        os.getenv("PIONEX_PASSPHRASE")
    ])
    
    if not credentials_configured:
        print("⚠ Pionex API credentials not configured.")
        print("Running demo with mock responses...\n")
    
    # Run demos
    await demo_basic_operations()
    await demo_dca_strategy()
    await demo_integration_with_platform()
    
    if not credentials_configured:
        print_configuration_help()
    
    print("\n=== Demo Complete ===")
    print("The Pionex Trading Client is ready for integration!")


if __name__ == "__main__":
    asyncio.run(main())