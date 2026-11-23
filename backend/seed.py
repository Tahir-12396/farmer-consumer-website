import sys
import os
from decimal import Decimal
from datetime import datetime, date, timedelta

# Add parent directory to sys.path so backend module resolves
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import create_app
from backend.extensions import db
from backend.models import (
    User, FarmerProfile, BuyerProfile, Address, Category, Product,
    Order, FarmerOrder, OrderItem, Payment, Notification
)

app = create_app()

def seed_database():
    with app.app_context():
        print("Ensuring all database tables exist in MySQL...")
        db.create_all()

        # Check if already seeded
        if Category.query.count() > 0:
            print("Database already contains data. Skipping re-seed.")
            return

        print("Seeding Categories...")
        categories = [
            Category(
                name="Vegetables",
                description="Fresh, farm-harvested green vegetables, tubers, and organic produce.",
                image="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80"
            ),
            Category(
                name="Fruits",
                description="Naturally ripened, pesticide-free seasonal fruits harvested directly from orchards.",
                image="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80"
            ),
            Category(
                name="Grains",
                description="Traditional paddy, wheat, millets, and staple cereals grown with authentic farming methods.",
                image="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80"
            ),
            Category(
                name="Pulses",
                description="High-protein lentils, desi chickpeas, red gram (toor dal), and unpolished pulses.",
                image="https://images.unsplash.com/photo-1585992629739-89f81ec40ef8?w=500&auto=format&fit=crop&q=80"
            ),
            Category(
                name="Spices",
                description="Pure farm turmeric, Guntur red chillies, coriander seeds, and whole aromatic spices.",
                image="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80"
            ),
            Category(
                name="Other Products",
                description="Cold-pressed organic oils, wild forest honey, organic jaggery, and rural dairy products.",
                image="https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80"
            )
        ]
        db.session.add_all(categories)
        db.session.flush()

        cat_map = {c.name: c.id for c in categories}

        print("Seeding Users & Profiles...")
        # Admin User
        admin_user = User(
            full_name="Platform Administrator",
            email="admin@gmail.com",
            mobile_number="9000000000",
            role="admin",
            language="en",
            is_verified=True,
            is_active=True
        )
        admin_user.set_password("admin123")
        db.session.add(admin_user)

        print("Seeding Farmer Accounts...")
        # Farmer 1
        farmer1_user = User(
            full_name="Ramesh Patel",
            mobile_number="9876543210",
            role="farmer",
            language="en",
            is_verified=True,
            is_active=True
        )
        farmer1_user.set_password("farmer123")
        db.session.add(farmer1_user)
        db.session.flush()

        farmer1_profile = FarmerProfile(
            user_id=farmer1_user.id,
            farm_name="Green Valley Organic Farms",
            village="Kandi",
            district="Sangareddy",
            state="Telangana",
            pincode="502285"
        )
        db.session.add(farmer1_profile)

        # Farmer 2
        farmer2_user = User(
            full_name="Lakshmi Devi",
            mobile_number="9876543211",
            role="farmer",
            language="te",
            is_verified=True,
            is_active=True
        )
        farmer2_user.set_password("farmer123")
        db.session.add(farmer2_user)
        db.session.flush()

        farmer2_profile = FarmerProfile(
            user_id=farmer2_user.id,
            farm_name="Annapurna Natural Orchards",
            village="Shamshabad",
            district="Rangareddy",
            state="Telangana",
            pincode="501218"
        )
        db.session.add(farmer2_profile)

        # Farmer 3
        farmer3_user = User(
            full_name="Suresh Kumar",
            mobile_number="9876543212",
            role="farmer",
            language="hi",
            is_verified=True,
            is_active=True
        )
        farmer3_user.set_password("farmer123")
        db.session.add(farmer3_user)
        db.session.flush()

        farmer3_profile = FarmerProfile(
            user_id=farmer3_user.id,
            farm_name="Kaveri Spice & Pulse Fields",
            village="Tenali",
            district="Guntur",
            state="Andhra Pradesh",
            pincode="522201"
        )
        db.session.add(farmer3_profile)
        db.session.flush()

        print("Seeding Buyer Accounts...")
        # Buyer 1
        buyer1_user = User(
            full_name="Ananya Sharma",
            mobile_number="9123456780",
            role="buyer",
            language="en",
            is_verified=True,
            is_active=True
        )
        buyer1_user.set_password("buyer123")
        db.session.add(buyer1_user)
        db.session.flush()

        buyer1_profile = BuyerProfile(user_id=buyer1_user.id)
        db.session.add(buyer1_profile)

        buyer1_address1 = Address(
            user_id=buyer1_user.id,
            door_number="Flat 402, Sai Residency",
            street="Road No 12, Banjara Hills",
            village="Hyderabad",
            district="Hyderabad",
            state="Telangana",
            pincode="500034",
            landmark="Near City Center Mall",
            is_default=True
        )
        buyer1_address2 = Address(
            user_id=buyer1_user.id,
            door_number="Plot 58",
            street="Cyber Hills Colony, Gachibowli",
            village="Hyderabad",
            district="Rangareddy",
            state="Telangana",
            pincode="500032",
            landmark="Behind DLF Cyber City",
            is_default=False
        )
        db.session.add_all([buyer1_address1, buyer1_address2])

        # Buyer 2
        buyer2_user = User(
            full_name="Priya Verma",
            mobile_number="9123456781",
            role="buyer",
            language="te",
            is_verified=True,
            is_active=True
        )
        buyer2_user.set_password("buyer123")
        db.session.add(buyer2_user)
        db.session.flush()

        buyer2_profile = BuyerProfile(user_id=buyer2_user.id)
        db.session.add(buyer2_profile)

        buyer2_address = Address(
            user_id=buyer2_user.id,
            door_number="House 12-4-88",
            street="Marredpally Main Road",
            village="Secunderabad",
            district="Hyderabad",
            state="Telangana",
            pincode="500026",
            landmark="Opposite Clock Tower",
            is_default=True
        )
        db.session.add(buyer2_address)
        db.session.flush()

        print("Seeding Agricultural Products...")
        products = [
            # Vegetables
            Product(
                farmer_id=farmer1_profile.id,
                category_id=cat_map["Vegetables"],
                name="Fresh Country Tomatoes (Desi)",
                description="Juicy, tangy organic tomatoes picked directly from the vine this morning. Excellent for curries, salads and rasam.",
                image_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
                price=Decimal('32.00'),
                unit="kg",
                available_quantity=Decimal('85.00'),
                location="Sangareddy, Telangana",
                harvest_date=date.today() - timedelta(days=1),
                is_organic=True,
                is_available=True
            ),
            Product(
                farmer_id=farmer1_profile.id,
                category_id=cat_map["Vegetables"],
                name="Crisp Farm Red Onions",
                description="Directly harvested Nashik-variety red onions with high shelf life and crisp texture. Pure farm flavor.",
                image_url="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80",
                price=Decimal('28.00'),
                unit="kg",
                available_quantity=Decimal('120.00'),
                location="Sangareddy, Telangana",
                harvest_date=date.today() - timedelta(days=2),
                is_organic=False,
                is_available=True
            ),
            Product(
                farmer_id=farmer1_profile.id,
                category_id=cat_map["Vegetables"],
                name="Tender Green Ladyfinger (Bhindi)",
                description="Handpicked morning tender bhindi without chemical pesticides. Crisp, snap-fresh pods.",
                image_url="https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80",
                price=Decimal('45.00'),
                unit="kg",
                available_quantity=Decimal('40.00'),
                location="Sangareddy, Telangana",
                harvest_date=date.today(),
                is_organic=True,
                is_available=True
            ),
            Product(
                farmer_id=farmer2_profile.id,
                category_id=cat_map["Vegetables"],
                name="Farm Fresh Spinach (Palak)",
                description="Lush green spinach bundles grown with bio-compost and zero synthetic fertilizers. Clean and nutrient dense.",
                image_url="https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80",
                price=Decimal('20.00'),
                unit="bunch",
                available_quantity=Decimal('60.00'),
                location="Rangareddy, Telangana",
                harvest_date=date.today(),
                is_organic=True,
                is_available=True
            ),
            Product(
                farmer_id=farmer2_profile.id,
                category_id=cat_map["Vegetables"],
                name="Native Purple Brinjal (Vankaya)",
                description="Traditional purple striped brinjals, soft seedless texture, perfect for stuffed gutti vankaya curry.",
                image_url="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80",
                price=Decimal('38.00'),
                unit="kg",
                available_quantity=Decimal('50.00'),
                location="Rangareddy, Telangana",
                harvest_date=date.today() - timedelta(days=1),
                is_organic=True,
                is_available=True
            ),

            # Fruits
            Product(
                farmer_id=farmer2_profile.id,
                category_id=cat_map["Fruits"],
                name="Kesar Mangoes (Tree Ripened)",
                description="Sweet and intensely aromatic Kesar mangoes ripened naturally on trees without carbide or chemicals.",
                image_url="https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80",
                price=Decimal('140.00'),
                unit="kg",
                available_quantity=Decimal('75.00'),
                location="Rangareddy, Telangana",
                harvest_date=date.today() - timedelta(days=2),
                is_organic=True,
                is_available=True
            ),
            Product(
                farmer_id=farmer2_profile.id,
                category_id=cat_map["Fruits"],
                name="Sweet Red Papaya (Taiwan-786)",
                description="Sun-ripened orange-red flesh papaya rich in natural vitamins and enzymes. Naturally grown.",
                image_url="https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600&auto=format&fit=crop&q=80",
                price=Decimal('35.00'),
                unit="piece",
                available_quantity=Decimal('35.00'),
                location="Rangareddy, Telangana",
                harvest_date=date.today() - timedelta(days=1),
                is_organic=True,
                is_available=True
            ),
            Product(
                farmer_id=farmer1_profile.id,
                category_id=cat_map["Fruits"],
                name="Organic Guava (Allahabad Safeda)",
                description="White-flesh crunchy sweet guavas freshly picked from orchard trees. High vitamin C.",
                image_url="https://images.unsplash.com/photo-1536511135899-73600f959e1c?w=600&auto=format&fit=crop&q=80",
                price=Decimal('55.00'),
                unit="kg",
                available_quantity=Decimal('45.00'),
                location="Sangareddy, Telangana",
                harvest_date=date.today(),
                is_organic=True,
                is_available=True
            ),

            # Grains
            Product(
                farmer_id=farmer1_profile.id,
                category_id=cat_map["Grains"],
                name="Sona Masoori Raw Rice (Aged 1 Year)",
                description="Single-origin aromatic Sona Masoori rice aged 1 year. Light, fluffy, and ideal for daily meals.",
                image_url="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
                price=Decimal('62.00'),
                unit="kg",
                available_quantity=Decimal('300.00'),
                location="Sangareddy, Telangana",
                harvest_date=date.today() - timedelta(days=60),
                is_organic=True,
                is_available=True
            ),
            Product(
                farmer_id=farmer3_profile.id,
                category_id=cat_map["Grains"],
                name="Organic Foxtail Millet (Korra)",
                description="Gluten-free traditional superfood grain. High dietary fiber and low glycemic index.",
                image_url="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80",
                price=Decimal('85.00'),
                unit="kg",
                available_quantity=Decimal('150.00'),
                location="Guntur, Andhra Pradesh",
                harvest_date=date.today() - timedelta(days=30),
                is_organic=True,
                is_available=True
            ),

            # Pulses
            Product(
                farmer_id=farmer3_profile.id,
                category_id=cat_map["Pulses"],
                name="Unpolished Desi Toor Dal (Pigeon Pea)",
                description="Stone-milled, unpolished toor dal retaining all outer nutrient bran. Cooks creamy and flavorful.",
                image_url="https://images.unsplash.com/photo-1585992629739-89f81ec40ef8?w=600&auto=format&fit=crop&q=80",
                price=Decimal('145.00'),
                unit="kg",
                available_quantity=Decimal('90.00'),
                location="Guntur, Andhra Pradesh",
                harvest_date=date.today() - timedelta(days=20),
                is_organic=True,
                is_available=True
            ),
            Product(
                farmer_id=farmer3_profile.id,
                category_id=cat_map["Pulses"],
                name="Organic Yellow Moong Dal",
                description="Pure native green gram split dal. Gentle on digestion, rich in plant protein.",
                image_url="https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=80",
                price=Decimal('135.00'),
                unit="kg",
                available_quantity=Decimal('80.00'),
                location="Guntur, Andhra Pradesh",
                harvest_date=date.today() - timedelta(days=25),
                is_organic=True,
                is_available=True
            ),

            # Spices
            Product(
                farmer_id=farmer3_profile.id,
                category_id=cat_map["Spices"],
                name="Pure Lakadong Turmeric Powder (High Curcumin)",
                description="Single-estate hand-pounded turmeric powder with >7% natural curcumin content. Natural healing spice.",
                image_url="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80",
                price=Decimal('220.00'),
                unit="kg",
                available_quantity=Decimal('65.00'),
                location="Guntur, Andhra Pradesh",
                harvest_date=date.today() - timedelta(days=40),
                is_organic=True,
                is_available=True
            ),
            Product(
                farmer_id=farmer3_profile.id,
                category_id=cat_map["Spices"],
                name="Guntur Sannam Red Chillies (Stemless)",
                description="World-renowned Guntur sun-dried fiery red chillies. Crisp, vibrant red and aromatic.",
                image_url="https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80",
                price=Decimal('190.00'),
                unit="kg",
                available_quantity=Decimal('50.00'),
                location="Guntur, Andhra Pradesh",
                harvest_date=date.today() - timedelta(days=15),
                is_organic=False,
                is_available=True
            ),

            # Other Products
            Product(
                farmer_id=farmer2_profile.id,
                category_id=cat_map["Other Products"],
                name="Pure Wild Honey (Raw & Unprocessed)",
                description="100% natural forest honey extracted using traditional non-destructive comb filtration. Zero sugar syrup.",
                image_url="https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80",
                price=Decimal('350.00'),
                unit="litre",
                available_quantity=Decimal('30.00'),
                location="Rangareddy, Telangana",
                harvest_date=date.today() - timedelta(days=10),
                is_organic=True,
                is_available=True
            ),
            Product(
                farmer_id=farmer1_profile.id,
                category_id=cat_map["Other Products"],
                name="Cold-Pressed Groundnut Oil (Wood Churn)",
                description="Extracted using traditional Vaagai wood cold-press (Ganuga/Chekku). Unrefined with authentic aroma.",
                image_url="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
                price=Decimal('240.00'),
                unit="litre",
                available_quantity=Decimal('45.00'),
                location="Sangareddy, Telangana",
                harvest_date=date.today() - timedelta(days=8),
                is_organic=True,
                is_available=True
            )
        ]
        db.session.add_all(products)
        db.session.flush()

        print("Seeding Initial Order...")
        # Create a sample completed order so farmers and buyers see real historical activity
        sample_order = Order(
            order_number="KD-20261122-INIT01",
            buyer_id=buyer1_user.id,
            address_id=buyer1_address1.id,
            subtotal=Decimal('374.00'),
            delivery_fee=Decimal('40.00'),
            total_amount=Decimal('414.00'),
            payment_status="Successful",
            order_status="Completed",
            payment_method="UPI",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.session.add(sample_order)
        db.session.flush()

        fo1 = FarmerOrder(
            order_id=sample_order.id,
            farmer_id=farmer1_profile.id,
            subtotal=Decimal('229.00'),
            status="Completed",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        fo2 = FarmerOrder(
            order_id=sample_order.id,
            farmer_id=farmer3_profile.id,
            subtotal=Decimal('145.00'),
            status="Completed",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.session.add_all([fo1, fo2])
        db.session.flush()

        # Order items
        oi1 = OrderItem(
            order_id=sample_order.id,
            farmer_order_id=fo1.id,
            product_id=products[0].id,
            product_name_snapshot=products[0].name,
            unit_price=products[0].price,
            unit=products[0].unit,
            quantity=Decimal('3.00'),
            subtotal=Decimal('96.00')
        )
        oi2 = OrderItem(
            order_id=sample_order.id,
            farmer_order_id=fo1.id,
            product_id=products[1].id,
            product_name_snapshot=products[1].name,
            unit_price=products[1].price,
            unit=products[1].unit,
            quantity=Decimal('2.00'),
            subtotal=Decimal('56.00')
        )
        oi3 = OrderItem(
            order_id=sample_order.id,
            farmer_order_id=fo1.id,
            product_id=products[2].id,
            product_name_snapshot=products[2].name,
            unit_price=products[2].price,
            unit=products[2].unit,
            quantity=Decimal('1.71'),
            subtotal=Decimal('77.00')
        )
        oi4 = OrderItem(
            order_id=sample_order.id,
            farmer_order_id=fo2.id,
            product_id=products[10].id,
            product_name_snapshot=products[10].name,
            unit_price=products[10].price,
            unit=products[10].unit,
            quantity=Decimal('1.00'),
            subtotal=Decimal('145.00')
        )
        db.session.add_all([oi1, oi2, oi3, oi4])

        pay = Payment(
            order_id=sample_order.id,
            payment_provider="UPI",
            transaction_id="TXN-INIT-UPI-2026",
            amount=Decimal('414.00'),
            status="Successful",
            payment_reference="REF-KD-20261122-INIT01",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.session.add(pay)

        db.session.commit()
        print("Database seeded successfully with 6 categories, 3 farmers, 2 buyers, 16 products, and initial orders!")

if __name__ == '__main__':
    seed_database()
