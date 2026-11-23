from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models import User, Address, Order, Product

buyer_bp = Blueprint('buyer', __name__)

@buyer_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    recent_orders = Order.query.filter_by(buyer_id=user_id)\
        .order_by(Order.created_at.desc()).limit(3).all()

    # Fresh produce picks
    featured_products = Product.query.filter(
        Product.is_available == True,
        Product.available_quantity > 0
    ).order_by(Product.created_at.desc()).limit(6).all()

    default_address = Address.query.filter_by(user_id=user_id, is_default=True).first()

    return jsonify({
        'user': user.to_dict(),
        'default_address': default_address.to_dict() if default_address else None,
        'recent_orders': [o.to_dict(include_items=True) for o in recent_orders],
        'featured_products': [p.to_dict() for p in featured_products]
    }), 200

@buyer_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    addresses = Address.query.filter_by(user_id=user_id).order_by(Address.is_default.desc()).all()
    return jsonify({
        'user': user.to_dict(),
        'addresses': [a.to_dict() for a in addresses]
    }), 200

@buyer_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    if 'full_name' in data and data['full_name'].strip():
        user.full_name = data['full_name'].strip()
    if 'language' in data and data['language'] in ['en', 'te', 'hi']:
        user.language = data['language']

    db.session.commit()
    return jsonify({'message': 'Profile updated successfully', 'user': user.to_dict()}), 200
