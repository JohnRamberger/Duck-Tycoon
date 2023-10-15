from decimal import Decimal
from flask import jsonify, Blueprint, request
from services.users_service import (
    buy_stocks,
    choose_path,
    create_user,
    get_bank_account_of_user,
    get_stocks_of_user,
    get_users,
    get_user,
    played_game,
    sell_stocks,
    study,
    transfer_checking_to_savings,
    transfer_savings_to_checking,
    update_stats,
    update_stock_stats,
    work,
)
from psycopg2.errors import UniqueViolation, RaiseException

users_route_blueprint = Blueprint("users", __name__, url_prefix="/user")


@users_route_blueprint.route("/", methods=["POST"])
def create_new_user():
    body_data = request.json
    if "username" not in body_data:
        return jsonify({"error": "No username provided"}), 400
    if "userid" not in body_data:
        return jsonify({"error": "No userid provided"}), 400
    try:
        create_user(body_data["username"], body_data["userid"])
    except UniqueViolation:
        return {"error": "userid already taken"}
    return {}, 201


@users_route_blueprint.route("/", methods=["GET"])
def fetch_list_users():
    user_list = get_users()
    return jsonify({"users": user_list})


@users_route_blueprint.route("/<userid>")
def fetch_get_user(userid: str):
    user = get_user(userid)
    if not user:
        return jsonify({"error": "No user found."}), 404
    else:
        return jsonify(user)


@users_route_blueprint.route("/<userid>/stocks")
def fetch_stocks_of_user(userid: str):
    return jsonify({"stocks": get_stocks_of_user(userid)})


@users_route_blueprint.route("/<userid>/bank_account")
def fetch_bank_account_of_user(userid: str):
    return jsonify({"bank_account": get_bank_account_of_user(userid)})


@users_route_blueprint.route(
    "/<userid>/actions/choose_path/<path_num>", methods=["POST"]
)
def run_choose_path(userid: str, path_num: int):
    path_num = int(path_num)
    if path_num < 0 or path_num > 1:
        return jsonify({"error": "only valid numbers are 0 (school) or 1 (work)"}), 400
    choose_path(userid, path_num)
    return {}, 200


@users_route_blueprint.route(
    "/<userid>/actions/transfer_checking_to_savings/<amount>", methods=["POST"]
)
def run_transfer_checking_to_savings(userid: str, amount: Decimal):
    try:
        transfer_checking_to_savings(userid, amount)
    except RaiseException:
        return jsonify({"error": "Insufficient funds in checking account"}), 400
    except Exception as e:
        print(e)
        return jsonify({"error": "Something went wrong"}), 400
    return {}, 200


@users_route_blueprint.route(
    "/<userid>/actions/transfer_savings_to_checking/<amount>", methods=["POST"]
)
def run_transfer_savings_to_checking(userid: str, amount: Decimal):
    try:
        transfer_savings_to_checking(userid, amount)
    except RaiseException:
        return jsonify({"error": "Insufficient funds in savings account"}), 400
    except Exception as e:
        print(e)
        return jsonify({"error": "Something went wrong"}), 400
    return {}, 200


@users_route_blueprint.route(
    "/<userid>/actions/buy_stocks/stock/<stockid>/<share_amount>", methods=["POST"]
)
def run_buy_stocks(userid: str, stockid: str, share_amount: int):
    try:
        buy_stocks(userid, stockid, share_amount)
    except RaiseException:
        return jsonify({"error": "Insufficient funds in checking account"}), 400
    except Exception as e:
        print(e)
        return jsonify({"error": "Something went wrong"}), 400
    return {}, 200


@users_route_blueprint.route(
    "/<userid>/actions/sell_stocks/stock/<stockid>/<share_amount>", methods=["POST"]
)
def run_sell_stocks(userid: str, stockid: str, share_amount: int):
    try:
        sell_stocks(userid, stockid, share_amount)
    except RaiseException:
        return jsonify({"error": "Insufficient shares to sell"}), 400
    except Exception as e:
        print(e)
        return jsonify({"error": "Something went wrong"}), 400
    return {}, 200


@users_route_blueprint.route("/<userid>/actions/work/", methods=["POST"])
def run_work(userid: str):
    try:
        work(userid)
    except Exception as e:
        print(e)
        return jsonify({"error": "Something went wrong"}), 400
    return {}, 200


@users_route_blueprint.route("/<userid>/actions/study/", methods=["POST"])
def run_study(userid: str):
    try:
        study(userid)
    except Exception as e:
        print(e)
        return jsonify({"error": "Something went wrong"}), 400
    return {}, 200


@users_route_blueprint.route("/<userid>/actions/update_stats/", methods=["POST"])
def run_update_stats(userid: str):
    try:
        stats = update_stats(userid)

        return jsonify(stats), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Something went wrong"}), 400


@users_route_blueprint.route(
    "/<userid>/actions/update_stock_stats/stock/<stockid>", methods=["POST"]
)
def run_update_stock_stats(userid: str, stockid: str):
    try:
        stats = update_stock_stats(userid, stockid)
        return jsonify(stats), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "Something went wrong"}), 400


@users_route_blueprint.route("/<userid>/actions/played_game/", methods=["POST"])
def run_played_game(userid: str):
    try:
        played_game(userid)
    except Exception as e:
        print(e)
        return jsonify({"error": "Something went wrong"}), 400
    return {}, 200
