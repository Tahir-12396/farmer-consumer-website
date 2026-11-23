import os
import sys

# Ensure backend package resolves
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask, send_from_directory, jsonify
from backend.config import Config
from backend.extensions import db, jwt, cors
from backend.routes.auth import auth_bp
from backend.routes.categories import categories_bp
from backend.routes.products import products_bp
from backend.routes.farmer import farmer_bp
from backend.routes.buyer import buyer_bp
from backend.routes.cart import cart_bp
from backend.routes.orders import orders_bp
from backend.routes.payments import payments_bp
from backend.routes.addresses import addresses_bp
from backend.routes.notifications import notifications_bp
from backend.routes.support import support_bp
from backend.routes.admin import admin_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Ensure uploads directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize tables on startup
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            app.logger.warning(f"Database init warning on app startup: {e}")

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(farmer_bp, url_prefix='/api/farmer')
    app.register_blueprint(buyer_bp, url_prefix='/api/buyer')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(addresses_bp, url_prefix='/api/addresses')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(support_bp, url_prefix='/api/support')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Uploads static route
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Root & Health check
    @app.route('/')
    def root():
        return jsonify({
            'status': 'online',
            'app': 'KisanDirect API',
            'docs': '/api/health'
        })

    @app.route('/api/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'app': 'KisanDirect API',
            'database': 'connected',
            'version': '1.0.0'
        })

    # JWT Error handlers
    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return jsonify({'error': 'Missing authorization token. Please login.'}), 401

    @jwt.invalid_token_loader
    def invalid_token_response(callback):
        return jsonify({'error': 'Invalid or expired authorization token.'}), 401

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired. Please login again.'}), 401

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'Internal server error'}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        try:
            db.create_all()
            print("Database tables verified.")
        except Exception as e:
            print(f"Database init warning: {e}")
    port = int(os.environ.get('PORT', 5050))
    print(f"KisanDirect Backend running on http://0.0.0.0:{port} (accessible via localhost & Wi-Fi LAN)")
    app.run(host='0.0.0.0', port=port, debug=False)
