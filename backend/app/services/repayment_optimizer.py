from ..models import RepaymentPlan, RepaymentStrategy
import numpy as np
from typing import List

def calculate_investment_returns(amount: float, months: int, rate: float) -> float:
    """Calculate potential returns if money was invested instead"""
    monthly_rate = rate / 12
    return amount * ((1 + monthly_rate) ** months - 1)

def optimize_repayment(plan: RepaymentPlan) -> List[RepaymentStrategy]:
    strategies = []
    
    # Calculate minimum monthly payment
    min_monthly = plan.total_amount / plan.max_timeline_months
    
    # Strategy 1: Minimum payments, invest the rest
    monthly_available = min(plan.monthly_income * 0.3, plan.monthly_budget or float('inf'))
    potential_investment = monthly_available - min_monthly
    
    min_payment_strategy = RepaymentStrategy(
        monthly_payment=min_monthly,
        total_interest_paid=plan.total_amount * (plan.debt_interest_rate * plan.max_timeline_months / 12),
        potential_investment_gains=calculate_investment_returns(potential_investment, plan.max_timeline_months, plan.savings_interest_rate),
        total_cost=plan.total_amount + (plan.total_amount * plan.debt_interest_rate * plan.max_timeline_months / 12),
        payment_schedule=[{
            "month": i+1,
            "payment": min_monthly,
            "remaining_balance": plan.total_amount - (min_monthly * (i+1))
        } for i in range(plan.max_timeline_months)],
        risk_level="LOW",
        recommended=True
    )
    strategies.append(min_payment_strategy)
    
    # Strategy 2: Aggressive payment
    aggressive_monthly = monthly_available
    months_needed = np.ceil(plan.total_amount / aggressive_monthly)
    
    aggressive_strategy = RepaymentStrategy(
        monthly_payment=aggressive_monthly,
        total_interest_paid=plan.total_amount * (plan.debt_interest_rate * months_needed / 12),
        potential_investment_gains=0,
        total_cost=plan.total_amount + (plan.total_amount * plan.debt_interest_rate * months_needed / 12),
        payment_schedule=[{
            "month": i+1,
            "payment": aggressive_monthly,
            "remaining_balance": max(0, plan.total_amount - (aggressive_monthly * (i+1)))
        } for i in range(int(months_needed))],
        risk_level="MEDIUM",
        recommended=False
    )
    strategies.append(aggressive_strategy)
    
    return strategies 