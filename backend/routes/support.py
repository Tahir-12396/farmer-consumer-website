from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models import SupportRequest

support_bp = Blueprint('support', __name__)

@support_bp.route('', methods=['POST'])
@jwt_required()
def submit_ticket():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    subject = data.get('subject', '').strip()
    message = data.get('message', '').strip()

    if not subject or not message:
        return jsonify({'error': 'Subject and message are required'}), 400

    ticket = SupportRequest(
        user_id=user_id,
        subject=subject,
        message=message,
        status='Open'
    )
    db.session.add(ticket)
    db.session.commit()
    return jsonify({'message': 'Support request submitted successfully. Our team will contact you shortly.', 'ticket': ticket.to_dict()}), 201

@support_bp.route('', methods=['GET'])
@jwt_required()
def get_tickets():
    user_id = int(get_jwt_identity())
    tickets = SupportRequest.query.filter_by(user_id=user_id).order_by(SupportRequest.created_at.desc()).all()
    return jsonify({'tickets': [t.to_dict() for t in tickets]}), 200
