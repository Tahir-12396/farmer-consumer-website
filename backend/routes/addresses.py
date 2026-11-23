from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models import Address

addresses_bp = Blueprint('addresses', __name__)

@addresses_bp.route('', methods=['GET'])
@jwt_required()
def get_addresses():
    user_id = int(get_jwt_identity())
    addresses = Address.query.filter_by(user_id=user_id).order_by(Address.is_default.desc(), Address.created_at.desc()).all()
    return jsonify({'addresses': [a.to_dict() for a in addresses]}), 200

@addresses_bp.route('', methods=['POST'])
@jwt_required()
def add_address():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    door_number = data.get('door_number', '').strip()
    street = data.get('street', '').strip()
    village = data.get('village', '').strip()
    district = data.get('district', '').strip()
    state = data.get('state', '').strip() or 'Telangana'
    pincode = data.get('pincode', '').strip()
    landmark = data.get('landmark', '').strip()
    is_default = bool(data.get('is_default', False))

    if not door_number or not street or not pincode:
        return jsonify({'error': 'Door number, street and pincode are required'}), 400

    existing_count = Address.query.filter_by(user_id=user_id).count()
    if existing_count == 0:
        is_default = True
    elif is_default:
        Address.query.filter_by(user_id=user_id).update({'is_default': False})

    address = Address(
        user_id=user_id,
        door_number=door_number,
        street=street,
        village=village or 'Town',
        district=district or 'City',
        state=state,
        pincode=pincode,
        landmark=landmark,
        is_default=is_default
    )
    db.session.add(address)
    db.session.commit()
    return jsonify({'message': 'Address added successfully', 'address': address.to_dict()}), 201

@addresses_bp.route('/<int:addr_id>', methods=['PUT'])
@jwt_required()
def update_address(addr_id):
    user_id = int(get_jwt_identity())
    address = Address.query.filter_by(id=addr_id, user_id=user_id).first()
    if not address:
        return jsonify({'error': 'Address not found'}), 404

    data = request.get_json() or {}
    for field in ['door_number', 'street', 'village', 'district', 'state', 'pincode', 'landmark']:
        if field in data:
            setattr(address, field, data[field].strip())

    if 'is_default' in data and data['is_default']:
        Address.query.filter_by(user_id=user_id).update({'is_default': False})
        address.is_default = True

    db.session.commit()
    return jsonify({'message': 'Address updated successfully', 'address': address.to_dict()}), 200

@addresses_bp.route('/<int:addr_id>', methods=['DELETE'])
@jwt_required()
def delete_address(addr_id):
    user_id = int(get_jwt_identity())
    address = Address.query.filter_by(id=addr_id, user_id=user_id).first()
    if not address:
        return jsonify({'error': 'Address not found'}), 404

    was_default = address.is_default
    db.session.delete(address)
    db.session.commit()

    if was_default:
        first_rem = Address.query.filter_by(user_id=user_id).first()
        if first_rem:
            first_rem.is_default = True
            db.session.commit()

    return jsonify({'message': 'Address deleted successfully'}), 200

@addresses_bp.route('/<int:addr_id>/default', methods=['PATCH'])
@jwt_required()
def set_default_address(addr_id):
    user_id = int(get_jwt_identity())
    address = Address.query.filter_by(id=addr_id, user_id=user_id).first()
    if not address:
        return jsonify({'error': 'Address not found'}), 404

    Address.query.filter_by(user_id=user_id).update({'is_default': False})
    address.is_default = True
    db.session.commit()
    return jsonify({'message': 'Default address updated', 'address': address.to_dict()}), 200
