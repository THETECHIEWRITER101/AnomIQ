from typing import Optional, Any
from uuid import UUID
from fastapi import Header, Query, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models

def get_current_facility(
    facility_id: Optional[str] = Query(None, alias="facility_id"),
    x_facility_id: Optional[str] = Header(None, alias="X-Facility-Id")
) -> Optional[str]:
    """
    FastAPI dependency that extracts the active facility ID from query params or HTTP headers.
    Returns None if not supplied, permitting flexible optional facility filtering.
    """
    fac = facility_id or x_facility_id
    if fac is not None:
        fac = str(fac).strip()
        if fac.lower() in ("null", "undefined", "none", "0", ""):
            return None
    return fac
