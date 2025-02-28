import os
from datetime import datetime, timezone
from flask import Flask, redirect, url_for, session, render_template, request, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import (
    LoginManager,
    UserMixin,
    login_user,
    logout_user,
    current_user,
    login_required
)
from authlib.integrations.flask_client import OAuth
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

login_manager = LoginManager(app)
login_manager.login_view = 'index'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(100), unique=True, nullable=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(200), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

app.config['GOOGLE_CLIENT_ID'] = "830614235307-479inej7v2ur154b60vts8f354an7fco.apps.googleusercontent.com"
app.config['GOOGLE_CLIENT_SECRET'] = "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"

oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=app.config['GOOGLE_CLIENT_ID'],
    client_secret=app.config['GOOGLE_CLIENT_SECRET'],
    access_token_url='https://accounts.google.com/o/oauth2/token',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    client_kwargs={'scope': 'openid email profile'},
)

@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')
    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        login_user(user)
        return redirect(url_for('dashboard'))
    else:
        flash("Invalid email or password", "error")
        return redirect(url_for('index'))

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    order_name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    purchase_datetime = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

@app.route('/checkout', methods=['POST'])
@login_required
def checkout():
    data = request.get_json()
    if not data or 'cart' not in data:
        return jsonify({"error": "No cart data provided"}), 400
    cart = data['cart']
    for item in cart:
        order_name = item.get('name')
        price = item.get('price')
        quantity = item.get('quantity')
        if not order_name or price is None or quantity is None:
            continue
        new_order = Order(order_name=order_name, price=price, quantity=quantity)
        db.session.add(new_order)
    db.session.commit()
    return jsonify({"message": "Order placed successfully!"}), 200

@app.route('/signup', methods=['POST'])
def signup():
    name = request.form.get('name')
    email = request.form.get('email')
    role = request.form.get('role')
    password = request.form.get('password')
    if not all([name, email, role, password]):
        flash("Please fill out all fields", "error")
        return redirect(url_for('index'))
    if role not in ['customer', 'farmer']:
        flash("Invalid role selected", "error")
        return redirect(url_for('index'))
    if len(password) < 6:
        flash("Password must be at least 6 characters long", "error")
        return redirect(url_for('index'))
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        flash("Email already registered. Please log in.", "error")
        return redirect(url_for('index'))
    hashed_password = generate_password_hash(password)
    new_user = User(name=name, email=email, role=role, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    login_user(new_user)
    return redirect(url_for('dashboard'))

@app.route('/login/google')
def google_login():
    redirect_uri = url_for('google_authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/login/google/callback')
def google_authorize():
    try:
        token = google.authorize_access_token()
        user_info = google.get('userinfo').json()
    except Exception:
        flash("Google login failed", "error")
        return redirect(url_for('index'))
    if not user_info or 'email' not in user_info:
        flash("Failed to retrieve user information from Google", "error")
        return redirect(url_for('index'))
    user = User.query.filter_by(email=user_info['email']).first()
    if user:
        login_user(user)
    else:
        user = User(
            google_id=user_info['id'],
            name=user_info['name'],
            email=user_info['email'],
            role='customer',
            password=generate_password_hash("default-password")
        )
        db.session.add(user)
        db.session.commit()
        login_user(user)
    return redirect(url_for('dashboard'))

@app.route('/dashboard')
@login_required
def dashboard():
    if current_user.role == 'customer':
        return redirect(url_for('home'))
    elif current_user.role == 'farmer':
        return redirect(url_for('farmerhome'))
    else:
        flash("User role is not set correctly", "error")
        return redirect(url_for('index'))

@app.route('/home')
@login_required
def home():
    return render_template('home.html', name=current_user.name)

@app.route('/farmerhome')
@login_required
def farmerhome():
    return render_template('farmerhome.html', name=current_user.name)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    session.clear()
    return redirect(url_for('index'))

@app.route('/customer')
def customer():
    return render_template('customer.html')

@app.route('/features')
def features():
    return render_template('features.html')

@app.route('/about')
def about():
    return render_template('about.html')

if __name__ == '__main__':
    with app.app_context():
        db.drop_all()
        db.create_all()
    app.run(debug=True)
