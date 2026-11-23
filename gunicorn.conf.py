import os

# Automatically bind to Render's dynamic PORT or fallback to 10000
port = os.environ.get('PORT', '10000')
bind = f"0.0.0.0:{port}"
workers = 2
threads = 2
timeout = 120
accesslog = "-"
errorlog = "-"
