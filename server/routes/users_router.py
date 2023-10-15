from flask import jsonify, Blueprint
from services.users_service import (
    get_bank_account_of_user,
    get_stocks_of_user,
    get_users,
    get_user,
)

users_route_blueprint = Blueprint("users", __name__, url_prefix="/user")


@users_route_blueprint.route("/")
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
