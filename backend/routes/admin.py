from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from decimal import Decimal
from datetime import datetime
from backend.extensions import db
from backend.models import (
    User, FarmerProfile, BuyerProfile, Address, Product, Category, 
    Order, FarmerOrder, OrderItem, SupportRequest, Payment, Notification, CartItem
)

admin_bp = Blueprint('admin', __name__)

def require_admin():
    identity = get_jwt_identity()
    try:
        user = User.query.get(int(identity))
        if not user or user.role != 'admin':
            return None
        return user
    except Exception:
        return None

# ==========================================
# 1. OVERVIEW & METRICS
# ==========================================

@admin_bp.route('/overview', methods=['GET'])
@jwt_required()
def overview():
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    total_users = User.query.count()
    total_farmers = User.query.filter_by(role='farmer').count()
    total_buyers = User.query.filter_by(role='buyer').count()
    total_admins = User.query.filter_by(role='admin').count()
    total_products = Product.query.count()
    active_products = Product.query.filter_by(is_available=True).count()
    total_orders = Order.query.count()
    total_categories = Category.query.count()
    pending_tickets = SupportRequest.query.filter_by(status='pending').count()

    total_gmv = db.session.query(func.coalesce(func.sum(Order.total_amount), 0))\
        .filter(Order.payment_status.in_(['completed', 'paid', 'Successful', 'COD'])).scalar() or 0

    statuses = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']
    status_counts = {}
    for st in statuses:
        status_counts[st] = Order.query.filter_by(order_status=st).count()

    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(8).all()
    recent_orders_list = [o.to_dict() for o in recent_orders]

    return jsonify({
        'stats': {
            'total_users': total_users,
            'total_farmers': total_farmers,
            'total_buyers': total_buyers,
            'total_admins': total_admins,
            'total_products': total_products,
            'active_products': active_products,
            'total_orders': total_orders,
            'total_categories': total_categories,
            'pending_tickets': pending_tickets,
            'total_gmv': float(total_gmv),
            'status_counts': status_counts
        },
        'recent_orders': recent_orders_list
    }), 200

# ==========================================
# 2. USER MANAGEMENT (CRUD & STATUS)
# ==========================================

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    role_filter = request.args.get('role')
    query = User.query.order_by(User.created_at.desc())
    if role_filter and role_filter in ['farmer', 'buyer', 'admin']:
        query = query.filter_by(role=role_filter)

    users = query.all()
    return jsonify({
        'count': len(users),
        'users': [u.to_dict() for u in users]
    }), 200

