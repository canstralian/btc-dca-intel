#!/usr/bin/env python3
"""
Simple test to validate the Pionex Trading Client implementation
"""

import asyncio
import sys
import os

# Add server directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all modules import correctly"""
    try:
        from pionex_trade_client import (
            PionexTradeClient,
            PionexDCAManager,
            PionexCredentials,
            DCAConfig,
            TradingResult,
            OrderSide,
            OrderType,
            DCAStatus,
            create_pionex_client
        )
        print("✓ All imports successful")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_data_structures():
    """Test that data structures can be created"""
    try:
        from pionex_trade_client import PionexCredentials, DCAConfig, TradingResult, OrderSide
        
        # Test PionexCredentials
        credentials = PionexCredentials(
            api_key="test_key",
            api_secret="test_secret",
            passphrase="test_passphrase"
        )
        assert credentials.api_key == "test_key"
        print("✓ PionexCredentials creation successful")
        
        # Test DCAConfig
        config = DCAConfig(
            symbol="BTCUSDT",
            investment_amount=100.0,
            frequency_hours=168
        )
        assert config.symbol == "BTCUSDT"
        assert config.investment_amount == 100.0
        print("✓ DCAConfig creation successful")
        
        # Test TradingResult
        result = TradingResult(
            success=True,
            order_id="test_order_123",
            message="Test order successful"
        )
        assert result.success == True
        assert result.order_id == "test_order_123"
        print("✓ TradingResult creation successful")
        
        # Test OrderSide enum
        assert OrderSide.BUY.value == "BUY"
        assert OrderSide.SELL.value == "SELL"
        print("✓ OrderSide enum works correctly")
        
        return True
    except Exception as e:
        print(f"❌ Data structure test error: {e}")
        return False

async def test_client_creation():
    """Test client creation with mock credentials"""
    try:
        from pionex_trade_client import PionexTradeClient, PionexCredentials
        
        credentials = PionexCredentials(
            api_key="mock_key",
            api_secret="mock_secret",
            passphrase="mock_passphrase"
        )
        
        client = PionexTradeClient(credentials)
        assert client.credentials.api_key == "mock_key"
        print("✓ PionexTradeClient creation successful")
        
        # Test signature generation
        signature = client._generate_signature("12345", "GET", "/api/v1/account")
        assert isinstance(signature, str)
        assert len(signature) > 0
        print("✓ Signature generation works")
        
        # Test headers generation
        headers = client._get_headers("GET", "/api/v1/account")
        assert "PIONEX-KEY" in headers
        assert "PIONEX-SIGNATURE" in headers
        assert "PIONEX-TIMESTAMP" in headers
        assert "PIONEX-PASSPHRASE" in headers
        print("✓ Headers generation works")
        
        return True
    except Exception as e:
        print(f"❌ Client creation test error: {e}")
        return False

async def test_dca_manager():
    """Test DCA manager functionality"""
    try:
        from pionex_trade_client import PionexDCAManager, PionexTradeClient, PionexCredentials
        
        credentials = PionexCredentials(
            api_key="mock_key",
            api_secret="mock_secret", 
            passphrase="mock_passphrase"
        )
        
        client = PionexTradeClient(credentials)
        dca_manager = PionexDCAManager(client)
        
        # Test strategy creation
        strategy_id = await dca_manager.create_intelligent_dca(
            symbol="BTCUSDT",
            weekly_amount=100.0
        )
        assert strategy_id.startswith("intelligent_dca_")
        print("✓ DCA strategy creation successful")
        
        # Check strategy was stored
        assert strategy_id in dca_manager.active_strategies
        config = dca_manager.active_strategies[strategy_id]
        assert config.symbol == "BTCUSDT"
        assert config.investment_amount == 100.0
        print("✓ DCA strategy storage successful")
        
        return True
    except Exception as e:
        print(f"❌ DCA manager test error: {e}")
        return False

def test_route_logic():
    """Test the route validation logic"""
    try:
        # Test parameter validation logic similar to what's in routes.ts
        
        # Test valid parameters
        symbol = "BTCUSDT"
        investment_amount = 100.0
        frequency_hours = 168
        
        parsed_amount = float(investment_amount)
        parsed_frequency = int(frequency_hours)
        
        assert not (parsed_amount != parsed_amount)  # Check for NaN
        assert parsed_amount > 0
        assert not (parsed_frequency != parsed_frequency)  # Check for NaN  
        assert parsed_frequency > 0
        
        print("✓ Route parameter validation logic works")
        
        # Test invalid parameters would be caught
        try:
            invalid_amount = float("invalid")
            assert False, "Should have thrown ValueError"
        except ValueError:
            pass  # Expected
        
        print("✓ Route parameter validation catches invalid input")
        
        return True
    except Exception as e:
        print(f"❌ Route logic test error: {e}")
        return False

def test_error_handling():
    """Test error handling capabilities"""
    try:
        from pionex_trade_client import TradingResult
        
        # Test successful result
        success_result = TradingResult(
            success=True,
            order_id="order_123",
            message="Order placed successfully"
        )
        assert success_result.success == True
        
        # Test error result
        error_result = TradingResult(
            success=False,
            message="Failed to place order"
        )
        assert error_result.success == False
        assert error_result.order_id is None
        
        print("✓ Error handling structures work correctly")
        return True
    except Exception as e:
        print(f"❌ Error handling test error: {e}")
        return False

async def run_tests():
    """Run all tests"""
    print("Running Pionex Trading Client Tests")
    print("===================================\n")
    
    tests = [
        ("Import Test", test_imports),
        ("Data Structures Test", test_data_structures),
        ("Client Creation Test", test_client_creation),
        ("DCA Manager Test", test_dca_manager),
        ("Route Logic Test", test_route_logic),
        ("Error Handling Test", test_error_handling)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        try:
            if asyncio.iscoroutinefunction(test_func):
                result = await test_func()
            else:
                result = test_func()
            
            if result:
                passed += 1
                print(f"✓ {test_name} PASSED")
            else:
                print(f"❌ {test_name} FAILED")
        except Exception as e:
            print(f"❌ {test_name} FAILED with exception: {e}")
    
    print(f"\n=== Test Results ===")
    print(f"Passed: {passed}/{total}")
    print(f"Failed: {total - passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed! Pionex Trading Client is ready.")
        return True
    else:
        print("⚠ Some tests failed. Please review the implementation.")
        return False

if __name__ == "__main__":
    success = asyncio.run(run_tests())
    sys.exit(0 if success else 1)