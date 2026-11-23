import sys
import os
import unittest
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import create_app
from backend.extensions import db

class TestKisanDirectAPI(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_health(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'healthy')

    def test_farmer_workflow(self):
        # 1. Login as Farmer
        login_res = self.client.post('/api/auth/login', json={
            'mobile_number': '9876543210',
            'password': 'farmer123'
        })
        self.assertEqual(login_res.status_code, 200)
        login_data = login_res.get_json()
        self.assertIn('token', login_data)
        token = login_data['token']
        headers = {'Authorization': f'Bearer {token}'}

        # 2. Get Dashboard
        dash_res = self.client.get('/api/farmer/dashboard', headers=headers)
        self.assertEqual(dash_res.status_code, 200)
        dash_data = dash_res.get_json()
        self.assertIn('metrics', dash_data)
        self.assertGreater(dash_data['metrics']['total_products'], 0)

        # 3. Get Farmer Products
        prod_res = self.client.get('/api/farmer/products', headers=headers)
        self.assertEqual(prod_res.status_code, 200)

        # 4. Get Farmer Earnings
        earn_res = self.client.get('/api/farmer/earnings', headers=headers)
        self.assertEqual(earn_res.status_code, 200)

    def test_buyer_marketplace_and_order_workflow(self):
        # 1. Get Categories
        cat_res = self.client.get('/api/categories')
        self.assertEqual(cat_res.status_code, 200)
        cats = cat_res.get_json()['categories']
        self.assertGreater(len(cats), 0)

        # 2. Get Products (Public Marketplace)
        prod_res = self.client.get('/api/products?sort_by=newest')
        self.assertEqual(prod_res.status_code, 200)
        prods = prod_res.get_json()['products']
        self.assertGreater(len(prods), 0)
        first_prod = prods[0]

        # 3. Login as Buyer
        login_res = self.client.post('/api/auth/login', json={
            'mobile_number': '9123456780',
            'password': 'buyer123'
        })
        self.assertEqual(login_res.status_code, 200)
        token = login_res.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}

        # 4. Add to Cart
        add_res = self.client.post('/api/cart/items', headers=headers, json={
            'product_id': first_prod['id'],
            'quantity': 2
        })
        self.assertEqual(add_res.status_code, 200)

        # 5. View Cart
        cart_res = self.client.get('/api/cart', headers=headers)
        self.assertEqual(cart_res.status_code, 200)
        cart_data = cart_res.get_json()
        self.assertGreaterEqual(cart_data['item_count'], 1)

        # 6. Fetch Buyer Addresses
        addr_res = self.client.get('/api/addresses', headers=headers)
        self.assertEqual(addr_res.status_code, 200)
        addrs = addr_res.get_json()['addresses']
        self.assertGreater(len(addrs), 0)
        addr_id = addrs[0]['id']

        # 7. Place Order
        order_res = self.client.post('/api/orders', headers=headers, json={
            'address_id': addr_id,
            'payment_method': 'ONLINE_SANDBOX'
        })
        self.assertEqual(order_res.status_code, 201)
        order_data = order_res.get_json()['order']
        self.assertIn('order_number', order_data)

        # 8. View Orders
        my_orders_res = self.client.get('/api/orders', headers=headers)
        self.assertEqual(my_orders_res.status_code, 200)
        orders = my_orders_res.get_json()['orders']
        self.assertGreater(len(orders), 0)

if __name__ == '__main__':
    unittest.main()