@admin_bp.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower() or None
    mobile_number = data.get('mobile_number', '').strip() or None
    password = data.get('password', '')
    role = data.get('role', 'buyer').lower()

    if not full_name:
        return jsonify({'error': 'Full name is required'}), 400
    if not email and not mobile_number:
        return jsonify({'error': 'Provide either email or mobile number'}), 400
    if not password or len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    if role not in ['farmer', 'buyer', 'admin']:
        return jsonify({'error': 'Invalid role. Must be farmer, buyer, or admin'}), 400

    if email and User.query.filter_by(email=email).first():
        return jsonify({'error': f'Email {email} is already in use'}), 409
    if mobile_number and User.query.filter_by(mobile_number=mobile_number).first():
        return jsonify({'error': f'Mobile {mobile_number} is already in use'}), 409

    try:
        user = User(
            full_name=full_name,
            email=email,
            mobile_number=mobile_number,
            role=role,
            language=data.get('language', 'en'),
            is_verified=True,
            is_active=True
        )
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        if role == 'farmer':
            profile = FarmerProfile(
                user_id=user.id,
                farm_name=data.get('farm_name') or f"{full_name}'s Farm",
                village=data.get('village') or 'Rural Mandi',
                district=data.get('district') or 'Agricultural District',
                state=data.get('state') or 'Telangana',
                pincode=data.get('pincode') or '500001'
            )
            db.session.add(profile)
        elif role == 'buyer':
            profile = BuyerProfile(user_id=user.id)
            db.session.add(profile)
            if data.get('door_number') or data.get('street') or data.get('pincode'):
                address = Address(
                    user_id=user.id,
                    door_number=data.get('door_number', '1-1'),
                    street=data.get('street', 'Main Road'),
                    village=data.get('village', 'City'),
                    district=data.get('district', 'District'),
                    state=data.get('state', 'Telangana'),
                    pincode=data.get('pincode', '500001'),
                    is_default=True
                )
                db.session.add(address)

        db.session.commit()
        return jsonify({
            'message': f'User {full_name} ({role}) created successfully',
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create user: {str(e)}'}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    if 'full_name' in data:
        user.full_name = data['full_name'].strip()
    if 'email' in data:
        new_email = data['email'].strip().lower() or None
        if new_email and new_email != user.email:
            if User.query.filter(User.email == new_email, User.id != user.id).first():
                return jsonify({'error': 'Email already in use'}), 409
            user.email = new_email
    if 'mobile_number' in data:
        new_phone = data['mobile_number'].strip() or None
        if new_phone and new_phone != user.mobile_number:
            if User.query.filter(User.mobile_number == new_phone, User.id != user.id).first():
                return jsonify({'error': 'Mobile number already in use'}), 409
            user.mobile_number = new_phone
    if 'password' in data and data['password']:
        if len(data['password']) >= 6:
            user.set_password(data['password'])
    if 'is_active' in data:
        if user.id == admin.id and not data['is_active']:
            return jsonify({'error': 'Cannot deactivate yourself'}), 400
        user.is_active = bool(data['is_active'])

    # Farmer profile updates
    if user.role == 'farmer' and user.farmer_profile:
        fp = user.farmer_profile
        if 'farm_name' in data: fp.farm_name = data['farm_name']
        if 'village' in data: fp.village = data['village']
        if 'district' in data: fp.district = data['district']
        if 'state' in data: fp.state = data['state']
        if 'pincode' in data: fp.pincode = data['pincode']

    db.session.commit()
    return jsonify({
        'message': f'User {user.full_name} updated successfully',
        'user': user.to_dict()
    }), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    user = User.query.get_or_404(user_id)
    if user.id == admin.id:
        return jsonify({'error': 'Cannot delete your own active administrator account'}), 400

    try:
        user_name = user.full_name
        role = user.role

        # 1. Clean buyer orders & cart
        CartItem.query.filter_by(buyer_id=user.id).delete()
        orders = Order.query.filter_by(buyer_id=user.id).all()
        for o in orders:
            Payment.query.filter_by(order_id=o.id).delete()
            OrderItem.query.filter_by(order_id=o.id).delete()
            FarmerOrder.query.filter_by(order_id=o.id).delete()
            db.session.delete(o)

        # 2. Clean farmer products & farmer orders
        if user.farmer_profile:
            fp_id = user.farmer_profile.id
            farmer_orders = FarmerOrder.query.filter_by(farmer_id=fp_id).all()
            for fo in farmer_orders:
                OrderItem.query.filter_by(farmer_order_id=fo.id).delete()
                db.session.delete(fo)

            products = Product.query.filter_by(farmer_id=fp_id).all()
            for p in products:
                CartItem.query.filter_by(product_id=p.id).delete()
                OrderItem.query.filter_by(product_id=p.id).update({'product_id': None})
                db.session.delete(p)

            db.session.delete(user.farmer_profile)

        # 3. Clean buyer profile, addresses, notifications, support
        if user.buyer_profile:
            db.session.delete(user.buyer_profile)
        Address.query.filter_by(user_id=user.id).delete()
        Notification.query.filter_by(user_id=user.id).delete()
        SupportRequest.query.filter_by(user_id=user.id).delete()

        # 4. Finally delete user
        db.session.delete(user)
        db.session.commit()

        return jsonify({
            'message': f'User "{user_name}" ({role}) and all associated records have been permanently deleted.'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete user: {str(e)}'}), 500

@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['PATCH'])
@jwt_required()
def toggle_user_status(user_id):
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    user = User.query.get_or_404(user_id)
    if user.id == admin.id:
        return jsonify({'error': 'Cannot deactivate yourself'}), 400

    user.is_active = not user.is_active
    db.session.commit()
    return jsonify({
        'message': f'User {user.full_name} is now {"Active" if user.is_active else "Suspended"}',
        'is_active': user.is_active
    }), 200

# ==========================================
# 3. PRODUCT & INVENTORY MANAGEMENT
# ==========================================

@admin_bp.route('/products', methods=['GET'])
@jwt_required()
def list_products():
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    products = Product.query.order_by(Product.created_at.desc()).all()
    return jsonify({
        'count': len(products),
        'products': [p.to_dict() for p in products]
    }), 200

@admin_bp.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    category_id = data.get('category_id')
    price = data.get('price')
    unit = data.get('unit', 'kg')
    available_quantity = data.get('available_quantity', 10)
    farmer_id = data.get('farmer_id')

    if not name or not category_id or price is None:
        return jsonify({'error': 'Product name, category, and price are required'}), 400

    if not farmer_id:
        fp = FarmerProfile.query.first()
        if not fp:
            return jsonify({'error': 'No farmers exist to assign product. Register a farmer first.'}), 400
        farmer_id = fp.id

    try:
        product = Product(
            farmer_id=int(farmer_id),
            category_id=int(category_id),
            name=name,
            description=data.get('description', ''),
            image_url=data.get('image_url') or 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
            price=Decimal(str(price)),
            unit=unit,
            available_quantity=Decimal(str(available_quantity)),
            location=data.get('location', 'Farm Central'),
            is_organic=bool(data.get('is_organic', False)),
            is_available=bool(data.get('is_available', True))
        )
        db.session.add(product)
        db.session.commit()
        return jsonify({
            'message': f'Product "{name}" created successfully',
            'product': product.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create product: {str(e)}'}), 500

@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    product = Product.query.get_or_404(product_id)
    data = request.get_json() or {}

    if 'name' in data: product.name = data['name'].strip()
    if 'category_id' in data: product.category_id = int(data['category_id'])
    if 'price' in data: product.price = Decimal(str(data['price']))
    if 'unit' in data: product.unit = data['unit']
    if 'available_quantity' in data: product.available_quantity = Decimal(str(data['available_quantity']))
    if 'location' in data: product.location = data['location']
    if 'description' in data: product.description = data['description']
    if 'image_url' in data and data['image_url']: product.image_url = data['image_url']
    if 'is_organic' in data: product.is_organic = bool(data['is_organic'])
    if 'is_available' in data: product.is_available = bool(data['is_available'])

    db.session.commit()
    return jsonify({
        'message': f'Product "{product.name}" updated successfully',
        'product': product.to_dict()
    }), 200

@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    product = Product.query.get_or_404(product_id)
    name = product.name
    try:
        CartItem.query.filter_by(product_id=product.id).delete()
        OrderItem.query.filter_by(product_id=product.id).update({'product_id': None})
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': f'Product "{name}" permanently deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete product: {str(e)}'}), 500

@admin_bp.route('/products/<int:product_id>/toggle-status', methods=['PATCH'])
@jwt_required()
def toggle_product_status(product_id):
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    product = Product.query.get_or_404(product_id)
    product.is_available = not product.is_available
    db.session.commit()
    return jsonify({
        'message': f'Product {product.name} is now {"Listed" if product.is_available else "Delisted"}',
        'is_available': product.is_available
    }), 200

# ==========================================
# 4. ORDER MANAGEMENT
# ==========================================

@admin_bp.route('/orders', methods=['GET'])
@jwt_required()
def list_orders():
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify({
        'count': len(orders),
        'orders': [o.to_dict() for o in orders]
    }), 200

@admin_bp.route('/orders/<int:order_id>/status', methods=['PATCH'])
@jwt_required()
def update_order_status(order_id):
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    data = request.get_json() or {}
    new_status = data.get('status')
    valid_statuses = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']
    if new_status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Allowed: {valid_statuses}'}), 400

    order = Order.query.get_or_404(order_id)
    order.order_status = new_status
    if new_status == 'delivered':
        order.payment_status = 'completed'

    for fo in order.farmer_orders:
        fo.status = new_status

    db.session.commit()
    return jsonify({
        'message': f'Order {order.order_number} status updated to {new_status}',
        'order': order.to_dict()
    }), 200

@admin_bp.route('/orders/<int:order_id>/payment', methods=['PATCH'])
@jwt_required()
def update_order_payment(order_id):
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    data = request.get_json() or {}
    new_status = data.get('payment_status')
    valid = ['Pending', 'Successful', 'completed', 'Failed', 'Refunded']
    if new_status not in valid:
        return jsonify({'error': f'Invalid payment status. Allowed: {valid}'}), 400

    order = Order.query.get_or_404(order_id)
    order.payment_status = new_status
    db.session.commit()
    return jsonify({
        'message': f'Order {order.order_number} payment status updated to {new_status}',
        'order': order.to_dict()
    }), 200

@admin_bp.route('/orders/<int:order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    order = Order.query.get_or_404(order_id)
    order_num = order.order_number
    try:
        Payment.query.filter_by(order_id=order.id).delete()
        OrderItem.query.filter_by(order_id=order.id).delete()
        FarmerOrder.query.filter_by(order_id=order.id).delete()
        db.session.delete(order)
        db.session.commit()
        return jsonify({'message': f'Order {order_num} has been permanently deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete order: {str(e)}'}), 500

# ==========================================
# 5. CATEGORY MANAGEMENT
# ==========================================

@admin_bp.route('/categories', methods=['GET'])
@jwt_required()
def list_categories():
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    categories = Category.query.all()
    return jsonify({
        'count': len(categories),
        'categories': [c.to_dict() for c in categories]
    }), 200

@admin_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'Category name is required'}), 400

    if Category.query.filter(Category.name.ilike(name)).first():
        return jsonify({'error': f'Category "{name}" already exists'}), 409

    category = Category(
        name=name,
        description=data.get('description', ''),
        image=data.get('image') or 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
        is_active=True
    )
    db.session.add(category)
    db.session.commit()
    return jsonify({
        'message': f'Category "{name}" created successfully',
        'category': category.to_dict()
    }), 201

@admin_bp.route('/categories/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    category = Category.query.get_or_404(category_id)
    data = request.get_json() or {}

    if 'name' in data and data['name'].strip():
        category.name = data['name'].strip()
    if 'description' in data:
        category.description = data['description']
    if 'image' in data and data['image']:
        category.image = data['image']
    if 'is_active' in data:
        category.is_active = bool(data['is_active'])

    db.session.commit()
    return jsonify({
        'message': f'Category "{category.name}" updated successfully',
        'category': category.to_dict()
    }), 200

@admin_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    category = Category.query.get_or_404(category_id)
    if category.products.count() > 0:
        return jsonify({'error': f'Cannot delete category with {category.products.count()} linked products. Reassign products first.'}), 400

    cat_name = category.name
    db.session.delete(category)
    db.session.commit()
    return jsonify({'message': f'Category "{cat_name}" deleted successfully'}), 200

# ==========================================
# 6. SUPPORT TICKETS
# ==========================================

@admin_bp.route('/support', methods=['GET'])
@jwt_required()
def list_support_tickets():
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    tickets = SupportRequest.query.order_by(SupportRequest.created_at.desc()).all()
    return jsonify({
        'count': len(tickets),
        'tickets': [t.to_dict() for t in tickets]
    }), 200

@admin_bp.route('/support/<int:ticket_id>/resolve', methods=['PATCH'])
@jwt_required()
def resolve_support_ticket(ticket_id):
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    ticket = SupportRequest.query.get_or_404(ticket_id)
    ticket.status = 'resolved'
    db.session.commit()
    return jsonify({
        'message': f'Ticket #{ticket.id} marked as resolved',
        'ticket': ticket.to_dict()
    }), 200

@admin_bp.route('/support/<int:ticket_id>', methods=['DELETE'])
@jwt_required()
def delete_support_ticket(ticket_id):
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    ticket = SupportRequest.query.get_or_404(ticket_id)
    db.session.delete(ticket)
    db.session.commit()
    return jsonify({'message': f'Support ticket #{ticket_id} deleted'}), 200

# ==========================================
# 7. SYSTEM ACTIONS: PURGE DEMO DATA & BROADCAST
# ==========================================

@admin_bp.route('/system/purge-demo-data', methods=['POST'])
@jwt_required()
def purge_demo_data():
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    try:
        Payment.query.delete()
        OrderItem.query.delete()
        FarmerOrder.query.delete()
        Order.query.delete()

        CartItem.query.delete()
        Product.query.delete()

        FarmerProfile.query.delete()
        BuyerProfile.query.delete()
        Address.query.delete()
        Notification.query.delete()
        SupportRequest.query.delete()

        deleted_users_count = User.query.filter(User.role != 'admin').delete()
        db.session.commit()

        return jsonify({
            'message': f'System purged successfully! Removed {deleted_users_count} test users and all test orders/products. Admin and Categories preserved.'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to purge demo data: {str(e)}'}), 500

@admin_bp.route('/system/broadcast', methods=['POST'])
@jwt_required()
def broadcast_notification():
    admin = require_admin()
    if not admin:
        return jsonify({'error': 'Unauthorized. Admin privilege required.'}), 403

    data = request.get_json() or {}
    title = data.get('title', 'KisanDirect Announcement')
    message = data.get('message', '').strip()
    target_role = data.get('target', 'all')

    if not message:
        return jsonify({'error': 'Notification message is required'}), 400

    query = User.query
    if target_role in ['farmer', 'buyer']:
        query = query.filter_by(role=target_role)

    users = query.all()
    count = 0
    for u in users:
        n = Notification(
            user_id=u.id,
            title=title,
            message=message
        )
        db.session.add(n)
        count += 1

    db.session.commit()
    return jsonify({'message': f'Broadcast notification sent to {count} users'}), 200
