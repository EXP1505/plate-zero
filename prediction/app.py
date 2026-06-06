from flask import Flask, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.linear_model import LinearRegression
from collections import defaultdict
import requests
import os
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

API_BASE_URL = os.environ.get('API_BASE_URL', 'http://localhost:5000')


def get_waste_data():
    """Fetch historical waste data from the Node.js API."""
    try:
        # First login as admin to get a token
        login_resp = requests.post(f'{API_BASE_URL}/api/auth/login', json={
            'email': 'admin@platezero.com',
            'password': 'admin123'
        }, timeout=5)

        if login_resp.status_code != 200:
            return None

        token = login_resp.json().get('token')

        # Fetch last 30 days of waste data
        resp = requests.get(
            f'{API_BASE_URL}/api/waste',
            params={'limit': 500},
            headers={'Authorization': f'Bearer {token}'},
            timeout=5
        )

        if resp.status_code != 200:
            return None

        return resp.json().get('entries', [])
    except Exception as e:
        print(f'Error fetching waste data: {e}')
        return None


def prepare_total_features(entries):
    """Transform waste entries into features for the total waste model."""
    if not entries or len(entries) < 7:
        return None, None

    # Group entries by date
    daily_data = {}
    for entry in entries:
        date_str = entry['date'][:10]  # YYYY-MM-DD
        if date_str not in daily_data:
            daily_data[date_str] = {'total_waste': 0}

        total_waste = sum(item.get('wastedKg', 0) for item in entry.get('items', []))
        daily_data[date_str]['total_waste'] += total_waste

    # Sort by date
    sorted_dates = sorted(daily_data.keys())

    if len(sorted_dates) < 7:
        return None, None

    X = []
    y = []

    for i in range(7, len(sorted_dates)):
        date = datetime.strptime(sorted_dates[i], '%Y-%m-%d')
        day_of_week = date.weekday()  # 0=Mon, 6=Sun

        one_hot = [0] * 7
        one_hot[day_of_week] = 1

        rolling_avg = np.mean([
            daily_data[sorted_dates[j]]['total_waste']
            for j in range(i - 7, i)
        ])

        prev_waste = daily_data[sorted_dates[i - 1]]['total_waste']

        features = one_hot + [rolling_avg, prev_waste]
        X.append(features)
        y.append(daily_data[sorted_dates[i]]['total_waste'])

    return np.array(X), np.array(y), daily_data


@app.route('/predict', methods=['GET'])
def predict():
    """Predict tomorrow's total waste and the most wasted individual dish."""
    entries = get_waste_data()

    if not entries:
        return jsonify({
            'predictions': [],
            'error': 'Could not fetch waste data from API',
        }), 200

    X_total, y_total, daily_data = prepare_total_features(entries)

    if X_total is None or len(X_total) < 3:
        return jsonify({
            'predictions': [],
            'error': 'Not enough historical data for prediction (need at least 14 days)',
        }), 200

    # Train total waste model
    model = LinearRegression()
    model.fit(X_total, y_total)
    r2_score = model.score(X_total, y_total)

    tomorrow = datetime.now() + timedelta(days=1)
    day_of_week = tomorrow.weekday()

    one_hot = [0] * 7
    one_hot[day_of_week] = 1

    sorted_dates = sorted(daily_data.keys())
    last_7 = [daily_data[d]['total_waste'] for d in sorted_dates[-7:]]
    rolling_avg = np.mean(last_7) if last_7 else 0
    prev_waste = last_7[-1] if last_7 else 0

    features = np.array([one_hot + [rolling_avg, prev_waste]])
    predicted_total_waste = max(0, float(model.predict(features)[0]))

    # --- ITEM LEVEL PREDICTION ---
    # Calculate historical average and trend for each item to predict tomorrow's top wasted item
    dish_stats = defaultdict(lambda: {'total_wasted': 0, 'count': 0, 'recent_wasted': 0, 'category': ''})
    
    # Consider "recent" as the last 7 days of data
    recent_cutoff_date = (datetime.strptime(sorted_dates[-1], '%Y-%m-%d') - timedelta(days=7)).strftime('%Y-%m-%d')

    for entry in entries:
        date_str = entry['date'][:10]
        for item in entry.get('items', []):
            name = item.get('dishName', 'Unknown')
            wasted = item.get('wastedKg', 0)
            category = item.get('category', 'Unknown')
            
            dish_stats[name]['total_wasted'] += wasted
            dish_stats[name]['count'] += 1
            dish_stats[name]['category'] = category
            
            if date_str >= recent_cutoff_date:
                dish_stats[name]['recent_wasted'] += wasted

    # Predict next day's waste for each dish based on a weighted average (70% recent, 30% historical)
    dish_predictions = []
    for name, stats in dish_stats.items():
        if stats['count'] > 0:
            hist_avg = stats['total_wasted'] / stats['count']
            # Recent average (approx over 7 days if served daily, else scales by presence)
            recent_avg = stats['recent_wasted'] / min(7, stats['count']) 
            
            # Simple weighted prediction
            pred_waste = (recent_avg * 0.7) + (hist_avg * 0.3)
            dish_predictions.append({
                'name': name,
                'predictedWasteKg': round(pred_waste, 1),
                'category': stats['category']
            })

    # Sort and pick the top one
    dish_predictions.sort(key=lambda x: x['predictedWasteKg'], reverse=True)
    top_dish = dish_predictions[0] if dish_predictions else None

    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    return jsonify({
        'predictions': [
            {
                'date': tomorrow.strftime('%Y-%m-%d'),
                'dayName': day_names[day_of_week],
                'predictedWasteKg': round(predicted_total_waste, 1),
                'confidence': round(max(0, min(1, r2_score)) * 100, 1),
                'topPredictedDish': top_dish
            }
        ],
        'modelInfo': {
            'type': 'Linear Regression & Weighted Averages',
            'trainedOn': len(y_total),
            'r2Score': round(r2_score, 3),
            'features': ['day_of_week', '7_day_rolling_avg', 'previous_day_waste', 'item_historical_trends'],
        },
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'platezero-prediction'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f'[Prediction] Service running on port {port}')
    app.run(host='0.0.0.0', port=port, debug=True)
