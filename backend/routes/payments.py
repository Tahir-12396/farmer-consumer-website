import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models import Order, Payment

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/create', methods=['POST'])
@jwt_required()
def create_payment():
    data = request.get_json() or {}
    order_id = data.get('order_id')
    method = data.get('payment_method', 'ONLINE_SANDBOX')

    if not order_id:
        return jsonify({'error': 'order_id is required'}), 400

    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    # Razorpay test order creation simulation / mock provider
    razorpay_order_id = f"order_rp_{uuid.uuid4().hex[:12]}"
    return jsonify({
        'order_id': order.id,
        'order_number': order.order_number,
        'amount': float(order.total_amount),
        'currency': 'INR',
        'razorpay_order_id': razorpay_order_id,
        'key_id': 'rzp_test_kisandirect2026',
        'method': method
    }), 200

@payments_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_payment():
    data = request.get_json() or {}
    order_id = data.get('order_id')
    payment_id = data.get('payment_id', f"pay_{uuid.uuid4().hex[:10]}")
    signature = data.get('signature', 'valid_sandbox_signature')

    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    # Update payment status
    payment = Payment.query.filter_by(order_id=order.id).first()
    if payment:
        payment.status = 'Successful'
        payment.transaction_id = payment_id
        payment.payment_reference = signature

    order.payment_status = 'Successful'
    db.session.commit()

    return jsonify({
        'message': 'Payment verified successfully',
        'payment_status': 'Successful',
        'order': order.to_dict()
    }), 200
