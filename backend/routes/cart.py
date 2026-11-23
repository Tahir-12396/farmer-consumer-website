from decimal import Decimal
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models import CartItem, Product

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = int(get_jwt_identity())
    items = CartItem.query.filter_by(buyer_id=user_id).all()

    subtotal = Decimal('0.00')
    cart_items_data = []

    for item in items:
        if item.product:
            item_subtotal = item.product.price * item.quantity
            subtotal += item_subtotal
            cart_items_data.append(item.to_dict())

    # Free delivery over ₹500, else ₹40 standard delivery fee
    delivery_fee = Decimal('0.00') if subtotal >= Decimal('500.00') or len(cart_items_data) == 0 else Decimal('40.00')
    total_amount = subtotal + delivery_fee

    return jsonify({
        'items': cart_items_data,
        'item_count': len(cart_items_data),
        'subtotal': float(subtotal),
        'delivery_fee': float(delivery_fee),
        'total_amount': float(total_amount)
    }), 200

@cart_bp.route('/items', methods=['POST'])
@jwt_required()
def add_to_cart():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    product_id = data.get('product_id')
    quantity = Decimal(str(data.get('quantity', 1)))

    if not product_id or quantity <= 0:
        return jsonify({'error': 'Valid product_id and quantity > 0 required'}), 400

    product = db.session.get(Product, product_id)
    if not product or not product.is_available:
        return jsonify({'error': 'Product is currently not available'}), 404

    existing_item = CartItem.query.filter_by(buyer_id=user_id, product_id=product_id).first()
    new_quantity = (existing_item.quantity + quantity) if existing_item else quantity

    if new_quantity > product.available_quantity:
        return jsonify({
            'error': f'Only {float(product.available_quantity)} {product.unit} available in stock.'
        }), 400

    if existing_item:
        existing_item.quantity = new_quantity
    else:
        new_item = CartItem(buyer_id=user_id, product_id=product_id, quantity=quantity)
        db.session.add(new_item)

    db.session.commit()
    return jsonify({'message': 'Item added to cart'}), 200

@cart_bp.route('/items/<int:item_id>', methods=['PATCH'])
@jwt_required()
def update_cart_item(item_id):
    user_id = int(get_jwt_identity())
    item = CartItem.query.filter_by(id=item_id, buyer_id=user_id).first()
    if not item:
        return jsonify({'error': 'Cart item not found'}), 404

    data = request.get_json() or {}
    quantity = Decimal(str(data.get('quantity', 1)))

    if quantity <= 0:
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Item removed from cart'}), 200

    if item.product and quantity > item.product.available_quantity:
        return jsonify({
            'error': f'Only {float(item.product.available_quantity)} {item.product.unit} available in stock.'
        }), 400

    item.quantity = quantity
    db.session.commit()
    return jsonify({'message': 'Quantity updated', 'item': item.to_dict()}), 200

@cart_bp.route('/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_cart_item(item_id):
    user_id = int(get_jwt_identity())
    item = CartItem.query.filter_by(id=item_id, buyer_id=user_id).first()
    if not item:
        return jsonify({'error': 'Cart item not found'}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item removed from cart'}), 200

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    user_id = int(get_jwt_identity())
    CartItem.query.filter_by(buyer_id=user_id).delete()
    db.session.commit()
    return jsonify({'message': 'Cart cleared'}), 200
