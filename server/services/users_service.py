from decimal import Decimal
from models.bank_account import BankAccount
from models.share import DetailedShare, Stock
from services.database_service import get_db_connection
from models.user import User
from typing import List, Optional


def get_users() -> List[User]:
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT username, userid, days_school_left, days_work_left, salary, net_worth_LA FROM users;"
            )
            user_rows = cursor.fetchall()
            users_list = [
                User(
                    username=username,
                    userid=userid,
                    days_school_left=days_school_left,
                    days_work_left=days_work_left,
                    salary=salary,
                    net_worth_LA=net_worth_LA,
                )
                for username, userid, days_school_left, days_work_left, salary, net_worth_LA in user_rows
            ]
            return users_list


def get_user(userid: str) -> Optional[User]:
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT username, userid, days_school_left, days_work_left, salary, net_worth_LA FROM users WHERE userid=%s",
                (userid,),
            )
            user_row = cursor.fetchone()
            if user_row is None:
                return None
            user = [
                User(
                    username=username,
                    userid=userid,
                    days_school_left=days_school_left,
                    days_work_left=days_work_left,
                    salary=salary,
                    net_worth_LA=net_worth_LA,
                )
                for username, userid, days_school_left, days_work_left, salary, net_worth_LA in [
                    user_row
                ]
            ][0]
            return user


def create_user(username: str, userid: str):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.callproc("addUser", (username, userid))


def get_stocks_of_user(userid: str) -> List[DetailedShare]:
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """SELECT userid, stocks.id, num_shares_owned, input_investment, 
                           name, tot_num_shares, market_price, shares_avail 
                           FROM owned_shares JOIN stocks ON owned_shares.id = stocks.id 
                           WHERE userid=%s""",
                (userid,),
            )
            sql_rows = cursor.fetchall()
            detailed_shares = [
                DetailedShare(
                    userid=userid,
                    stockid=stockid,
                    num_shares_owned=num_shares_owned,
                    input_investment=input_investment,
                    stock=Stock(
                        id=stockid,
                        name=name,
                        tot_num_shares=tot_num_shares,
                        market_price=market_price,
                        shares_avail=shares_avail,
                    ),
                )
                for userid, stockid, num_shares_owned, input_investment, name, tot_num_shares, market_price, shares_avail in sql_rows
            ]
            return detailed_shares


def get_bank_account_of_user(userid: str) -> BankAccount:
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """SELECT userid, checking_amt, savings_amt, amt_chk_LA, amt_sav_LA
                           FROM bank_acc
                           WHERE userid=%s""",
                (userid,),
            )
            sql_rows = cursor.fetchall()
            bank_account = [
                BankAccount(
                    userid=userid,
                    checking_amt=checking_amt,
                    savings_amt=savings_amt,
                    amt_chk_LA=amt_chk_LA,
                    amt_sav_LA=amt_sav_LA,
                )
                for userid, checking_amt, savings_amt, amt_chk_LA, amt_sav_LA in sql_rows
            ][0]
            return bank_account
