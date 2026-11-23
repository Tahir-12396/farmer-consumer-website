from datetime import datetime
from decimal import Decimal
from werkzeug.security import generate_password_hash, check_password_hash
from backend.extensions import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    mobile_number = db.Column(db.String(20), unique=True, nullable=True, index=True)
    email = db.Column(db.String(120), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'farmer' or 'buyer'
    language = db.Column(db.String(10), default='en')  # 'en', 'te', 'hi'
    is_verified = db.Column(db.Boolean, default=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer_profile = db.relationship('FarmerProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    buyer_profile = db.relationship('BuyerProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    addresses = db.relationship('Address', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    support_requests = db.relationship('SupportRequest', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        data = {
            'id': self.id,
            'full_name': self.full_name,
            'mobile_number': self.mobile_number,
            'email': self.email,
            'role': self.role,
            'language': self.language,
            'is_verified': self.is_verified,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if self.role == 'farmer' and self.farmer_profile:
            data['farmer_profile'] = self.farmer_profile.to_dict()
        elif self.role == 'buyer' and self.buyer_profile:
            data['buyer_profile'] = self.buyer_profile.to_dict()
        return data


class FarmerProfile(db.Model):
    __tablename__ = 'farmer_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    farm_name = db.Column(db.String(150), nullable=True)
    village = db.Column(db.String(100), nullable=False)
    district = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    products = db.relationship('Product', backref='farmer', lazy='dynamic', cascade='all, delete-orphan')
    farmer_orders = db.relationship('FarmerOrder', backref='farmer', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'farm_name': self.farm_name or f"{self.user.full_name}'s Farm",
            'village': self.village,
            'district': self.district,
            'state': self.state,
            'pincode': self.pincode,
            'location_display': f"{self.village}, {self.district}",
            'farmer_name': self.user.full_name if self.user else None,
            'mobile_number': self.user.mobile_number if self.user else None,
            'email': self.user.email if self.user else None
        }


class BuyerProfile(db.Model):
    __tablename__ = 'buyer_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Address(db.Model):
    __tablename__ = 'addresses'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    door_number = db.Column(db.String(50), nullable=False)
    street = db.Column(db.String(150), nullable=False)
    village = db.Column(db.String(100), nullable=False)
    district = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    landmark = db.Column(db.String(150), nullable=True)
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def formatted_address(self):
        parts = [self.door_number, self.street, self.village, self.district, self.state]
        valid_parts = [p for p in parts if p]
        addr = ", ".join(valid_parts)
        if self.pincode:
            addr += f" - {self.pincode}"
        if self.landmark:
            addr += f" (Near {self.landmark})"
        return addr

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'door_number': self.door_number,
            'street': self.street,
            'village': self.village,
            'district': self.district,
            'state': self.state,
            'pincode': self.pincode,
            'landmark': self.landmark,
            'is_default': self.is_default,
            'formatted_address': self.formatted_address
        }


class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    products = db.relationship('Product', backref='category', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'image': self.image,
            'is_active': self.is_active,
            'product_count': self.products.count()
        }


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmer_profiles.id', ondelete='CASCADE'), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False, index=True)
    name = db.Column(db.String(150), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    unit = db.Column(db.String(20), nullable=False, default='kg')  # 'kg', 'gram', 'bunch', 'dozen', 'litre', 'piece'
    available_quantity = db.Column(db.Numeric(10, 2), nullable=False, default=Decimal('0.00'))
    location = db.Column(db.String(150), nullable=False)
    harvest_date = db.Column(db.Date, nullable=True)
    is_organic = db.Column(db.Boolean, default=False)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        farmer_data = self.farmer.to_dict() if self.farmer else {}
        return {
            'id': self.id,
            'farmer_id': self.farmer_id,
            'farmer_name': farmer_data.get('farmer_name', 'Local Farmer'),
            'farm_name': farmer_data.get('farm_name', 'Farm Fresh'),
            'farmer_phone': farmer_data.get('mobile_number'),
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else 'General',
            'name': self.name,
            'description': self.description,
            'image_url': self.image_url,
            'price': float(self.price),
            'unit': self.unit,
            'available_quantity': float(self.available_quantity),
            'location': self.location,
            'harvest_date': self.harvest_date.isoformat() if self.harvest_date else None,
            'is_organic': self.is_organic,
            'is_available': self.is_available and (self.available_quantity > 0),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False, index=True)
    quantity = db.Column(db.Numeric(10, 2), nullable=False, default=Decimal('1.00'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    buyer = db.relationship('User', backref=db.backref('cart_items', lazy='dynamic', cascade='all, delete-orphan'))
    product = db.relationship('Product')

    def to_dict(self):
        unit_price = float(self.product.price) if self.product else 0.0
        qty = float(self.quantity)
        subtotal = round(unit_price * qty, 2)
        return {
            'id': self.id,
            'buyer_id': self.buyer_id,
            'product_id': self.product_id,
            'product': self.product.to_dict() if self.product else None,
            'quantity': qty,
            'unit_price': unit_price,
            'subtotal': subtotal,
            'in_stock': (self.product.available_quantity >= self.quantity) if self.product else False
        }


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    delivery_fee = db.Column(db.Numeric(10, 2), nullable=False, default=Decimal('0.00'))
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_status = db.Column(db.String(30), default='Pending')  # 'Pending', 'Successful', 'Failed', 'Refunded'
    order_status = db.Column(db.String(30), default='Pending')  # 'Pending', 'Accepted', 'Preparing', 'Ready for Dispatch', 'Completed', 'Cancelled'
    payment_method = db.Column(db.String(50), default='COD')  # 'COD', 'UPI', 'CARD', 'ONLINE_SANDBOX'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    buyer = db.relationship('User', backref=db.backref('orders', lazy='dynamic'))
    address = db.relationship('Address')
    farmer_orders = db.relationship('FarmerOrder', backref='order', lazy='dynamic', cascade='all, delete-orphan')
    items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='order', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_items=True):
        data = {
            'id': self.id,
            'order_number': self.order_number,
            'buyer_id': self.buyer_id,
            'buyer_name': self.buyer.full_name if self.buyer else None,
            'buyer_phone': self.buyer.mobile_number if self.buyer else None,
            'address': self.address.to_dict() if self.address else None,
            'subtotal': float(self.subtotal),
            'delivery_fee': float(self.delivery_fee),
            'total_amount': float(self.total_amount),
            'payment_status': self.payment_status,
            'order_status': self.order_status,
            'payment_method': self.payment_method,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        if include_items:
            data['items'] = [item.to_dict() for item in self.items]
            data['farmer_orders'] = [fo.to_dict() for fo in self.farmer_orders]
        return data


class FarmerOrder(db.Model):
    __tablename__ = 'farmer_orders'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False, index=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmer_profiles.id'), nullable=False, index=True)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(30), default='Pending')  # 'Pending', 'Accepted', 'Preparing', 'Ready for Dispatch', 'Completed', 'Cancelled'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = db.relationship('OrderItem', backref='farmer_order', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'order_number': self.order.order_number if self.order else None,
            'order_date': self.created_at.isoformat() if self.created_at else None,
            'farmer_id': self.farmer_id,
            'subtotal': float(self.subtotal),
            'status': self.status,
            'buyer_name': self.order.buyer.full_name if self.order and self.order.buyer else 'Buyer',
            'buyer_phone': self.order.buyer.mobile_number if self.order and self.order.buyer else None,
            'delivery_address': self.order.address.formatted_address if self.order and self.order.address else None,
            'items': [item.to_dict() for item in self.items]
        }


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False, index=True)
    farmer_order_id = db.Column(db.Integer, db.ForeignKey('farmer_orders.id', ondelete='CASCADE'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    product_name_snapshot = db.Column(db.String(150), nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    unit = db.Column(db.String(20), nullable=False, default='kg')
    quantity = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)

    product = db.relationship('Product')

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'farmer_order_id': self.farmer_order_id,
            'product_id': self.product_id,
            'product_name': self.product_name_snapshot,
            'product_image': self.product.image_url if self.product else None,
            'unit_price': float(self.unit_price),
            'unit': self.unit,
            'quantity': float(self.quantity),
            'subtotal': float(self.subtotal)
        }


class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False, index=True)
    payment_provider = db.Column(db.String(50), default='COD')
    transaction_id = db.Column(db.String(100), nullable=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(30), default='Pending')  # 'Pending', 'Successful', 'Failed', 'Refunded'
    payment_reference = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'payment_provider': self.payment_provider,
            'transaction_id': self.transaction_id,
            'amount': float(self.amount),
            'status': self.status,
            'payment_reference': self.payment_reference,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class SupportRequest(db.Model):
    __tablename__ = 'support_requests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    subject = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), default='Open')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'subject': self.subject,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
