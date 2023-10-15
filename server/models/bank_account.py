from dataclasses import dataclass
from decimal import Decimal


@dataclass
class BankAccount:
    userid: str
    checking_amt: Decimal
    savings_amt: Decimal
    amt_chk_LA: Decimal
    amt_sav_LA: Decimal
