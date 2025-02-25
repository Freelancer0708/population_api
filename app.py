from flask import Flask, request, jsonify, render_template
import requests
import json

app = Flask(__name__)

# 国名の辞書（英語 ⇔ 日本語 ⇔ 国コード）
with open("data/country_codes.json", "r", encoding="utf-8") as f:
    country_dict = json.load(f)

def get_population_from_api(country_code):
    """ 世界銀行APIから人口データを取得 """
    url = f"https://api.worldbank.org/v2/country/{country_code}/indicator/SP.POP.TOTL?format=json"
    response = requests.get(url)

    try:
        data = response.json()
        if isinstance(data, list) and len(data) > 1 and "value" in data[1][0]:
            return data[1][0]["value"]  # 最新の人口データを取得
    except Exception as e:
        print(f"APIエラー: {e}")

    return None

def get_world_population():
    """ 世界全体の人口を取得 """
    url = "https://api.worldbank.org/v2/country/1W/indicator/SP.POP.TOTL?format=json"
    response = requests.get(url)

    try:
        data = response.json()
        if isinstance(data, list) and len(data) > 1 and "value" in data[1][0]:
            return data[1][0]["value"]
    except Exception as e:
        print(f"世界人口の取得エラー: {e}")

    return None

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/population", methods=["GET"])
def get_population():
    country_name = request.args.get("country")
    if not country_name:
        return jsonify({"error": "国名を入力してください"}), 400

    # 英語・日本語の両方に対応
    country_data = country_dict.get(country_name.lower()) or country_dict.get(country_name)

    if not country_data:
        return jsonify({"error": "国のデータが見つかりません"}), 404

    country_code = country_data["code"]
    population = get_population_from_api(country_code)

    if population:
        return jsonify({"country": country_data['name_jp'], "population": population})
    else:
        return jsonify({"error": "人口データが取得できませんでした"}), 500

@app.route("/api/world_population", methods=["GET"])
def get_world_population_api():
    """ フロントエンド用に世界人口を返すAPI """
    world_population = get_world_population()
    if world_population:
        return jsonify({"world_population": world_population})
    else:
        return jsonify({"error": "世界人口データを取得できませんでした"}), 500

if __name__ == "__main__":
    app.run(debug=True)
