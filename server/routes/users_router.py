from flask import jsonify, Blueprint, request
from services.users_service import (
    create_user,
    get_bank_account_of_user,
    get_stocks_of_user,
    get_users,
    get_user,
)
from psycopg2.errors import UniqueViolation

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
