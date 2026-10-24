# Backend — API de tickets biomédicos

FastAPI sobre AWS Lambda + API Gateway, datos en DynamoDB (single-table design).

## Desarrollo local

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # en Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install "uvicorn[standard]"

# Opcional: DynamoDB Local
# docker run -p 8000:8000 amazon/dynamodb-local
export TABLE_NAME=biomed-tickets
export DYNAMODB_ENDPOINT=http://localhost:8000   # solo si usas DynamoDB Local

uvicorn app.main:app --reload --port 8000
```

Docs interactivas en `http://localhost:8000/docs`.

## Despliegue a AWS (capa gratuita)

Requiere [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html).

```bash
cd backend
sam build
sam deploy --guided        # la primera vez
```

Al terminar, copia el output `ApiUrl`: es la URL que va en `VITE_API_URL` del frontend.

### Recursos creados (todos en capa gratuita)
- **DynamoDB** `biomed-tickets` (PAY_PER_REQUEST, 25 GB gratis).
- **Lambda** `biomed-tickets-api` (1M requests/mes gratis).
- **API Gateway HTTP API** (1M requests/mes gratis el primer año).
