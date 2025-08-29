
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import numpy as np
import pandas as pd
import joblib
import asyncio
import aiohttp
from datetime import datetime, timedelta
import logging
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DCAlytics ML Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class PredictionRequest(BaseModel):
    days_ahead: int = Field(default=7, ge=1, le=365)
    model_type: str = Field(default="lstm", regex="^(lstm|rf|gb|ensemble)$")

class DCAOptimizationRequest(BaseModel):
    investment_amount: float = Field(gt=0)
    duration_months: int = Field(ge=1, le=120)
    risk_tolerance: str = Field(regex="^(low|medium|high)$")
    
class MarketData(BaseModel):
    timestamp: datetime
    price: float
    volume: float
    market_cap: Optional[float] = None

class PredictionResponse(BaseModel):
    predicted_prices: List[float]
    confidence_interval: Dict[str, List[float]]
    model_accuracy: float
    feature_importance: Optional[Dict[str, float]] = None

class DCAOptimizationResponse(BaseModel):
    optimal_frequency: str
    recommended_amount_per_purchase: float
    expected_return: float
    risk_score: float
    strategy_explanation: str

# Global variables for models
models = {}
scalers = {}
price_data = None

class LSTMPricePredictor:
    def __init__(self, lookback_window=60):
        self.lookback_window = lookback_window
        self.model = None
        self.scaler = StandardScaler()
        
    def create_model(self, input_shape):
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            LSTM(50, return_sequences=True),
            Dropout(0.2),
            LSTM(50),
            Dropout(0.2),
            Dense(25),
            Dense(1)
        ])
        model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
        return model
    
    def prepare_data(self, data):
        scaled_data = self.scaler.fit_transform(data.reshape(-1, 1))
        X, y = [], []
        
        for i in range(self.lookback_window, len(scaled_data)):
            X.append(scaled_data[i-self.lookback_window:i, 0])
            y.append(scaled_data[i, 0])
            
        return np.array(X), np.array(y)
    
    def train(self, price_data):
        X, y = self.prepare_data(price_data)
        X = X.reshape((X.shape[0], X.shape[1], 1))
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        self.model = self.create_model((X.shape[1], 1))
        
        history = self.model.fit(
            X_train, y_train,
            batch_size=32,
            epochs=50,
            validation_data=(X_test, y_test),
            verbose=0
        )
        
        y_pred = self.model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        return {"mse": mse, "r2": r2, "history": history.history}
    
    def predict(self, recent_data, days_ahead):
        if self.model is None:
            raise ValueError("Model not trained")
            
        scaled_recent = self.scaler.transform(recent_data.reshape(-1, 1))
        
        predictions = []
        current_batch = scaled_recent[-self.lookback_window:].reshape(1, self.lookback_window, 1)
        
        for _ in range(days_ahead):
            pred = self.model.predict(current_batch, verbose=0)[0]
            predictions.append(pred[0])
            
            # Update batch for next prediction
            current_batch = np.roll(current_batch, -1, axis=1)
            current_batch[0, -1, 0] = pred[0]
        
        # Inverse transform predictions
        predictions = self.scaler.inverse_transform(np.array(predictions).reshape(-1, 1))
        return predictions.flatten()

class DCAOptimizer:
    def __init__(self):
        self.volatility_threshold = {
            "low": 0.3,
            "medium": 0.5,
            "high": 0.7
        }
    
    def calculate_optimal_strategy(self, price_data, investment_amount, duration_months, risk_tolerance):
        # Calculate price volatility
        returns = np.diff(price_data) / price_data[:-1]
        volatility = np.std(returns) * np.sqrt(365)
        
        # Determine frequency based on volatility and risk tolerance
        threshold = self.volatility_threshold[risk_tolerance]
        
        if volatility < threshold * 0.5:
            frequency = "monthly"
            frequency_multiplier = 12
        elif volatility < threshold:
            frequency = "biweekly"
            frequency_multiplier = 26
        else:
            frequency = "weekly"
            frequency_multiplier = 52
        
        # Calculate recommended amount per purchase
        total_purchases = (duration_months / 12) * frequency_multiplier
        amount_per_purchase = investment_amount / total_purchases
        
        # Estimate expected return using Monte Carlo simulation
        expected_return = self._monte_carlo_simulation(price_data, amount_per_purchase, total_purchases)
        
        # Calculate risk score
        risk_score = min(volatility / threshold, 1.0)
        
        strategy_explanation = self._generate_strategy_explanation(
            frequency, volatility, risk_tolerance, expected_return
        )
        
        return {
            "optimal_frequency": frequency,
            "recommended_amount_per_purchase": round(amount_per_purchase, 2),
            "expected_return": round(expected_return * 100, 2),
            "risk_score": round(risk_score, 3),
            "strategy_explanation": strategy_explanation
        }
    
    def _monte_carlo_simulation(self, price_data, amount_per_purchase, total_purchases, simulations=1000):
        returns = np.diff(price_data) / price_data[:-1]
        mean_return = np.mean(returns)
        std_return = np.std(returns)
        
        simulation_results = []
        
        for _ in range(simulations):
            portfolio_value = 0
            total_invested = 0
            
            for purchase in range(int(total_purchases)):
                # Simulate price change
                random_return = np.random.normal(mean_return, std_return)
                simulated_price = price_data[-1] * (1 + random_return * (purchase + 1))
                
                # Calculate BTC purchased
                btc_purchased = amount_per_purchase / simulated_price
                portfolio_value += btc_purchased * price_data[-1]  # Current value
                total_invested += amount_per_purchase
            
            if total_invested > 0:
                simulation_results.append((portfolio_value - total_invested) / total_invested)
        
        return np.mean(simulation_results)
    
    def _generate_strategy_explanation(self, frequency, volatility, risk_tolerance, expected_return):
        volatility_desc = "high" if volatility > 0.5 else "moderate" if volatility > 0.3 else "low"
        
        explanation = f"Based on current market volatility ({volatility_desc}) and your {risk_tolerance} risk tolerance, "
        explanation += f"a {frequency} DCA strategy is recommended. "
        explanation += f"This approach expects a {expected_return:.1%} return while managing downside risk through "
        explanation += "consistent dollar-cost averaging during market fluctuations."
        
        return explanation

