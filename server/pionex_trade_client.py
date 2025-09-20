#!/usr/bin/env python3
"""
Pionex Trading Client for BTC DCA Intel Platform

This module provides a Python client for interacting with Pionex's trading API,
specifically focused on Dollar Cost Averaging (DCA) strategies for Bitcoin.

Pionex is a cryptocurrency trading platform that offers automated trading bots,
including DCA bots, which are relevant to this BTC DCA intelligence platform.
"""

import asyncio
import hashlib
import hmac
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import aiohttp
import os
from dataclasses import dataclass
from enum import Enum


logger = logging.getLogger(__name__)


class OrderSide(Enum):
    """Order side enumeration"""
    BUY = "BUY"
    SELL = "SELL"


class OrderType(Enum):
    """Order type enumeration"""
    MARKET = "MARKET"
    LIMIT = "LIMIT"


class DCAStatus(Enum):
    """DCA bot status enumeration"""
    RUNNING = "RUNNING"
    STOPPED = "STOPPED"
    PAUSED = "PAUSED"


@dataclass
class PionexCredentials:
    """Pionex API credentials"""
    api_key: str
    api_secret: str
    passphrase: str
    base_url: str = "https://api.pionex.com"


@dataclass
class DCAConfig:
    """DCA bot configuration"""
    symbol: str
    investment_amount: float
    frequency_hours: int
    target_amount: Optional[float] = None
    max_price: Optional[float] = None
    min_price: Optional[float] = None


@dataclass
class TradingResult:
    """Trading operation result"""
    success: bool
    order_id: Optional[str] = None
    message: str = ""
    data: Optional[Dict] = None


