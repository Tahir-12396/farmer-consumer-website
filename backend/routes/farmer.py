from decimal import Decimal
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from backend.extensions import db
from backend.models import FarmerProfile, Product, FarmerOrder, Order, OrderItem, Notification

farmer_bp = Blueprint('farmer', __name__)

VALID_STATUS_TRANSITIONS = {
    'Pending': ['Accepted', 'Cancelled'],
    'Accepted': ['Preparing', 'Cancelled'],
    'Preparing': ['Ready for Dispatch', 'Cancelled'],
    'Ready for Dispatch': ['Completed'],
    'Completed': [],
    'Cancelled': []
}

@farmer_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    if claims.get('role') != 'farmer':
        return jsonify({'error': 'Unauthorized access'}), 403

    farmer = FarmerProfile.query.filter_by(user_id=user_id).first()
    if not farmer:
        return jsonify({'error': 'Farmer profile not found'}), 404

    total_products = Product.query.filter_by(farmer_id=farmer.id).count()
    active_products = Product.query.filter(
        Product.farmer_id == farmer.id,
        Product.is_available == True,
        Product.available_quantity > 0
    ).count()

    all_orders = FarmerOrder.query.filter_by(farmer_id=farmer.id).all()
    total_orders = len(all_orders)
    pending_orders = sum(1 for o in all_orders if o.status in ['Pending', 'Accepted', 'Preparing'])

    total_earnings = sum(float(o.subtotal) for o in all_orders if o.status == 'Completed')
    pending_earnings = sum(float(o.subtotal) for o in all_orders if o.status not in ['Completed', 'Cancelled'])

    recent_orders = FarmerOrder.query.filter_by(farmer_id=farmer.id)\
        .order_by(FarmerOrder.created_at.desc()).limit(5).all()

    return jsonify({
        'farmer': farmer.to_dict(),
        'metrics': {
            'total_earnings': round(total_earnings, 2),
            'pending_earnings': round(pending_earnings, 2),
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'active_products': active_products,
            'total_products': total_products
        },
        'recent_orders': [o.to_dict() for o in recent_orders]
    }), 200

@farmer_bp.route('/products', methods=['GET'])
@jwt_required()
def get_farmer_products():
    user_id = int(get_jwt_identity())
    farmer = FarmerProfile.query.filter_by(user_id=user_id).first()
    if not farmer:
        return jsonify({'error': 'Farmer profile not found'}), 404

    products = Product.query.filter_by(farmer_id=farmer.id).order_by(Product.created_at.desc()).all()
    return jsonify({'products': [p.to_dict() for p in products]}), 200

@farmer_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_farmer_orders():
    user_id = int(get_jwt_identity())
    farmer = FarmerProfile.query.filter_by(user_id=user_id).first()
    if not farmer:
        return jsonify({'error': 'Farmer profile not found'}), 404

    status_filter = request.args.get('status')
    query = FarmerOrder.query.filter_by(farmer_id=farmer.id)
    if status_filter:
        query = query.filter_by(status=status_filter)

    orders = query.order_by(FarmerOrder.created_at.desc()).all()
    return jsonify({'orders': [o.to_dict() for o in orders]}), 200

@farmer_bp.route('/orders/<int:order_id>/status', methods=['PATCH'])
@jwt_required()
def update_order_status(order_id):
    user_id = int(get_jwt_identity())
    farmer = FarmerProfile.query.filter_by(user_id=user_id).first()
    if not farmer:
        return jsonify({'error': 'Farmer profile not found'}), 404

    farmer_order = FarmerOrder.query.filter_by(id=order_id, farmer_id=farmer.id).first()
    if not farmer_order:
        return jsonify({'error': 'Order not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status')

    if not new_status:
        return jsonify({'error': 'New status is required'}), 400

    allowed_transitions = VALID_STATUS_TRANSITIONS.get(farmer_order.status, [])
    if new_status not in allowed_transitions and new_status != farmer_order.status:
        return jsonify({
            'error': f'Invalid status transition from {farmer_order.status} to {new_status}. Allowed: {allowed_transitions}'
        }), 400

    farmer_order.status = new_status

    # Notify buyer of status update
    parent_order = farmer_order.order
    if parent_order:
        # Check if all sub-orders are completed
        all_completed = all(fo.status == 'Completed' for fo in parent_order.farmer_orders)
        if all_completed:
            parent_order.order_status = 'Completed'
        elif new_status == 'Cancelled' and all(fo.status == 'Cancelled' for fo in parent_order.farmer_orders):
            parent_order.order_status = 'Cancelled'
        else:
            parent_order.order_status = new_status

        notif = Notification(
            user_id=parent_order.buyer_id,
            title=f"Order Update: {farmer_order.order.order_number}",
            message=f"Status for your items from {farmer.farm_name} is now: {new_status}"
        )
        db.session.add(notif)

    db.session.commit()
    return jsonify({'message': 'Order status updated successfully', 'order': farmer_order.to_dict()}), 200

@farmer_bp.route('/earnings', methods=['GET'])
@jwt_required()
def get_earnings():
    user_id = int(get_jwt_identity())
    farmer = FarmerProfile.query.filter_by(user_id=user_id).first()
    if not farmer:
        return jsonify({'error': 'Farmer profile not found'}), 404

    orders = FarmerOrder.query.filter_by(farmer_id=farmer.id).order_by(FarmerOrder.created_at.desc()).all()

    total_sales = sum(float(o.subtotal) for o in orders)
    completed_revenue = sum(float(o.subtotal) for o in orders if o.status == 'Completed')
    pending_revenue = sum(float(o.subtotal) for o in orders if o.status in ['Pending', 'Accepted', 'Preparing', 'Ready for Dispatch'])
    cancelled_revenue = sum(float(o.subtotal) for o in orders if o.status == 'Cancelled')

    transactions = [{
        'order_id': o.id,
        'order_number': o.order.order_number if o.order else f"ORD-{o.id}",
        'date': o.created_at.isoformat() if o.created_at else None,
        'items_count': o.items.count(),
        'amount': float(o.subtotal),
        'status': o.status,
        'buyer_name': o.order.buyer.full_name if o.order and o.order.buyer else 'Buyer'
    } for o in orders]

    return jsonify({
        'summary': {
            'total_sales': round(total_sales, 2),
            'completed_revenue': round(completed_revenue, 2),
            'pending_revenue': round(pending_revenue, 2),
            'cancelled_revenue': round(cancelled_revenue, 2),
            'orders_count': len(orders)
        },
        'transactions': transactions
    }), 200