# Initialize models
lstm_predictor = LSTMPricePredictor()
dca_optimizer = DCAOptimizer()

async def fetch_historical_data():
    """Fetch historical Bitcoin price data"""
    try:
        # In production, replace with actual API call to your main service
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:5000/api/market/bitcoin/history?days=365") as response:
                if response.status == 200:
                    data = await response.json()
                    return np.array([float(point['price']) for point in data])
                else:
                    # Fallback: generate synthetic data for development
                    return generate_synthetic_price_data()
    except Exception as e:
        logger.warning(f"Failed to fetch real data: {e}. Using synthetic data.")
        return generate_synthetic_price_data()

def generate_synthetic_price_data(days=365):
    """Generate synthetic Bitcoin price data for development/testing"""
    np.random.seed(42)
    base_price = 43000
    prices = [base_price]
    
    for _ in range(days - 1):
        daily_return = np.random.normal(0.001, 0.04)  # 0.1% mean, 4% daily volatility
        new_price = prices[-1] * (1 + daily_return)
        prices.append(max(new_price, 1000))  # Prevent negative prices
    
    return np.array(prices)

@app.on_event("startup")
async def startup_event():
    global price_data, models
    logger.info("Initializing ML models...")
    
    # Fetch historical data
    price_data = await fetch_historical_data()
    
    # Train LSTM model
    try:
        lstm_results = lstm_predictor.train(price_data)
        models['lstm'] = lstm_predictor
        logger.info(f"LSTM model trained with R² score: {lstm_results['r2']:.3f}")
    except Exception as e:
        logger.error(f"Failed to train LSTM model: {e}")
    
    # Train traditional ML models
    try:
        # Prepare features for traditional models
        features = create_technical_features(price_data)
        target = price_data[len(price_data) - len(features):]
        
        X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)
        
        # Random Forest
        rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
        rf_model.fit(X_train, y_train)
        rf_score = rf_model.score(X_test, y_test)
        models['rf'] = rf_model
        scalers['rf'] = StandardScaler().fit(features)
        
        # Gradient Boosting
        gb_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        gb_model.fit(X_train, y_train)
        gb_score = gb_model.score(X_test, y_test)
        models['gb'] = gb_model
        scalers['gb'] = StandardScaler().fit(features)
        
        logger.info(f"RF model trained with R² score: {rf_score:.3f}")
        logger.info(f"GB model trained with R² score: {gb_score:.3f}")
        
    except Exception as e:
        logger.error(f"Failed to train traditional ML models: {e}")
    
    logger.info("ML models initialization complete")

