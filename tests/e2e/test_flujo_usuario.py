# tests/e2e/test_flujo_usuario.py
"""E2E con Selenium: crear una encuesta, votar y ver el resultado."""
import os

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

BASE_URL = os.environ["APP_BASE_URL"].rstrip("/")


@pytest.fixture
def driver():
    opciones = webdriver.ChromeOptions()
    opciones.add_argument("--headless=new")
    opciones.add_argument("--no-sandbox")
    opciones.add_argument("--window-size=1280,900")
    # Chrome 157 deja en blanco los sitios solo HTTP (el ALB no tiene HTTPS)
    opciones.add_argument("--disable-features=HttpsFirstBalancedModeAutoEnable")
    d = webdriver.Chrome(options=opciones)
    yield d
    d.quit()


def esperar(driver, testid, timeout=20):
    selector = (By.CSS_SELECTOR, f"[data-testid='{testid}']")
    return WebDriverWait(driver, timeout).until(EC.visibility_of_element_located(selector))


def test_crear_votar_y_ver_resultado(driver):
    driver.get(BASE_URL + "/")
    assert esperar(driver, "env-banner").text

    esperar(driver, "new-question").send_keys("¿Cuál es tu color favorito?")
    esperar(driver, "new-option-0").send_keys("Rojo")
    esperar(driver, "new-option-1").send_keys("Azul")
    esperar(driver, "create-poll").click()

    assert "Cuál es tu color favorito" in esperar(driver, "poll-question").text
    esperar(driver, "option-0").click()

    # El voto se refleja: 100 % para la opción elegida
    WebDriverWait(driver, 20).until(
        lambda d: "100" in d.find_element(By.CSS_SELECTOR, "[data-testid='percent-0']").text
    )
    assert "1" in esperar(driver, "vote-count").text
    # Quien creó la encuesta tiene el botón de cierre
    assert esperar(driver, "close-button").is_displayed()
