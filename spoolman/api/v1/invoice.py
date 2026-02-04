"""Invoice parsing API for FilaFlow."""

import re
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/invoice",
    tags=["invoice"],
)


class InvoiceParseRequest(BaseModel):
    """Request body for invoice parsing."""
    text: str


class ParsedFilament(BaseModel):
    """A filament extracted from an invoice."""
    sku: str
    article_number: str
    material: str
    color: str
    variant_code: str
    price: float
    weight: int


class InvoiceParseResponse(BaseModel):
    """Response from invoice parsing."""
    success: bool
    filaments: list[ParsedFilament]
    message: str


def parse_bambu_invoice(text: str) -> list[dict]:
    """
    Parse a Bambu Lab invoice and extract filaments with prices.
    
    Supports invoice formats from store.bambulab.com
    """
    filaments = []
    
    # Regex for Bambu Lab invoice format
    # Example: "PLA Basic SKU: A00-K0-1.75-1000-SPL Variant: Black (10101) ... €10.26"
    pattern = r'(PLA|PETG|ABS|ASA|TPU|PA|PC|PVA|PAHT|PCTG)\s*(\w*)\s*SKU:\s*([A-Z0-9\.\-]+)\s*Variant:\s*(\w+)\s*\((\d+)\).*?[€$]([\d.]+)\s*$'
    
    for line in text.split('\n'):
        match = re.search(pattern, line, re.IGNORECASE)
        if match:
            material_type, material_variant, sku, color, variant_code, price = match.groups()
            
            # Remove -SPL suffix to get article_number
            article_number = sku.replace('-SPL', '')
            
            # Extract weight from SKU (e.g., 1000 in A00-K0-1.75-1000-SPL)
            weight_match = re.search(r'-(\d{3,4})-', sku)
            weight = int(weight_match.group(1)) if weight_match else 1000
            
            filaments.append({
                'sku': sku,
                'article_number': article_number,
                'material': f"{material_type} {material_variant}".strip().upper(),
                'color': color,
                'variant_code': variant_code,
                'price': float(price),
                'weight': weight
            })
    
    return filaments


@router.post("/parse", response_model=InvoiceParseResponse)
async def parse_invoice(request: InvoiceParseRequest):
    """
    Parse invoice text and extract filament information.
    
    Currently supports:
    - Bambu Lab invoices (store.bambulab.com)
    
    Returns a list of filaments with SKU, article_number, and price.
    The article_number can be matched with filaments in the database.
    """
    if not request.text or len(request.text) < 10:
        raise HTTPException(status_code=400, detail="Invoice text is too short")
    
    filaments = parse_bambu_invoice(request.text)
    
    if not filaments:
        return InvoiceParseResponse(
            success=False,
            filaments=[],
            message="No filaments found in invoice. Make sure it's a Bambu Lab invoice with filament items."
        )
    
    parsed = [ParsedFilament(**f) for f in filaments]
    
    return InvoiceParseResponse(
        success=True,
        filaments=parsed,
        message=f"Found {len(parsed)} filament(s)"
    )


@router.get("/supported")
async def get_supported_formats():
    """Get list of supported invoice formats."""
    return {
        "formats": [
            {
                "vendor": "Bambu Lab",
                "store": "store.bambulab.com",
                "notes": "Copy invoice text or upload PDF"
            }
        ],
        "instructions": "Paste the invoice text in the parser. The system will extract filament SKUs and prices automatically."
    }
