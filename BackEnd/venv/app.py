from flask import Flask, request, jsonify, send_file, make_response
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from flask_cors import CORS
import os
import traceback
from pymongo.errors import PyMongoError
import csv
import io
from openpyxl import Workbook
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from datetime import datetime, timedelta
from datetime import datetime, timedelta
import uuid
import logging

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"], "methods": ["GET", "POST", "PUT", "DELETE"], "allow_headers": ["Content-Type", "Authorization"]}})

# Configuration
app.config['MONGO_URI'] = 'mongodb://localhost:27017/stocksmart'
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your_jwt_secret_key')

# Extensions
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
mongo = PyMongo(app)
users_collection = mongo.db.users
inventory_collection = mongo.db.inventory
bills_collection = mongo.db.bills
sales_collection = mongo.db.sales
daily_sales_collection = mongo.db.daily_sales
monthly_sales_collection = mongo.db.monthly_sales
yearly_sales_collection = mongo.db.yearly_sales

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Check if user already exists
        existing_user = users_collection.find_one({'email': data['email']})
        if existing_user:
            return jsonify({"error": "Email already registered"}), 400
        
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        user = {
            'name': data['name'],
            'email': data['email'],
            'phone': data['phone'],
            'password': hashed_password,
            'businessName': data.get('businessName', ''),
            'businessType': data.get('businessType', ''),
            'businessLocation': data.get('businessLocation', ''),
            'helplineNumber': data.get('helplineNumber', ''),
            'gstNumber': data.get('gstNumber', '')
        }

        result = users_collection.insert_one(user)
        user_id = str(result.inserted_id)

        return jsonify({"msg": "User registered successfully", "user_id": user_id}), 201
    except PyMongoError as e:
        app.logger.error(f"Database error during registration: {str(e)}")
        return jsonify({"error": "A database error occurred during registration"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error during registration: {str(e)}")
        return jsonify({"error": "An unexpected error occurred during registration"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        user = users_collection.find_one({'email': data['email']})
        
        if user and bcrypt.check_password_hash(user['password'], data['password']):
            access_token = create_access_token(identity=str(user['_id']))
            return jsonify(access_token=access_token), 200
        
        return jsonify({"error": "Invalid email or password"}), 401
    except PyMongoError as e:
        app.logger.error(f"Database error during login: {str(e)}")
        return jsonify({"error": "A database error occurred during login"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error during login: {str(e)}")
        return jsonify({"error": "An unexpected error occurred during login"}), 500

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def profile():
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        profile_data = {
            'name': user.get('name', ''),
            'email': user.get('email', ''),
            'phone': user.get('phone', ''),
            'businessName': user.get('businessName', ''),
            'businessType': user.get('businessType', ''),
            'businessLocation': user.get('businessLocation', ''),
            'helplineNumber': user.get('helplineNumber', ''),
            'gstNumber': user.get('gstNumber', '')
        }
        return jsonify(profile_data), 200
    except PyMongoError as e:
        app.logger.error(f"Database error while fetching profile: {str(e)}")
        return jsonify({"error": "A database error occurred while fetching the profile"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error while fetching profile: {str(e)}")
        return jsonify({"error": "An unexpected error occurred while fetching the profile"}), 500

@app.route('/api/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        data = request.json
        
        update_fields = [
            'name', 'email', 'phone', 'businessName', 'businessType', 
            'businessLocation', 'helplineNumber', 'gstNumber'
        ]
        
        update_data = {field: data.get(field, '') for field in update_fields if field in data}
        
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.modified_count > 0 or result.matched_count > 0:
            updated_user = users_collection.find_one({"_id": ObjectId(user_id)})
            if updated_user:
                updated_user['_id'] = str(updated_user['_id'])
                del updated_user['password']
                return jsonify({"msg": "Profile updated successfully", "user": updated_user}), 200
            else:
                return jsonify({"error": "User not found after update"}), 404
        else:
            return jsonify({"msg": "No changes made to the profile"}), 204
    except PyMongoError as e:
        app.logger.error(f"Database error while updating profile: {str(e)}")
        return jsonify({"error": "A database error occurred while updating the profile"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error while updating profile: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": "An unexpected error occurred while updating the profile", "details": str(e)}), 500

@app.route('/api/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        data = request.json
        old_password = data['oldPassword']
        new_password = data['newPassword']

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if user and bcrypt.check_password_hash(user['password'], old_password):
            hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"password": hashed_password}}
            )
            return jsonify({"msg": "Password changed successfully"}), 200
        else:
            return jsonify({"error": "Invalid old password"}), 400
    except PyMongoError as e:
        app.logger.error(f"Database error while changing password: {str(e)}")
        return jsonify({"error": "A database error occurred while changing the password"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error while changing password: {str(e)}")
        return jsonify({"error": "An unexpected error occurred while changing the password"}), 500

# New inventory-related routes

@app.route('/api/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    try:
        user_id = get_jwt_identity()
        # Fetch all products (both with and without user_id)
        inventory = list(inventory_collection.find({
            "$or": [
                {"user_id": {"$exists": False}},
                {"user_id": user_id}
            ]
        }))
        
        for item in inventory:
            item['_id'] = str(item['_id'])
            if 'product_id' not in item:
                item['product_id'] = str(item['_id'])
        
        return jsonify(inventory), 200
    except Exception as e:
        app.logger.error(f"Error fetching inventory: {str(e)}")
        return jsonify({"error": "Failed to fetch inventory"}), 500

@app.route('/api/inventory', methods=['POST'])
@jwt_required()
def add_product():
    try:
        user_id = get_jwt_identity()
        data = request.json
        data['user_id'] = user_id
        
        # Generate a unique product_id
        data['product_id'] = f"e{str(uuid.uuid4())[:8]}-gadget"
        
        result = inventory_collection.insert_one(data)
        return jsonify({
            "msg": "Product added successfully",
            "product_id": data['product_id']
        }), 201
    except Exception as e:
        app.logger.error(f"Error adding product: {str(e)}")
        return jsonify({"error": f"Failed to add product: {str(e)}"}), 500

@app.route('/api/inventory/<product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    try:
        user_id = get_jwt_identity()
        data = request.json
        
        # Remove _id from data if it exists
        if '_id' in data:
            del data['_id']
            
        result = inventory_collection.update_one(
            {
                "product_id": product_id,
                "user_id": user_id
            },
            {"$set": data}
        )
        
        if result.modified_count > 0:
            return jsonify({"msg": "Product updated successfully"}), 200
        elif result.matched_count > 0:
            return jsonify({"msg": "No changes made"}), 200
        else:
            return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        app.logger.error(f"Error updating product: {str(e)}")
        return jsonify({"error": f"Failed to update product: {str(e)}"}), 500

@app.route('/api/inventory/<product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    try:
        user_id = get_jwt_identity()
        result = inventory_collection.delete_one({
            "product_id": product_id,
            "user_id": user_id
        })
        
        if result.deleted_count > 0:
            return jsonify({"msg": "Product deleted successfully"}), 200
        else:
            return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        app.logger.error(f"Error deleting product: {str(e)}")
        return jsonify({"error": f"Failed to delete product: {str(e)}"}), 500

@app.route('/api/inventory/download', methods=['GET'])
@jwt_required()
def download_inventory():
    try:
        user_id = get_jwt_identity()
        inventory = list(inventory_collection.find({"user_id": user_id}))
        
        wb = Workbook()
        ws = wb.active
        ws.title = "Inventory"
        
        # Write header
        headers = ['Product ID', 'Product', 'Brand', 'Category', 'Cost Price', 'Selling Price', 'Quantity', 'Vendor Name', 'Vendor Phone', 'Vendor Address']
        ws.append(headers)
        
        # Write data
        for item in inventory:
            ws.append([
                str(item['_id']),
                item.get('product', ''),
                item.get('brand', ''),
                item.get('category', ''),
                item.get('cost_price', ''),
                item.get('selling_price', ''),
                item.get('quantity', ''),
                item.get('vendor', {}).get('name', ''),
                item.get('vendor', {}).get('phone', ''),
                item.get('vendor', {}).get('address', '')
            ])
        
        # Save to BytesIO object
        excel_file = BytesIO()
        wb.save(excel_file)
        excel_file.seek(0)
        
        return send_file(
            excel_file, 
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            attachment_filename='inventory.xlsx'
        )
        
    except PyMongoError as e:
        app.logger.error(f"Database error while downloading inventory: {str(e)}")
        return jsonify({"error": "A database error occurred"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error while downloading inventory: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

def calculate_sales():
    # Clear existing sales data
    daily_sales_collection.delete_many({})
    weekly_sales_collection.delete_many({})
    monthly_sales_collection.delete_many({})
    yearly_sales_collection.delete_many({})

    # Calculate daily sales
    start_date = datetime(2023, 9, 1)  # Start from September 2023
    end_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    current_date = start_date

    while current_date <= end_date:
        daily_bills = bills_collection.find({
            "date": {
                "$gte": current_date,
                "$lt": current_date + timedelta(days=1)
            }
        })

        daily_revenue = sum(bill['total_amount'] for bill in daily_bills)
        daily_profit = sum(bill['total_profit'] for bill in daily_bills)

        daily_sales_collection.insert_one({
            "date": current_date,
            "revenue": daily_revenue,
            "profit": daily_profit
        })

        current_date += timedelta(days=1)

    # Calculate weekly sales
    current_week_start = start_date - timedelta(days=start_date.weekday())

    while current_week_start <= end_date:
        week_end = current_week_start + timedelta(days=7)
        weekly_bills = bills_collection.find({
            "date": {
                "$gte": current_week_start,
                "$lt": week_end
            }
        })

        weekly_revenue = sum(bill['total_amount'] for bill in weekly_bills)
        weekly_profit = sum(bill['total_profit'] for bill in weekly_bills)

        weekly_sales_collection.insert_one({
            "date": current_week_start,
            "revenue": weekly_revenue,
            "profit": weekly_profit
        })

        current_week_start += timedelta(days=7)

    # Calculate monthly sales
    current_month_start = start_date.replace(day=1)

    while current_month_start <= end_date:
        next_month = current_month_start.replace(day=28) + timedelta(days=4)
        month_end = next_month - timedelta(days=next_month.day)
        monthly_bills = bills_collection.find({
            "date": {
                "$gte": current_month_start,
                "$lt": month_end + timedelta(days=1)
            }
        })

        monthly_revenue = sum(bill['total_amount'] for bill in monthly_bills)
        monthly_profit = sum(bill['total_profit'] for bill in monthly_bills)

        monthly_sales_collection.insert_one({
            "date": current_month_start,
            "revenue": monthly_revenue,
            "profit": monthly_profit
        })

        current_month_start = month_end + timedelta(days=1)

    # Calculate yearly sales
    current_year_start = start_date.replace(month=1, day=1)

    while current_year_start <= end_date:
        year_end = current_year_start.replace(month=12, day=31)
        yearly_bills = bills_collection.find({
            "date": {
                "$gte": current_year_start,
                "$lt": year_end + timedelta(days=1)
            }
        })

        yearly_revenue = sum(bill['total_amount'] for bill in yearly_bills)
        yearly_profit = sum(bill['total_profit'] for bill in yearly_bills)

        yearly_sales_collection.insert_one({
            "date": current_year_start,
            "revenue": yearly_revenue,
            "profit": yearly_profit
        })

        current_year_start = year_end + timedelta(days=1)

def update_sales_after_bill(bill):
    # Update daily sales
    daily_sale = daily_sales_collection.find_one({
        "date": bill['date'].replace(hour=0, minute=0, second=0, microsecond=0)
    })

    if daily_sale:
        daily_sales_collection.update_one(
            {"_id": daily_sale['_id']},
            {"$inc": {"revenue": bill['total_amount'], "profit": bill['total_profit']}}
        )
    else:
        daily_sales_collection.insert_one({
            "date": bill['date'].replace(hour=0, minute=0, second=0, microsecond=0),
            "revenue": bill['total_amount'],
            "profit": bill['total_profit']
        })

    # Update monthly sales
    month_start = bill['date'].replace(day=1)
    monthly_sale = monthly_sales_collection.find_one({
        "date": month_start
    })

    if monthly_sale:
        monthly_sales_collection.update_one(
            {"_id": monthly_sale['_id']},
            {"$inc": {"revenue": bill['total_amount'], "profit": bill['total_profit']}}
        )
    else:
        monthly_sales_collection.insert_one({
            "date": month_start,
            "revenue": bill['total_amount'],
            "profit": bill['total_profit']
        })

    # Update yearly sales
    year_start = bill['date'].replace(month=1, day=1)
    yearly_sale = yearly_sales_collection.find_one({
        "date": year_start
    })

    if yearly_sale:
        yearly_sales_collection.update_one(
            {"_id": yearly_sale['_id']},
            {"$inc": {"revenue": bill['total_amount'], "profit": bill['total_profit']}}
        )
    else:
        yearly_sales_collection.insert_one({
            "date": year_start,
            "revenue": bill['total_amount'],
            "profit": bill['total_profit']
        })
                
@app.route('/api/generate-bill', methods=['POST'])
@jwt_required()
def generate_bill():
    try:
        user_id = get_jwt_identity()
        data = request.json

        # Validate input data
        if not all(key in data for key in ['products', 'businessDetails']):
            return jsonify({"error": "Missing required fields"}), 400

        total_profit = 0
        total_amount = 0
        products_with_profit = []

        for product in data['products']:
            if not all(key in product for key in ['product', 'quantity', 'price']):
                return jsonify({"error": f"Invalid product data: {product}"}), 400

            inv_product = inventory_collection.find_one(
                {"user_id": user_id, "product": product['product']}
            )

            if not inv_product:
                return jsonify({"error": f"Product {product['product']} not found in inventory"}), 404

            cost_price = inv_product.get('cost_price', 0)
            selling_price = product['price']
            quantity = product['quantity']
            profit = (selling_price - cost_price) * quantity
            total_profit += profit
            total_amount += selling_price * quantity

            product_with_profit = product.copy()
            product_with_profit['profit'] = profit
            products_with_profit.append(product_with_profit)

            # Update inventory quantity
            new_quantity = inv_product['quantity'] - quantity
            if new_quantity < 0:
                return jsonify({"error": f"Insufficient stock for {product['product']}"}), 400

            inventory_collection.update_one(
                {"_id": inv_product['_id']},
                {"$set": {"quantity": new_quantity}}
            )

        # Create a new bill document
        bill = {
            'user_id': user_id,
            'date': datetime.now(),
            'products': products_with_profit,
            'total_amount': total_amount,
            'total_profit': total_profit,
            'business_details': data['businessDetails']
        }

        # Insert the bill into the database
        result = bills_collection.insert_one(bill)
        bill_id = str(result.inserted_id)

        # Update the sales collection
        update_sales_after_bill(bill)

        # Generate PDF
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        # Add content to PDF
        p.drawString(100, 750, f"Bill ID: {bill_id}")
        p.drawString(100, 730, f"Date: {bill['date'].strftime('%Y-%m-%d %H:%M:%S')}")
        p.drawString(100, 710, f"Business Name: {bill['business_details']['businessName']}")
        p.drawString(100, 690, f"GST Number: {bill['business_details']['gstNumber']}")

        y = 650
        for product in data['products']:
            p.drawString(100, y, f"{product['product']} - Qty: {product['quantity']} - Price: ₹{product['price']} - Total: ₹{product['quantity'] * product['price']}")
            y -= 20

        p.drawString(100, y-20, f"Total Amount: ₹{bill['total_amount']}")

        p.showPage()
        p.save()

        buffer.seek(0)

        response = make_response(buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename=bill_{bill_id}.pdf'

        return response

    except Exception as e:
        app.logger.error(f"Error generating bill: {str(e)}", exc_info=True)
        return jsonify({"error": "An error occurred while generating the bill"}), 500

@app.route('/api/sales', methods=['GET'])
@jwt_required()
def get_sales():
    try:
        user_id = get_jwt_identity()
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = today.replace(day=1)
        start_of_year = today.replace(month=1, day=1)

        # Update sales collections
        update_sales_collections()

        # Fetch Daily Sales
        daily = daily_sales_collection.find_one({"date": today}) or {"revenue": 0, "profit": 0}

        # Calculate Weekly Sales
        weekly = bills_collection.aggregate([
            {"$match": {"date": {"$gte": start_of_week}}},
            {"$group": {
                "_id": None,
                "revenue": {"$sum": "$total_amount"},
                "profit": {"$sum": "$total_profit"}
            }}
        ]).next()

        # Fetch Monthly Sales
        monthly = monthly_sales_collection.find_one({"date": start_of_month}) or {"revenue": 0, "profit": 0}

        # Fetch Yearly Sales
        yearly = yearly_sales_collection.find_one({"date": start_of_year}) or {"revenue": 0, "profit": 0}

        return jsonify({
            "daily": {"revenue": daily["revenue"], "profit": daily["profit"]},
            "weekly": {"revenue": weekly.get("revenue", 0), "profit": weekly.get("profit", 0)},
            "monthly": {"revenue": monthly["revenue"], "profit": monthly["profit"]},
            "yearly": {"revenue": yearly["revenue"], "profit": yearly["profit"]}
        }), 200

    except Exception as e:
        app.logger.error(f"Error fetching sales data: {str(e)}")
        return jsonify({"error": "An error occurred while fetching sales data"}), 500

@app.route('/api/test-db', methods=['GET'])
def test_db():
    try:
        result = inventory_collection.find_one()
        if result:
            return jsonify({"msg": "Database connection successful", "sample_id": str(result['_id'])}), 200
        else:
            return jsonify({"msg": "Database connected but no records found"}), 200
    except Exception as e:
        return jsonify({"error": f"Database connection failed: {str(e)}"}), 500

if __name__ == '__main__':
    calculate_sales()
    app.run(debug=True, port=5000)