import os

port = os.environ.get('PORT', '10000')
bind = f"0.0.0.0:{port}"
workers = 1
timeout = 120
graceful_timeout = 30
accesslog = "-"
errorlog = "-"
loglevel = "info"
