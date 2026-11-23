import os
import sys

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
backend_path = os.path.join(BASE_DIR, 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

import backend.app as backend_app

app = backend_app.app
create_app = backend_app.create_app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5050))
    app.run(host='0.0.0.0', port=port)
