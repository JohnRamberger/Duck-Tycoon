from dataclasses import dataclass
from decimal import Decimal


@dataclass
class StatsInfo:
    p_new_net_worth: Decimal
    p_new_checking: Decimal
    p_new_savings: Decimal
    p_old_net_worth: Decimal
    p_old_checking: Decimal
    p_old_savings: Decimal


@dataclass
class StockStatsInfo:
    p_old_value: Decimal
    p_new_value: Decimal
