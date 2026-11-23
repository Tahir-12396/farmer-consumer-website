import uuid
from datetime import datetime
from decimal import Decimal
from collections import defaultdict
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models import Order, FarmerOrder, OrderItem, Product, CartItem, Address, Payment, Notification

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('', methods=['POST'])
@jwt_required()
def place_order():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    address_id = data.get('address_id')
    payment_method = data.get('payment_method', 'COD').upper()

    if not address_id:
        return jsonify({'error': 'Delivery address is required'}), 400

    address = Address.query.filter_by(id=address_id, user_id=user_id).first()
    if not address:
        return jsonify({'error': 'Invalid delivery address selected'}), 404

    # Fetch items either from request or active cart
    cart_items = CartItem.query.filter_by(buyer_id=user_id).all()
    if not cart_items:
        return jsonify({'error': 'Your cart is empty'}), 400

    try:
        # Step 1: Validate stock for all products before touching inventory
        products_to_update = []
        farmer_item_map = defaultdict(list)
        subtotal = Decimal('0.00')

        for c_item in cart_items:
            product = db.session.get(Product, c_item.product_id, with_for_update=True)
            if not product or not product.is_available:
                return jsonify({'error': f"Product '{c_item.product.name if c_item.product else 'Item'}' is unavailable"}), 400
            if product.available_quantity < c_item.quantity:
                return jsonify({
                    'error': f"Insufficient stock for '{product.name}'. Available: {float(product.available_quantity)} {product.unit}"
                }), 400

            item_subtotal = product.price * c_item.quantity
            subtotal += item_subtotal
            products_to_update.append((product, c_item.quantity))
            farmer_item_map[product.farmer_id].append({
                'product': product,
                'quantity': c_item.quantity,
                'unit_price': product.price,
                'unit': product.unit,
                'subtotal': item_subtotal
            })

        # Calculate Delivery fee
        delivery_fee = Decimal('0.00') if subtotal >= Decimal('500.00') else Decimal('40.00')
        total_amount = subtotal + delivery_fee

        # Step 2: Create Parent Order
        order_num = f"KD-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        initial_pay_status = 'Successful' if payment_method == 'ONLINE_SANDBOX' else 'Pending'

        order = Order(
            order_number=order_num,
            buyer_id=user_id,
            address_id=address.id,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total_amount=total_amount,
            payment_status=initial_pay_status,
            order_status='Pending',
            payment_method=payment_method
        )
        db.session.add(order)
        db.session.flush()

        # Step 3: Deduct stock & create FarmerOrders + OrderItems
        for farmer_id, items in farmer_item_map.items():
            f_subtotal = sum(item['subtotal'] for item in items)
            farmer_order = FarmerOrder(
                order_id=order.id,
                farmer_id=farmer_id,
                subtotal=f_subtotal,
                status='Pending'
            )
            db.session.add(farmer_order)
            db.session.flush()

            for it in items:
                prod = it['product']
                order_item = OrderItem(
                    order_id=order.id,
                    farmer_order_id=farmer_order.id,
                    product_id=prod.id,
                    product_name_snapshot=prod.name,
                    unit_price=it['unit_price'],
                    unit=it['unit'],
                    quantity=it['quantity'],
                    subtotal=it['subtotal']
                )
                db.session.add(order_item)

                # Deduct inventory
                prod.available_quantity -= it['quantity']
                if prod.available_quantity <= 0:
                    prod.available_quantity = Decimal('0.00')
                    prod.is_available = False

            # Notify Farmer
            farmer_profile = items[0]['product'].farmer
            farmer_notif = Notification(
                user_id=farmer_profile.user_id,
                title="New Order Received!",
                message=f"Order {order_num} has been placed containing items from your farm. Total value: ₹{float(f_subtotal):.2f}"
            )
            db.session.add(farmer_notif)

        # Step 4: Record Payment
        payment = Payment(
            order_id=order.id,
            payment_provider=payment_method,
            transaction_id=f"TXN-{uuid.uuid4().hex[:10].upper()}",
            amount=total_amount,
            status=initial_pay_status,
            payment_reference=f"REF-{order_num}"
        )
        db.session.add(payment)

        # Step 5: Clear Cart
        CartItem.query.filter_by(buyer_id=user_id).delete()

        # Step 6: Notify Buyer
        buyer_notif = Notification(
            user_id=user_id,
            title="Order Placed Successfully!",
            message=f"Your order {order_num} for ₹{float(total_amount):.2f} has been confirmed. Farmers are preparing your fresh produce!"
        )
        db.session.add(buyer_notif)

        db.session.commit()

        return jsonify({
            'message': 'Order placed successfully',
            'order': order.to_dict(include_items=True)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to place order: {str(e)}'}), 500

@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_orders():
    user_id = int(get_jwt_identity())
    orders = Order.query.filter_by(buyer_id=user_id).order_by(Order.created_at.desc()).all()
    return jsonify({'orders': [o.to_dict(include_items=True) for o in orders]}), 200

@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order_details(order_id):
    user_id = int(get_jwt_identity())
    order = Order.query.filter_by(id=order_id, buyer_id=user_id).first()
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    return jsonify({'order': order.to_dict(include_items=True)}), 200

@orders_bp.route('/<int:order_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_order(order_id):
    user_id = int(get_jwt_identity())
    order = Order.query.filter_by(id=order_id, buyer_id=user_id).first()
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    if order.order_status != 'Pending':
        return jsonify({'error': f'Cannot cancel order in {order.order_status} state. Only Pending orders can be cancelled.'}), 400

    try:
        # Restore inventory
        for item in order.items:
            if item.product_id:
                prod = Product.query.get(item.product_id)
                if prod:
                    prod.available_quantity += item.quantity
                    prod.is_available = True

        order.order_status = 'Cancelled'
        order.payment_status = 'Refunded' if order.payment_status == 'Successful' else 'Cancelled'

        for fo in order.farmer_orders:
            fo.status = 'Cancelled'
            farmer_profile = fo.farmer
            notif = Notification(
                user_id=farmer_profile.user_id,
                title=f"Order Cancelled: {order.order_number}",
                message=f"Buyer has cancelled order {order.order_number}."
            )
            db.session.add(notif)

        db.session.commit()
        return jsonify({'message': 'Order cancelled successfully and stock restored', 'order': order.to_dict(include_items=True)}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to cancel order: {str(e)}'}), 500
