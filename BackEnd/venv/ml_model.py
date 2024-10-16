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

warnings.filterwarnings('ignore')

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
        df_bills['revenue'] = df_bills['product_quantity'] * df_bills['product_price']
        
        return df_bills
    except Exception as e:
        print(f"Error processing bills data: {e}")
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
    if len(product_data) > 0:
        try:
            if not isinstance(product_data.index, pd.DatetimeIndex):
                product_data.index = pd.date_range(start=product_data.index.min(), periods=len(product_data), freq='D')

            product_data = product_data.fillna(method='ffill')

            train_size = int(len(product_data) * 0.8)
            train, test = product_data[:train_size], product_data[train_size:]

            model = ARIMA(train, order=(1,1,1))
            results = model.fit()

            predictions = results.forecast(steps=len(test))

            mae = mean_absolute_error(test, predictions)
            rmse = np.sqrt(mean_squared_error(test, predictions))

            forecast = results.forecast(steps=30)

            avg_daily_sales = product_data.mean()
            safety_stock = avg_daily_sales * 7
            recommended_stock = int(forecast.sum() + safety_stock)

            return recommended_stock, mae, rmse
        except Exception as e:
            print(f"Error in prediction: {e}")
            return 0, None, None
    else:
        return 0, None, None

def generate_reports_for_user(df_bills):
    # Calculate sales data
    daily_sales = calculate_sales(df_bills, 'D')
    monthly_sales = calculate_sales(df_bills, 'M')
    yearly_sales = calculate_sales(df_bills, 'Y')

    # Generate sales graphs
    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(20, 5))
    daily_sales.plot(x='date', y='total_amount', ax=ax1)
    ax1.set_title("Daily Sales")
    monthly_sales.plot(x='date', y='total_amount', kind='bar', ax=ax2)
    ax2.set_title("Monthly Sales")
    yearly_sales.plot(x='date', y='total_amount', kind='bar', ax=ax3)
    ax3.set_title("Yearly Sales")
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

    # Predict next month's stock
    daily_product_sales = df_bills.groupby(['date', 'product_name'])['product_quantity'].sum().unstack(fill_value=0)
    predictions = {}
    for product in daily_product_sales.columns:
        recommended_stock, mae, rmse = predict_next_month(daily_product_sales[product])
        predictions[product] = {"recommended_stock": recommended_stock, "mae": mae, "rmse": rmse}

    # Generate product sales pie chart
    fig, ax = plt.subplots(figsize=(12, 8))
    product_sales = df_bills.groupby('product_name')['revenue'].sum()
    plt.pie(product_sales.values, labels=product_sales.index, autopct='%1.1f%%')
    plt.title("Product Sales Distribution")
    plt.axis('equal')
    plt.tight_layout()
    product_sales_pie = plot_to_base64(fig)
    plt.close(fig)

    return {
        "sales_graphs": sales_graphs,
        "top_products": top_products.to_dict(),
        "top_products_chart": top_products_chart,
        "product_demand_category": product_demand_category.to_dict(),
        "stock_predictions": predictions,
        "product_sales_pie": product_sales_pie
    }

def get_ml_predictions(db, user_id):
    try:
        # Fetch bills data for the specific user
        bills_data = fetch_bills_data(db, user_id)
        
        if not bills_data:
            return {"error": "No data found for the user"}

        df_bills = process_bills_data(bills_data)
        
        # Generate reports based on the user's data
        reports = generate_reports_for_user(df_bills)
        
        return reports
    except Exception as e:
        print(f"Error in get_ml_predictions: {e}")
        return {"error": f"An error occurred while generating predictions: {str(e)}"}

if __name__ == "__main__":
    db = connect_to_mongodb()
    if db:
        # For testing purposes, you can use a sample user_id
        sample_user_id = "sample_user_123"
        reports = get_ml_predictions(db, sample_user_id)
        print(json.dumps(reports, indent=2))
    else:
        print("Failed to connect to the database")

    # Clear any remaining plots
    plt.close('all')