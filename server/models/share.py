from dataclasses import dataclass
from decimal import Decimal


@dataclass
class Stock:
    id: int
    name: str
    tot_num_shares: int
    market_price: Decimal
    shares_avail: int


@dataclass
class DetailedShare:
    userid: str
    stockid: str
    stock: Stock
    num_shares_owned: int
    input_investment: Decimal
