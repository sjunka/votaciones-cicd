# Pruebas contra un ambiente desplegado

Las tres carpetas leen la URL de `APP_BASE_URL` (obligatoria). Sirven contra staging, producción o el stack local (`docker compose up`, `http://localhost:8080`).

```bash
cd tests
uv venv --python 3.13 && source .venv/bin/activate
uv pip install -r requirements.txt

export APP_BASE_URL=http://localhost:8080
pytest integration            # API con DynamoDB real
pytest e2e                    # Selenium headless, necesita Chrome
EXPECTED_VERSION=1.0.7 pytest smoke   # solo lectura; EXPECTED_VERSION es opcional
```

La integración y el E2E crean encuestas nuevas: no las uses en producción. El E2E pasa `--disable-features=HttpsFirstBalancedModeAutoEnable` porque Chrome 157 deja en blanco los sitios solo HTTP.
