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
    monthly_available = min(plan.monthly_income * 0.3, plan.monthly_budget or float('inf'))
    potential_investment = monthly_available - min_monthly
    
    # Strategy 1: Minimum payments with investment
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
        recommended=True,
        explanation=f"""This strategy balances debt repayment with potential investment gains:

1. Monthly Payment: ${min_monthly:.2f}
   - Make minimum payments over {plan.max_timeline_months} months
   - Keeps your monthly obligation low and predictable

2. Investment Opportunity:
   - You'll have ${potential_investment:.2f} available each month for investments
   - If invested at {plan.savings_interest_rate*100:.1f}% annual return, you could earn ${calculate_investment_returns(potential_investment, plan.max_timeline_months, plan.savings_interest_rate):.2f}
   
3. How to Execute:
   - Set up automatic minimum monthly payments of ${min_monthly:.2f}
   - Open an investment account (like a high-yield savings account or index fund)
   - Automatically invest the remaining ${potential_investment:.2f} monthly
   
This approach is recommended if you're comfortable with basic investing and want to potentially offset interest costs through investment returns."""
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
        recommended=False,
        explanation=f"""This strategy focuses on rapid debt elimination:

1. Monthly Payment: ${aggressive_monthly:.2f}
   - Make maximum possible payments
   - Pay off debt in {int(months_needed)} months instead of {plan.max_timeline_months}

2. Benefits:
   - Save ${plan.total_amount * (plan.debt_interest_rate * plan.max_timeline_months / 12) - (plan.total_amount * (plan.debt_interest_rate * months_needed / 12)):.2f} in interest
   - Become debt-free {plan.max_timeline_months - int(months_needed)} months sooner
   
3. How to Execute:
   - Set up automatic monthly payments of ${aggressive_monthly:.2f}
   - Cut discretionary spending to maintain higher payments
   - Consider a side hustle for extra income
   
This approach is best if you prioritize becoming debt-free quickly and don't want to take investment risks."""
    )
    strategies.append(aggressive_strategy)
    
    return strategies 