import os
import structlog
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from prometheus_fastapi_instrumentator import Instrumentator

# --- Initialization ---
log = structlog.get_logger()
app = FastAPI(title="PrimeClean RAG Service", version="1.0.0")

# --- Observability ---
FastAPIInstrumentor.instrument_app(app)
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGIN", "https://primeclean.com.au")],
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

# --- OpenAI Configuration ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SYSTEM_PROMPT = """You are PrimeClean AI, an expert assistant for Australian cleaning services. 
Help customers with pricing, compliance requirements, and service availability across NSW, VIC, and QLD.
Always provide accurate information about Australian cleaning standards and regulations."""


# --- Models ---
class ChatRequest(BaseModel):
    messages: list[dict]
    stream: bool = False


class ComplianceRequest(BaseModel):
    service_type: str
    state: str
    facility_type: str


# --- Endpoints ---
@app.post("/api/rag/chat")
async def chat(request: ChatRequest, req: Request):
    trace_id = req.headers.get("traceparent", "unknown")

    try:
        # In production: integrate with OpenAI API + Pinecone for RAG retrieval
        # For now, return a structured response
        log.info(
            "rag_chat_initiated",
            trace_id=trace_id,
            message_count=len(request.messages),
        )

        return {
            "id": "chatcmpl-rag-001",
            "object": "chat.completion",
            "created": int(datetime.utcnow().timestamp()),
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": "I can help you with cleaning services across Australia. What location and service type are you interested in?",
                    },
                    "finish_reason": "stop",
                }
            ],
        }

    except Exception as e:
        log.error("rag_chat_error", trace_id=trace_id, error=str(e))
        raise HTTPException(status_code=500, detail="RAG service error")


@app.post("/api/rag/compliance")
async def check_compliance(request: ComplianceRequest):
    """Check compliance requirements for a specific service."""
    # Mock compliance data for Australian cleaning standards
    compliance_data = {
        "medical": {
            "NSW": {
                "standards": ["AS/NZS 4146:2000", "NHMRC Guidelines"],
                "requirements": ["Hospital-grade disinfectants", "Color-coded equipment", "Trained staff"],
            },
            "VIC": {
                "standards": ["VIC Health Guidelines", "WorkSafe Victoria"],
                "requirements": ["Infection control protocols", "Safety data sheets"],
            },
        },
        "office": {
            "NSW": {
                "standards": ["Cleaning Code of Practice NSW"],
                "requirements": ["Green cleaning products", "After-hours service"],
            },
        },
    }

    service = request.service_type.lower()
    state = request.state.upper()

    result = compliance_data.get(service, {}).get(state, {})

    if not result:
        return {
            "service": service,
            "state": state,
            "compliance": "No specific requirements found",
            "standards": [],
            "requirements": [],
        }

    return {
        "service": service,
        "state": state,
        "compliance": "Requirements found",
        "standards": result.get("standards", []),
        "requirements": result.get("requirements", []),
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0.0", "timestamp": datetime.utcnow().isoformat()}
