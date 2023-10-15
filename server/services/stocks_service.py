from typing import List

from models.share import Stock
from services.database_service import get_db_connection


def get_stocks() -> List[Stock]:
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """SELECT id, name, tot_num_shares, market_price, shares_avail
                   FROM stocks;"""
            )

            sql_rows = cursor.fetchall()

            stocks_list = [
                Stock(
                    id=id,
                    name=name,
                    tot_num_shares=tot_num_shares,
                    market_price=market_price,
                    shares_avail=shares_avail,
                )
                for id, name, tot_num_shares, market_price, shares_avail in sql_rows
            ]
            return stocks_list
