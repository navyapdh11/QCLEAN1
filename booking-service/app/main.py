import os
import jwt
import base64
import time
import uuid
import structlog
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import stripe
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from prometheus_fastapi_instrumentator import Instrumentator

# --- Initialization ---
log = structlog.get_logger()
app = FastAPI(title="PrimeClean Booking Service", version="1.0.0")

# --- Observability ---
FastAPIInstrumentor.instrument_app(app)  # Traces to Tempo
Instrumentator().instrument(app).expose(app, endpoint="/metrics")  # Metrics to Prometheus

# --- CORS (Strict for Vercel Frontend) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGIN", "https://primeclean.com.au")],
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

# --- Stripe ---
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# --- Xero Configuration (Australian Instance) ---
XERO_CLIENT_ID = os.getenv("XERO_CLIENT_ID")
XERO_CLIENT_SECRET = os.getenv("XERO_CLIENT_SECRET")
XERO_TENANT_ID = os.getenv("XERO_TENANT_ID")


def get_xero_token():
    """Generates Xero JWT and gets OAuth2 token for Australian Tenant."""
    jwt_payload = {
        "iss": XERO_CLIENT_ID,
        "sub": XERO_CLIENT_ID,
        "aud": "https://identity.xero.com/connect/token",
        "exp": int(time.time()) + 300,
        "iat": int(time.time()),
        "jti": str(uuid.uuid4()),
    }
    decoded_secret = base64.b64decode(XERO_CLIENT_SECRET)
    token = jwt.encode(jwt_payload, decoded_secret, algorithm="RS256")
    # In production, exchange JWT for OAuth2 token and cache until expiry
    access_token = token  # Placeholder - implement OAuth2 exchange in prod
    return access_token


# --- Models ---
class BookingRequest(BaseModel):
    service: str
    state: str
    postcode: str
    amount: int  # in cents (AUD)
    slot_time: str
    customer_email: str
    customer_name: str


class AvailabilityRequest(BaseModel):
    service: str
    postcode: str


# --- Endpoints ---
@app.post("/api/book")
async def create_booking(request: BookingRequest, req: Request):
    trace_id = req.headers.get("traceparent", "unknown")

    try:
        # 1. Create Stripe Checkout Session
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "aud",
                        "product_data": {
                            "name": f"{request.service} - {request.postcode}"
                        },
                        "unit_amount": request.amount,  # e.g., 89900 = $899.00
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=f"{os.getenv('NEXT_PUBLIC_URL')}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{os.getenv('NEXT_PUBLIC_URL')}/cancel",
            metadata={
                "booking_slot": request.slot_time,
                "state": request.state,
                "postcode": request.postcode,
            },
        )

        # 2. Create Xero Draft Invoice (ACCREC)
        xero_token = get_xero_token()
        # In production, use xero_python.accounting.Api to create invoice
        # invoice_data = {
        #     "Type": "ACCREC",
        #     "Contact": {"Name": request.customer_name, "EmailAddress": request.customer_email},
        #     "Date": datetime.now().strftime("%Y-%m-%d"),
        #     "DueDate": datetime.now().strftime("%Y-%m-%d"),
        #     "LineItems": [{
        #         "Description": request.service,
        #         "Quantity": 1.0,
        #         "UnitAmount": request.amount / 100,
        #         "TaxType": "GST on Income",  # Australian GST
        #         "AccountCode": "200"  # Sales Revenue
        #     }],
        #     "Status": "DRAFT"
        # }
        # xero_api.create_invoices(xero_tenant_id, invoices=invoice_data)

        log.info(
            "booking_initiated",
            trace_id=trace_id,
            service=request.service,
            postcode=request.postcode,
            amount=request.amount,
        )

        return {"checkout_url": session.url, "session_id": session.id}

    except stripe.error.StripeError as e:
        log.error("stripe_error", trace_id=trace_id, error=str(e))
        raise HTTPException(status_code=400, detail="Payment processing error")
    except Exception as e:
        log.error("booking_error", trace_id=trace_id, error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/booking/availability")
async def check_availability(service: str, postcode: str):
    """Check real-time availability for a service and postcode."""
    # Mock availability data - replace with actual capacity service
    import random

    dates = ["2026-04-20", "2026-04-21", "2026-04-22", "2026-04-23", "2026-04-24"]
    times = ["08:00", "10:00", "12:00", "14:00", "16:00"]

    slots = []
    for date in dates:
        for time_slot in times:
            slots.append(
                {
                    "date": date,
                    "time": time_slot,
                    "available": random.choice([True, True, True, False]),  # 75% available
                }
            )

    return {"slots": slots, "service": service, "postcode": postcode}


@app.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0.0", "timestamp": datetime.utcnow().isoformat()}
