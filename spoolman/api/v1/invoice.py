"""Invoice parsing API for FilaFlow."""

import re
import io
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File
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
    Handles multi-line PDF extraction where data is split across lines.
    """
    filaments = []
    
    # Normalize text - join lines and handle various whitespace
    normalized = ' '.join(text.split())
    
    # Pattern for filament SKUs (only filaments have -SPL suffix)
    # Format in PDF: "PLA Basic SKU: A00-K0-1.75-1000-SPL ... €10.26 Variant: Black (10101)"
    # Note: In PDF extraction, order might be: Material, SKU, prices, then Variant
    
    # First, find all filament SKUs (those ending in -SPL or -SPLFREE)
    # Note: Some SKUs have line breaks in them like "A01-Y2-1.75-1000- SPLFREE" (space before SPLFREE)
    sku_pattern = r'(PLA|PETG|ABS|ASA|TPU|PA|PC|PVA|PAHT|PCTG)\s+(\w+\+?)?\s*SKU:\s*([A-Z0-9\.\-]+(?:-\s*SPL(?:FREE)?))'
    
    for sku_match in re.finditer(sku_pattern, normalized, re.IGNORECASE):
        material_type = sku_match.group(1).upper()
        material_variant = (sku_match.group(2) or "").strip()
        sku = sku_match.group(3)
        
        # Get text segment after this SKU until the NEXT SKU (any SKU, not just filament)
        start_pos = sku_match.end()
        rest_of_text = normalized[start_pos:]
        
        # Find where the next product starts (next "SKU:" marker)
        next_sku = re.search(r'\s+SKU:', rest_of_text)
        if next_sku:
            segment = rest_of_text[:next_sku.start()]
        else:
            segment = rest_of_text[:300]
        
        # Find Variant info within this segment
        # Color can be multi-word in Spanish/English: "Black", "Rojo caramelo", "Amarillo limón"
        variant_match = re.search(r'Variant:\s*([A-Za-zÀ-ÿ\s]+?)\s*\((\d+)\)', segment)
        if not variant_match:
            continue
            
        color = variant_match.group(1).strip()
        variant_code = variant_match.group(2)
        
        # Find all euro prices in this segment ONLY
        # Format: "1 €21.84 €11.58 PT VAT(0%) €0.00 €10.26 Variant: ..."
        # The prices are: original €21.84, discount €11.58, tax €0.00, final €10.26
        prices = re.findall(r'€(\d+\.?\d*)', segment)
        
        if not prices:
            continue
            
        # Filter out €0.00 (tax amounts)
        non_zero_prices = [float(p) for p in prices if float(p) > 0]
        
        if not non_zero_prices:
            continue
        
        # For Bambu invoices, the price sequence is: original, discount, tax (0), final
        # The final price is the LAST non-zero price in the segment
        # Since we limited the segment properly, just take the last one
        final_price = non_zero_prices[-1]
        
        # Normalize SKU (remove spaces from PDF extraction issues)
        sku = re.sub(r'\s+', '', sku)
        
        # Remove -SPL or -SPLFREE suffix to get article_number
        article_number = re.sub(r'-SPL(FREE)?$', '', sku)
        
        # Extract weight from SKU (e.g., 1000 in A00-K0-1.75-1000-SPL)
        weight_match = re.search(r'-(\d{3,4})-', sku)
        weight = int(weight_match.group(1)) if weight_match else 1000
        
        # Build material name
        material_name = material_type
        if material_variant:
            material_name = f"{material_type} {material_variant}".upper()
        
        filaments.append({
            'sku': sku,
            'article_number': article_number,
            'material': material_name,
            'color': color,
            'variant_code': variant_code,
            'price': final_price,
            'weight': weight
        })
    
    return filaments


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from a PDF file."""
    try:
        import pdfplumber
    except ImportError:
        raise HTTPException(status_code=500, detail="PDF support not available (pdfplumber not installed)")
    
    text_parts = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    
    return "\n".join(text_parts)


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


class DebugParseResponse(BaseModel):
    """Response with debug info."""
    success: bool
    filaments: list[ParsedFilament]
    message: str
    extracted_text: Optional[str] = None


@router.post("/parse-pdf", response_model=InvoiceParseResponse)
async def parse_invoice_pdf(file: UploadFile = File(...)):
    """
    Parse a PDF invoice and extract filament information.
    
    Upload a PDF invoice from Bambu Lab and the system will:
    1. Extract text from the PDF
    2. Parse filament SKUs and prices
    
    Returns a list of filaments with SKU, article_number, and price.
    """
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Por favor sube un archivo PDF")
    
    # Read PDF content
    content = await file.read()
    if len(content) < 100:
        raise HTTPException(status_code=400, detail="El archivo PDF es muy pequeño")
    
    if len(content) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="El archivo PDF es muy grande (máx 10MB)")
    
    # Extract text from PDF
    try:
        text = extract_text_from_pdf(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al leer PDF: {str(e)}")
    
    if not text or len(text) < 10:
        raise HTTPException(status_code=400, detail="No se pudo extraer texto del PDF")
    
    # Parse the extracted text
    filaments = parse_bambu_invoice(text)
    
    if not filaments:
        return InvoiceParseResponse(
            success=False,
            filaments=[],
            message="No se encontraron filamentos. Asegúrate de que es una factura de Bambu Lab con filamentos."
        )
    
    parsed = [ParsedFilament(**f) for f in filaments]
    
    return InvoiceParseResponse(
        success=True,
        filaments=parsed,
        message=f"Encontrado(s) {len(parsed)} filamento(s)"
    )


@router.post("/parse-pdf-debug")
async def parse_invoice_pdf_debug(file: UploadFile = File(...)):
    """Debug endpoint that returns extracted text."""
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Por favor sube un archivo PDF")
    
    content = await file.read()
    text = extract_text_from_pdf(content)
    filaments = parse_bambu_invoice(text)
    parsed = [ParsedFilament(**f) for f in filaments]
    
    return {
        "success": len(filaments) > 0,
        "filaments": parsed,
        "message": f"Encontrado(s) {len(parsed)} filamento(s)" if filaments else "No se encontraron filamentos",
        "extracted_text": text[:3000] if text else None  # First 3000 chars for debug
    }


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
        "instructions": "Upload invoice PDF or paste invoice text. The system will extract filament SKUs and prices automatically."
    }
