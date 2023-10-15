from decimal import Decimal
from models.bank_account import BankAccount
from models.share import DetailedShare, Stock
from models.stats_info import StatsInfo, StockStatsInfo
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
                """SELECT userid, checking_amt, savings_amt, amt_chk_LA, amt_sav_LA, games_played
                           FROM bank_acc
                           WHERE userid=%s""",
                (userid,),
            )
            sql_rows = cursor.fetchall()
            print(sql_rows)
            if not sql_rows:
                return None
            bank_account = [
                BankAccount(
                    userid=userid,
                    checking_amt=checking_amt,
                    savings_amt=savings_amt,
                    amt_chk_LA=amt_chk_LA,
                    amt_sav_LA=amt_sav_LA,
                    games_played=games_played,
                )
                for userid, checking_amt, savings_amt, amt_chk_LA, amt_sav_LA, games_played in sql_rows
            ][0]
            return bank_account


def choose_path(userid: str, choice: int):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.callproc("choose_path", (userid, choice))


def transfer_checking_to_savings(userid: str, amount: Decimal):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.callproc("transferCheckingToSavings", (userid, amount))


def transfer_savings_to_checking(userid: str, amount: Decimal):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.callproc("transferSavingsToChecking", (userid, amount))


def buy_stocks(userid: str, stockid: str, share_amount: int):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.callproc("buy_stocks", (userid, stockid, share_amount))


def sell_stocks(userid: str, stockid: str, share_amount: int):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.callproc("sell_stocks", (userid, stockid, share_amount))


def work(userid: str):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.callproc("work", (userid,))


def study(userid: str):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.callproc("study", (userid,))


def update_stats(userid: str) -> StatsInfo:
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.callproc("update_stats", (userid,))
            sql_rows = cursor.fetchone()
            if not sql_rows:
                return None
            stats_info = [
                StatsInfo(
                    p_new_net_worth,
                    p_new_checking,
                    p_new_savings,
                    p_old_net_worth,
                    p_old_checking,
                    p_old_savings,
                )
                for p_new_net_worth, p_new_checking, p_new_savings, p_old_net_worth, p_old_checking, p_old_savings in [
                    sql_rows
                ]
            ][0]
            return stats_info


def update_stock_stats(userid: str, stockid: str) -> StockStatsInfo:
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.callproc("update_stock_stats", (userid, stockid))
            sql_rows = cursor.fetchone()
            if not sql_rows:
                return None
            stock_stats_info = [
                StockStatsInfo(
                    p_old_value,
                    p_new_value,
                )
                for p_old_value, p_new_value in [sql_rows]
            ][0]
            return stock_stats_info


def played_game(userid: str) -> StockStatsInfo:
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.callproc("played_game", (userid,))