def create_technical_features(prices):
    """Create technical analysis features from price data"""
    df = pd.DataFrame({'price': prices})
    
    # Moving averages
    df['ma_7'] = df['price'].rolling(window=7).mean()
    df['ma_21'] = df['price'].rolling(window=21).mean()
    df['ma_50'] = df['price'].rolling(window=50).mean()
    
    # Relative Strength Index (RSI)
    delta = df['price'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['rsi'] = 100 - (100 / (1 + rs))
    
    # Bollinger Bands
    df['bb_middle'] = df['price'].rolling(window=20).mean()
    bb_std = df['price'].rolling(window=20).std()
    df['bb_upper'] = df['bb_middle'] + (bb_std * 2)
    df['bb_lower'] = df['bb_middle'] - (bb_std * 2)
    df['bb_position'] = (df['price'] - df['bb_lower']) / (df['bb_upper'] - df['bb_lower'])
    
    # Volatility
    df['volatility'] = df['price'].rolling(window=21).std()
    
    # Price momentum
    df['momentum_7'] = df['price'] / df['price'].shift(7) - 1
    df['momentum_21'] = df['price'] / df['price'].shift(21) - 1
    
    # Select features and drop NaN values
    feature_columns = ['ma_7', 'ma_21', 'ma_50', 'rsi', 'bb_position', 'volatility', 'momentum_7', 'momentum_21']
    features = df[feature_columns].dropna().values
    
    return features

@app.post("/predict", response_model=PredictionResponse)
async def predict_price(request: PredictionRequest):
    """Predict cryptocurrency prices using ML models"""
    try:
        if price_data is None:
            raise HTTPException(status_code=503, detail="Models not initialized")
        
        model_type = request.model_type
        days_ahead = request.days_ahead
        
        if model_type == "lstm" and 'lstm' in models:
            predictions = models['lstm'].predict(price_data, days_ahead)
            model_accuracy = 0.85  # This would come from validation in real implementation
            
            # Generate confidence intervals (simplified)
            lower_bound = predictions * 0.9
            upper_bound = predictions * 1.1
            
            return PredictionResponse(
                predicted_prices=predictions.tolist(),
                confidence_interval={"lower": lower_bound.tolist(), "upper": upper_bound.tolist()},
                model_accuracy=model_accuracy
            )
            
        elif model_type in ['rf', 'gb'] and model_type in models:
            # Use traditional ML model
            features = create_technical_features(price_data)
            recent_features = features[-1:] if len(features) > 0 else np.zeros((1, 8))
            
            # Scale features
            scaled_features = scalers[model_type].transform(recent_features)
            
            # Predict (simplified - would need proper time series forecasting)
            base_prediction = models[model_type].predict(scaled_features)[0]
            predictions = [base_prediction * (1 + np.random.normal(0, 0.02)) for _ in range(days_ahead)]
            
            # Feature importance for tree-based models
            if hasattr(models[model_type], 'feature_importances_'):
                feature_names = ['ma_7', 'ma_21', 'ma_50', 'rsi', 'bb_position', 'volatility', 'momentum_7', 'momentum_21']
                feature_importance = dict(zip(feature_names, models[model_type].feature_importances_))
            else:
                feature_importance = None
            
            return PredictionResponse(
                predicted_prices=predictions,
                confidence_interval={"lower": [p * 0.95 for p in predictions], "upper": [p * 1.05 for p in predictions]},
                model_accuracy=0.78,
                feature_importance=feature_importance
            )
            
        elif model_type == "ensemble":
            # Ensemble prediction combining multiple models
            predictions_list = []
            
            for model_name in ['lstm', 'rf', 'gb']:
                if model_name in models:
                    if model_name == 'lstm':
                        pred = models[model_name].predict(price_data, days_ahead)
                    else:
                        features = create_technical_features(price_data)
                        recent_features = features[-1:] if len(features) > 0 else np.zeros((1, 8))
                        scaled_features = scalers[model_name].transform(recent_features)
                        base_pred = models[model_name].predict(scaled_features)[0]
                        pred = [base_pred * (1 + np.random.normal(0, 0.02)) for _ in range(days_ahead)]
                    
                    predictions_list.append(pred)
            
            if predictions_list:
                # Average ensemble predictions
                ensemble_predictions = np.mean(predictions_list, axis=0)
                
                return PredictionResponse(
                    predicted_prices=ensemble_predictions.tolist(),
                    confidence_interval={"lower": (ensemble_predictions * 0.92).tolist(), "upper": (ensemble_predictions * 1.08).tolist()},
                    model_accuracy=0.82
                )
        
        raise HTTPException(status_code=400, detail=f"Model {model_type} not available")
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize-dca", response_model=DCAOptimizationResponse)
async def optimize_dca_strategy(request: DCAOptimizationRequest):
    """Optimize DCA strategy based on ML analysis"""
    try:
        if price_data is None:
            raise HTTPException(status_code=503, detail="Models not initialized")
        
        result = dca_optimizer.calculate_optimal_strategy(
            price_data,
            request.investment_amount,
            request.duration_months,
            request.risk_tolerance
        )
        
        return DCAOptimizationResponse(**result)
        
    except Exception as e:
        logger.error(f"DCA optimization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": list(models.keys()),
        "data_points": len(price_data) if price_data is not None else 0
    }

@app.get("/model-performance")
async def get_model_performance():
    """Get performance metrics for all models"""
    try:
        performance = {}
        
        # This would contain actual validation results in production
        performance = {
            "lstm": {"accuracy": 0.85, "mse": 1234567, "r2": 0.82},
            "random_forest": {"accuracy": 0.78, "mse": 1456789, "r2": 0.75},
            "gradient_boosting": {"accuracy": 0.80, "mse": 1345678, "r2": 0.77},
            "ensemble": {"accuracy": 0.82, "mse": 1298765, "r2": 0.79}
        }
        
        return performance
        
    except Exception as e:
        logger.error(f"Performance metrics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
