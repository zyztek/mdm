# Referencia de API

## Dispositivos

### `GET /api/devices`
Retorna una lista de dispositivos Samsung conectados.

**Respuesta:**
```json
[
  {
    "id": "R58M...",
    "state": "device",
    "model": "SM-A525M",
    "manufacturer": "samsung"
  }
]
```

## Operaciones MDM

### `POST /api/remove-mdm`
Inicia el proceso de eliminación para un dispositivo.

**Cuerpo:**
```json
{
  "deviceId": "R58M...",
  "packages": ["com.payjoy.access", ...]
}
```

## Monitoreo

### `GET /api/operations`
Retorna el historial de operaciones realizadas.