class PionexTradeClient:
    """
    Pionex Trading Client for automated DCA strategies
    
    This client provides functionality to:
    - Create and manage DCA bots
    - Execute market orders
    - Monitor portfolio performance
    - Integrate with BTC DCA intelligence data
    """
    
    def __init__(self, credentials: PionexCredentials):
        """
        Initialize the Pionex trading client
        
        Args:
            credentials: Pionex API credentials
        """
        self.credentials = credentials
        self.session = None
        self.rate_limit_delay = 0.1  # 100ms between requests
        self.last_request_time = 0
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    def _generate_signature(self, timestamp: str, method: str, path: str, body: str = "") -> str:
        """
        Generate API signature for authentication
        
        Args:
            timestamp: Request timestamp
            method: HTTP method
            path: API endpoint path
            body: Request body
            
        Returns:
            HMAC signature
        """
        message = timestamp + method.upper() + path + body
        signature = hmac.new(
            self.credentials.api_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    def _get_headers(self, method: str, path: str, body: str = "") -> Dict[str, str]:
        """
        Get request headers with authentication
        
        Args:
            method: HTTP method
            path: API endpoint path
            body: Request body
            
        Returns:
            Request headers
        """
        timestamp = str(int(time.time() * 1000))
        signature = self._generate_signature(timestamp, method, path, body)
        
        return {
            "PIONEX-KEY": self.credentials.api_key,
            "PIONEX-SIGNATURE": signature,
            "PIONEX-TIMESTAMP": timestamp,
            "PIONEX-PASSPHRASE": self.credentials.passphrase,
            "Content-Type": "application/json"
        }
    
    async def _rate_limit(self):
        """Implement rate limiting"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.rate_limit_delay:
            await asyncio.sleep(self.rate_limit_delay - time_since_last)
        self.last_request_time = time.time()
    
    async def _request(self, method: str, endpoint: str, params: Optional[Dict] = None, 
                      data: Optional[Dict] = None) -> Dict:
        """
        Make authenticated API request
        
        Args:
            method: HTTP method
            endpoint: API endpoint
            params: Query parameters
            data: Request body data
            
        Returns:
            API response data
            
        Raises:
            Exception: If request fails
        """
        await self._rate_limit()
        
        url = f"{self.credentials.base_url}{endpoint}"
        body = json.dumps(data) if data else ""
        headers = self._get_headers(method, endpoint, body)
        
        try:
            async with self.session.request(
                method=method,
                url=url,
                headers=headers,
                params=params,
                data=body if body else None,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                response_data = await response.json()
                
                if response.status != 200:
                    logger.error(f"API request failed: {response.status} - {response_data}")
                    raise Exception(f"API request failed: {response_data.get('message', 'Unknown error')}")
                
                return response_data
                
        except aiohttp.ClientError as e:
            logger.error(f"HTTP client error: {e}")
            raise Exception(f"HTTP client error: {e}")
    
    async def get_account_info(self) -> Dict:
        """
        Get account information and balances
        
        Returns:
            Account information
        """
        try:
            response = await self._request("GET", "/api/v1/account")
            return response
        except Exception as e:
            logger.error(f"Failed to get account info: {e}")
            raise
    
    async def get_ticker(self, symbol: str) -> Dict:
        """
        Get ticker information for a symbol
        
        Args:
            symbol: Trading pair symbol (e.g., "BTCUSDT")
            
        Returns:
            Ticker data
        """
        try:
            params = {"symbol": symbol}
            response = await self._request("GET", "/api/v1/ticker/24hr", params=params)
            return response
        except Exception as e:
            logger.error(f"Failed to get ticker for {symbol}: {e}")
            raise
    
    async def create_market_order(self, symbol: str, side: OrderSide, 
                                 quantity: Optional[float] = None,
                                 quote_quantity: Optional[float] = None) -> TradingResult:
        """
        Create a market order
        
        Args:
            symbol: Trading pair symbol (e.g., "BTCUSDT")
            side: Order side (BUY/SELL)
            quantity: Base asset quantity
            quote_quantity: Quote asset quantity (for BUY orders)
            
        Returns:
            Trading result
        """
        try:
            order_data = {
                "symbol": symbol,
                "side": side.value,
                "type": OrderType.MARKET.value,
                "timestamp": int(time.time() * 1000)
            }
            
            if quantity:
                order_data["quantity"] = str(quantity)
            elif quote_quantity:
                order_data["quoteOrderQty"] = str(quote_quantity)
            else:
                raise ValueError("Either quantity or quote_quantity must be specified")
            
            response = await self._request("POST", "/api/v1/order", data=order_data)
            
            return TradingResult(
                success=True,
                order_id=response.get("orderId"),
                message="Order placed successfully",
                data=response
            )
            
        except Exception as e:
            logger.error(f"Failed to create market order: {e}")
            return TradingResult(
                success=False,
                message=f"Failed to create order: {e}"
            )
    
    async def create_dca_bot(self, config: DCAConfig) -> TradingResult:
        """
        Create a DCA (Dollar Cost Averaging) bot
        
        Args:
            config: DCA bot configuration
            
        Returns:
            Trading result
        """
        try:
            # Note: This is a conceptual implementation as Pionex's actual DCA bot API 
            # may have different endpoints and parameters
            bot_data = {
                "symbol": config.symbol,
                "investmentAmount": str(config.investment_amount),
                "frequency": config.frequency_hours,
                "timestamp": int(time.time() * 1000)
            }
            
            if config.target_amount:
                bot_data["targetAmount"] = str(config.target_amount)
            if config.max_price:
                bot_data["maxPrice"] = str(config.max_price)
            if config.min_price:
                bot_data["minPrice"] = str(config.min_price)
            
            # Placeholder endpoint - actual Pionex API may differ
            response = await self._request("POST", "/api/v1/dca/create", data=bot_data)
            
            return TradingResult(
                success=True,
                order_id=response.get("botId"),
                message="DCA bot created successfully",
                data=response
            )
            
        except Exception as e:
            logger.error(f"Failed to create DCA bot: {e}")
            return TradingResult(
                success=False,
                message=f"Failed to create DCA bot: {e}"
            )
    
    async def get_dca_bots(self) -> List[Dict]:
        """
        Get list of active DCA bots
        
        Returns:
            List of DCA bot information
        """
        try:
            response = await self._request("GET", "/api/v1/dca/list")
            return response.get("bots", [])
        except Exception as e:
            logger.error(f"Failed to get DCA bots: {e}")
            return []
    
    async def stop_dca_bot(self, bot_id: str) -> TradingResult:
        """
        Stop a DCA bot
        
        Args:
            bot_id: DCA bot ID
            
        Returns:
            Trading result
        """
        try:
            data = {
                "botId": bot_id,
                "timestamp": int(time.time() * 1000)
            }
            
            response = await self._request("POST", "/api/v1/dca/stop", data=data)
            
            return TradingResult(
                success=True,
                message="DCA bot stopped successfully",
                data=response
            )
            
        except Exception as e:
            logger.error(f"Failed to stop DCA bot: {e}")
            return TradingResult(
                success=False,
                message=f"Failed to stop DCA bot: {e}"
            )
    
    async def execute_dca_strategy(self, symbol: str, usd_amount: float) -> TradingResult:
        """
        Execute a single DCA purchase
        
        Args:
            symbol: Trading pair symbol (e.g., "BTCUSDT")
            usd_amount: USD amount to invest
            
        Returns:
            Trading result
        """
        try:
            # Get current price for logging
            ticker = await self.get_ticker(symbol)
            current_price = float(ticker.get("price", 0))
            
            logger.info(f"Executing DCA: ${usd_amount} for {symbol} at ~${current_price}")
            
            # Execute market buy order
            result = await self.create_market_order(
                symbol=symbol,
                side=OrderSide.BUY,
                quote_quantity=usd_amount
            )
            
            if result.success:
                logger.info(f"DCA execution successful: Order ID {result.order_id}")
            else:
                logger.error(f"DCA execution failed: {result.message}")
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to execute DCA strategy: {e}")
            return TradingResult(
                success=False,
                message=f"Failed to execute DCA strategy: {e}"
            )


class PionexDCAManager:
    """
    High-level DCA strategy manager using Pionex
    
    This class provides intelligent DCA execution based on market conditions
    and integrates with the BTC DCA Intel platform's analytics.
    """
    
    def __init__(self, client: PionexTradeClient):
        """
        Initialize DCA manager
        
        Args:
            client: Pionex trading client
        """
        self.client = client
        self.active_strategies: Dict[str, DCAConfig] = {}
    
    async def create_intelligent_dca(self, symbol: str, weekly_amount: float,
                                   fear_greed_threshold: int = 50) -> str:
        """
        Create an intelligent DCA strategy that adjusts based on market conditions
        
        Args:
            symbol: Trading pair symbol
            weekly_amount: Weekly investment amount
            fear_greed_threshold: Fear & Greed index threshold for adjustments
            
        Returns:
            Strategy ID
        """
        strategy_id = f"intelligent_dca_{symbol}_{int(time.time())}"
        
        config = DCAConfig(
            symbol=symbol,
            investment_amount=weekly_amount,
            frequency_hours=168  # Weekly
        )
        
        self.active_strategies[strategy_id] = config
        
        logger.info(f"Created intelligent DCA strategy: {strategy_id}")
        return strategy_id
    
    async def execute_intelligent_dca(self, strategy_id: str, 
                                    fear_greed_index: Optional[int] = None) -> TradingResult:
        """
        Execute DCA with intelligence based on market conditions
        
        Args:
            strategy_id: Strategy identifier
            fear_greed_index: Current Fear & Greed index (0-100)
            
        Returns:
            Trading result
        """
        if strategy_id not in self.active_strategies:
            return TradingResult(
                success=False,
                message=f"Strategy {strategy_id} not found"
            )
        
        config = self.active_strategies[strategy_id]
        amount = config.investment_amount
        
        # Adjust amount based on Fear & Greed index
        if fear_greed_index is not None:
            if fear_greed_index < 25:  # Extreme Fear - buy more
                amount *= 1.5
                logger.info(f"Extreme Fear detected ({fear_greed_index}), increasing DCA by 50%")
            elif fear_greed_index > 75:  # Extreme Greed - buy less
                amount *= 0.5
                logger.info(f"Extreme Greed detected ({fear_greed_index}), reducing DCA by 50%")
        
        return await self.client.execute_dca_strategy(config.symbol, amount)


# Factory function for easy client creation
def create_pionex_client() -> PionexTradeClient:
    """
    Create Pionex trading client from environment variables
    
    Required environment variables:
    - PIONEX_API_KEY
    - PIONEX_API_SECRET
    - PIONEX_PASSPHRASE
    
    Returns:
        Configured Pionex trading client
        
    Raises:
        ValueError: If required environment variables are missing
    """
    api_key = os.getenv("PIONEX_API_KEY")
    api_secret = os.getenv("PIONEX_API_SECRET")
    passphrase = os.getenv("PIONEX_PASSPHRASE")
    
    if not all([api_key, api_secret, passphrase]):
        raise ValueError(
            "Missing required environment variables: "
            "PIONEX_API_KEY, PIONEX_API_SECRET, PIONEX_PASSPHRASE"
        )
    
    credentials = PionexCredentials(
        api_key=api_key,
        api_secret=api_secret,
        passphrase=passphrase
    )
    
    return PionexTradeClient(credentials)


# Example usage
async def main():
    """Example usage of the Pionex trading client"""
    try:
        # Create client from environment variables
        async with create_pionex_client() as client:
            # Get account information
            account = await client.get_account_info()
            print(f"Account info: {account}")
            
            # Create DCA manager
            dca_manager = PionexDCAManager(client)
            
            # Create intelligent DCA strategy
            strategy_id = await dca_manager.create_intelligent_dca(
                symbol="BTCUSDT",
                weekly_amount=100.0
            )
            
            # Execute DCA with current market conditions
            result = await dca_manager.execute_intelligent_dca(
                strategy_id=strategy_id,
                fear_greed_index=30  # Assuming current Fear & Greed index
            )
            
            print(f"DCA execution result: {result}")
            
    except Exception as e:
        logger.error(f"Example execution failed: {e}")


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run example
    asyncio.run(main())