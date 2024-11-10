from fastapi import APIRouter, HTTPException
from ..models import RepaymentPlan
from ..services.repayment_optimizer import optimize_repayment

router = APIRouter()

@router.post("/repayment/optimize")
async def optimize_payment_plan(plan: RepaymentPlan):
    try:
        strategies = optimize_repayment(plan)
        return {"strategies": strategies}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 