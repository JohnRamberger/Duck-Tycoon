from flask import jsonify, Blueprint
from services.stocks_service import get_stocks

stocks_route_blueprint = Blueprint("stocks", __name__, url_prefix="/stock")


@stocks_route_blueprint.route("/")
def fetch_list_stocks():
    stocks_list = get_stocks()
    return jsonify({"stocks": stocks_list})
