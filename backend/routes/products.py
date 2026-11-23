import os
from decimal import Decimal
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from backend.extensions import db
from backend.models import Product, FarmerProfile, Category

products_bp = Blueprint('products', __name__)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@products_bp.route('', methods=['GET'])
def get_products():
    category_id = request.args.get('category_id', type=int)
    search = request.args.get('search', '').strip()
    location = request.args.get('location', '').strip()
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    sort_by = request.args.get('sort_by', 'newest')  # newest, price_asc, price_desc
    only_organic = request.args.get('is_organic', type=lambda v: v.lower() == 'true')
    farmer_id = request.args.get('farmer_id', type=int)

    query = Product.query.filter(Product.is_available == True, Product.available_quantity > 0)

    if category_id:
        query = query.filter(Product.category_id == category_id)
    if farmer_id:
        query = query.filter(Product.farmer_id == farmer_id)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_filter)) |
            (Product.description.ilike(search_filter)) |
            (Product.location.ilike(search_filter))
        )
    if location:
        query = query.filter(Product.location.ilike(f"%{location}%"))
    if min_price is not None:
        query = query.filter(Product.price >= Decimal(str(min_price)))
    if max_price is not None:
        query = query.filter(Product.price <= Decimal(str(max_price)))
    if only_organic:
        query = query.filter(Product.is_organic == True)

    if sort_by == 'price_asc':
        query = query.order_by(Product.price.asc())
    elif sort_by == 'price_desc':
        query = query.order_by(Product.price.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    products = query.all()
    return jsonify({'products': [p.to_dict() for p in products]}), 200

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'product': product.to_dict()}), 200

@products_bp.route('/upload-image', methods=['POST'])
@jwt_required()
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected image file'}), 400
    if file and allowed_file(file.filename):
        os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
        filename = secure_filename(f"{int(datetime.utcnow().timestamp())}_{file.filename}")
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        image_url = f"/uploads/{filename}"
        return jsonify({'image_url': image_url, 'message': 'Image uploaded successfully'}), 201
    return jsonify({'error': 'File type not allowed'}), 400

@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    if claims.get('role') != 'farmer':
        return jsonify({'error': 'Only registered farmers can add products'}), 403

    farmer = FarmerProfile.query.filter_by(user_id=user_id).first()
    if not farmer:
        return jsonify({'error': 'Farmer profile not found'}), 404

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    category_id = data.get('category_id')
    price = data.get('price')
    unit = data.get('unit', 'kg').strip()
    available_quantity = data.get('available_quantity', 0)
    location = data.get('location', '').strip() or f"{farmer.village}, {farmer.district}"
    description = data.get('description', '').strip()
    image_url = data.get('image_url', '').strip()
    is_organic = bool(data.get('is_organic', False))
    harvest_date_str = data.get('harvest_date')

    if not name or not category_id or price is None or available_quantity is None:
        return jsonify({'error': 'Name, category, price and quantity are required'}), 400

    try:
        harvest_date = datetime.strptime(harvest_date_str, '%Y-%m-%d').date() if harvest_date_str else None
        product = Product(
            farmer_id=farmer.id,
            category_id=category_id,
            name=name,
            description=description,
            image_url=image_url or '/placeholder-produce.jpg',
            price=Decimal(str(price)),
            unit=unit,
            available_quantity=Decimal(str(available_quantity)),
            location=location,
            harvest_date=harvest_date,
            is_organic=is_organic,
            is_available=True
        )
        db.session.add(product)
        db.session.commit()
        return jsonify({'message': 'Product added successfully', 'product': product.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create product: {str(e)}'}), 500

@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    if claims.get('role') != 'farmer':
        return jsonify({'error': 'Unauthorized'}), 403

    farmer = FarmerProfile.query.filter_by(user_id=user_id).first()
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    if product.farmer_id != farmer.id:
        return jsonify({'error': 'Cannot edit products from another farm'}), 403

    data = request.get_json() or {}
    if 'name' in data:
        product.name = data['name'].strip()
    if 'category_id' in data:
        product.category_id = int(data['category_id'])
    if 'price' in data:
        product.price = Decimal(str(data['price']))
    if 'unit' in data:
        product.unit = data['unit'].strip()
    if 'available_quantity' in data:
        product.available_quantity = Decimal(str(data['available_quantity']))
    if 'location' in data:
        product.location = data['location'].strip()
    if 'description' in data:
        product.description = data['description'].strip()
    if 'image_url' in data and data['image_url']:
        product.image_url = data['image_url'].strip()
    if 'is_organic' in data:
        product.is_organic = bool(data['is_organic'])
    if 'is_available' in data:
        product.is_available = bool(data['is_available'])
    if 'harvest_date' in data and data['harvest_date']:
        try:
            product.harvest_date = datetime.strptime(data['harvest_date'], '%Y-%m-%d').date()
        except Exception:
            pass

    db.session.commit()
    return jsonify({'message': 'Product updated successfully', 'product': product.to_dict()}), 200

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    if claims.get('role') != 'farmer':
        return jsonify({'error': 'Unauthorized'}), 403

    farmer = FarmerProfile.query.filter_by(user_id=user_id).first()
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    if product.farmer_id != farmer.id:
        return jsonify({'error': 'Cannot delete products from another farm'}), 403

    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted successfully'}), 200
