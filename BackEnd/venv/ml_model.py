import matplotlib
matplotlib.use('Agg')

import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import warnings
import io
import base64
from sklearn.metrics import mean_absolute_error, mean_squared_error
from pymongo import MongoClient
import json
import logging

warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def connect_to_mongodb():
    try:
        client = MongoClient('mongodb://localhost:27017/stocksmart')  # Update with your MongoDB connection string
        db = client['stocksmart']  # Update with your database name
        return db
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return None

def fetch_bills_data(db, user_id=None):
    try:
        bills_collection = db['bills']
        query = {'user_id': user_id} if user_id else {}
        bills_data = list(bills_collection.find(query))
        return bills_data
    except Exception as e:
        print(f"Error fetching bills data: {e}")
        return []

def fetch_inventory_data(db, user_id=None):
    try:
        inventory_collection = db['inventory']
        query = {'user_id': user_id} if user_id else {}
        inventory_data = list(inventory_collection.find(query))
        return inventory_data
    except Exception as e:
        print(f"Error fetching inventory data: {e}")
        return []

def process_bills_data(bills_data):
    try:
        df_bills = pd.json_normalize(bills_data)
        df_bills = df_bills.explode('products')
        
        if 'products' in df_bills.columns and isinstance(df_bills['products'].iloc[0], dict):
            df_bills['product_name'] = df_bills['products'].apply(lambda x: x.get('product', 'Unknown'))
            df_bills['product_quantity'] = df_bills['products'].apply(lambda x: x.get('quantity', 0))
            df_bills['product_price'] = df_bills['products'].apply(lambda x: x.get('price', 0))
        
        df_bills['date'] = pd.to_datetime(df_bills['date'])
        df_bills['total_amount'] = df_bills['product_quantity'] * df_bills['product_price']
        
        # Assuming a fixed profit margin of 20% for this example
        df_bills['total_profit'] = df_bills['total_amount'] * 0.2
        
        # Group by date and product_name to eliminate duplicates
        df_bills = df_bills.groupby(['date', 'product_name']).agg({
            'product_quantity': 'sum',
            'total_amount': 'sum',
            'total_profit': 'sum'
        }).reset_index()
        
        logger.debug(f"Processed bills data columns: {df_bills.columns}")
        return df_bills
    except Exception as e:
        logger.exception(f"Error processing bills data: {e}")
        return pd.DataFrame()

def process_inventory_data(inventory_data):
    try:
        df_inventory = pd.DataFrame(inventory_data)
        return df_inventory
    except Exception as e:
        print(f"Error processing inventory data: {e}")
        return pd.DataFrame()

def calculate_sales(data, freq):
    return data.groupby(pd.Grouper(key='date', freq=freq)).agg({
        'total_amount': 'sum',
        'total_profit': 'sum'
    }).reset_index()

def plot_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png')
    buf.seek(0)
    plt.close(fig)  # Close the figure to free up memory
    return base64.b64encode(buf.getvalue()).decode('utf-8')

def get_top_selling_products(df_bills, n=3):
    top_products = df_bills.groupby('product_name')['product_quantity'].sum().sort_values(ascending=False).head(n)
    return top_products

def categorize_demand(df_bills):
    product_demand = df_bills.groupby('product_name')['product_quantity'].sum().sort_values(ascending=False)
    
    def categorize(value):
        if value < product_demand.quantile(0.33):
            return "Low"
        elif value < product_demand.quantile(0.67):
            return "Medium"
        else:
            return "High"
    
    return product_demand.apply(categorize)

