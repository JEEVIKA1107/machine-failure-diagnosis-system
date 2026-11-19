from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ExpertRuleModel
from app.schemas import RuleResponse, RuleUpdate
from app.knowledge_engine import DEFAULT_THRESHOLDS, knowledge_engine

router = APIRouter(prefix="/api/rules", tags=["Knowledge Base & Rules"])


@router.get("", response_model=List[RuleResponse])
def get_all_rules(db: Session = Depends(get_db)):
    """Fetch all active expert production rules stored in the knowledge base."""
    rules = db.query(ExpertRuleModel).order_by(ExpertRuleModel.priority.desc()).all()
    if not rules:
        # Fallback to engine defaults if database is not yet populated
        fallback = []
        for r in knowledge_engine.rules:
            fallback.append(
                RuleResponse(
                    id=r.rule_id,
                    rule_name=r.rule_name,
                    conditions=r.condition_description,
                    conclusion=r.conclusion,
                    recommendation=r.recommendation,
                    severity=r.severity,
                    priority=r.priority,
                    is_active=True,
                )
            )
        return fallback
    return rules


@router.get("/thresholds", response_model=Dict[str, float])
def get_thresholds():
    """Retrieve active sensor threshold configuration."""
    return knowledge_engine.thresholds


@router.post("/thresholds", response_model=Dict[str, float])
def update_thresholds(thresholds: Dict[str, float]):
    """Update active sensor thresholds in memory."""
    for k, v in thresholds.items():
        if k in DEFAULT_THRESHOLDS:
            knowledge_engine.thresholds[k] = float(v)
    return knowledge_engine.thresholds


@router.put("/{rule_id}", response_model=RuleResponse)
def update_rule(rule_id: str, payload: RuleUpdate, db: Session = Depends(get_db)):
    """Update rule status or parameters."""
    rule = db.query(ExpertRuleModel).filter(ExpertRuleModel.id == rule_id).first()
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rule with ID {rule_id} not found.",
        )

    if payload.rule_name is not None:
        rule.rule_name = payload.rule_name
    if payload.conditions is not None:
        rule.conditions = payload.conditions
    if payload.conclusion is not None:
        rule.conclusion = payload.conclusion
    if payload.recommendation is not None:
        rule.recommendation = payload.recommendation
    if payload.severity is not None:
        rule.severity = payload.severity
    if payload.is_active is not None:
        rule.is_active = payload.is_active

    db.commit()
    db.refresh(rule)
    return rule
