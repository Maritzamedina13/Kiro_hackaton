"""Configuración central del backend del sistema de tickets biomédicos."""
import os
from zoneinfo import ZoneInfo

# Nombre de la tabla única de DynamoDB (single-table design).
TABLE_NAME = os.environ.get("TABLE_NAME", "biomed-tickets")

# Región de AWS donde vive la tabla.
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

# Endpoint local de DynamoDB (solo para desarrollo con DynamoDB Local).
# Si está vacío, boto3 usa el servicio real de AWS.
DYNAMODB_ENDPOINT = os.environ.get("DYNAMODB_ENDPOINT", "") or None

# Zona horaria del proyecto: toda fecha se guarda en ISO 8601 con este offset.
TIMEZONE = ZoneInfo("America/Bogota")

# Orígenes permitidos para CORS (el sitio estático de GitHub Pages).
# Separados por coma en la variable de entorno.
_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
CORS_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", _default_origins).split(",")
    if origin.strip()
]