def predict_next_month(product_data):
    if len(product_data) > 12:  # Ensure we have enough data points
        try:
            # Resample to monthly frequency and sum the values
            product_data = product_data.resample('M').sum()

            # Remove any remaining zero values
            product_data = product_data[product_data > 0]

            if len(product_data) < 12:
                print(f"Insufficient non-zero monthly data points for prediction")
                return None, None, None

            train_size = int(len(product_data) * 0.8)
            train, test = product_data[:train_size], product_data[train_size:]

            model = ARIMA(train, order=(1,1,1))
            results = model.fit()

            predictions = results.forecast(steps=len(test))

            mae = mean_absolute_error(test, predictions)
            rmse = np.sqrt(mean_squared_error(test, predictions))

            # Forecast for the next month
            next_month_forecast = results.forecast(steps=1)[0]

            # Calculate safety stock (e.g., 20% of the forecast)
            safety_stock = next_month_forecast * 0.2

            # Round up to the nearest integer
            recommended_stock = max(int(np.ceil(next_month_forecast + safety_stock)), 1)

            return recommended_stock, mae, rmse
        except Exception as e:
            print(f"Error in prediction for product: {e}")
            return None, None, None
    else:
        print(f"Insufficient data for prediction")
        return None, None, None
        
def generate_reports_for_user(df_bills, df_inventory):
    # Calculate sales data
    daily_sales = calculate_sales(df_bills, 'D')
    monthly_sales = calculate_sales(df_bills, 'M')
    yearly_sales = calculate_sales(df_bills, 'Y')

    # Generate sales graphs
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))
    daily_sales.plot(x='date', y='total_amount', ax=ax1)
    ax1.set_title("Daily Sales")
    ax1.set_xlabel("Date")
    ax1.set_ylabel("Total Amount")
    
    monthly_sales.plot(x='date', y='total_amount', kind='bar', ax=ax2)
    ax2.set_title("Monthly Sales")
    ax2.set_xlabel("Month")
    ax2.set_ylabel("Total Amount")
    plt.tight_layout()
    sales_graphs = plot_to_base64(fig)
    plt.close(fig)

    # Get top selling products
    top_products = get_top_selling_products(df_bills)

    # Generate top products chart
    fig, ax = plt.subplots(figsize=(10, 6))
    top_products.plot(kind='bar', ax=ax)
    plt.title("Top 3 Selling Products")
    plt.xlabel("Product")
    plt.ylabel("Total Quantity Sold")
    plt.tight_layout()
    top_products_chart = plot_to_base64(fig)
    plt.close(fig)

    # Categorize product demand
    product_demand_category = categorize_demand(df_bills)

    # Prepare product demand data for frontend chart
    demand_counts = product_demand_category.value_counts()
    product_demand_data = [
        {"name": category, "value": count} 
        for category, count in demand_counts.items()
    ]

    daily_product_sales = df_bills.groupby(['date', 'product_name'])['product_quantity'].sum().unstack()
    predictions = {}
    for product in daily_product_sales.columns:
        recommended_stock, mae, rmse = predict_next_month(daily_product_sales[product])
        if recommended_stock is not None:
            predictions[product] = {"recommended_stock": recommended_stock, "mae": mae, "rmse": rmse}

    return {
        "sales_graphs": sales_graphs,
        "top_products": top_products.to_dict(),
        "top_products_chart": top_products_chart,
        "product_demand_category": product_demand_category.to_dict(),
        "product_demand_data": product_demand_data,
        "stock_predictions": predictions  # Ensure this is included
    }

def get_ml_predictions(db, user_id):
    try:
        # Fetch bills data for the specific user
        bills_data = fetch_bills_data(db, user_id)
        inventory_data = fetch_inventory_data(db, user_id)
        
        logger.debug(f"Fetched {len(bills_data)} bills and {len(inventory_data)} inventory records")

        if not bills_data:
            logger.warning("No bills data found for the user")
            return {"error": "No bills data found for the user"}

        df_bills = process_bills_data(bills_data)
        df_inventory = process_inventory_data(inventory_data) if inventory_data else None
        
        logger.debug(f"Processed bills data shape: {df_bills.shape}")
        if df_inventory is not None:
            logger.debug(f"Processed inventory data shape: {df_inventory.shape}")

        # Generate reports based on the user's data
        reports = generate_reports_for_user(df_bills, df_inventory)
        
        logger.debug(f"Generated reports keys: {reports.keys()}")
        
        return reports
    except Exception as e:
        logger.exception(f"Error in get_ml_predictions: {e}")
        return {"error": f"An error occurred while generating predictions: {str(e)}"}

    # Clear any remaining plots
    plt.close('all')