from flask import Blueprint, jsonify
from backend.models import Category

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('', methods=['GET'])
def get_categories():
    categories = Category.query.filter_by(is_active=True).all()
    return jsonify({'categories': [c.to_dict() for c in categories]}), 200
