from dataclasses import dataclass
from decimal import Decimal


@dataclass
class User:
    username: str
    userid: str
    days_school_left: int
    days_work_left: int
    salary: Decimal
    net_worth_LA: Decimal
