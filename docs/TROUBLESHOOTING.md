# Solución de Problemas

## ADB no detecta el dispositivo
- Verifica que el cable USB sea de buena calidad (datos).
- Asegúrate de que las "Opciones de desarrollador" y "Depuración USB" estén activas.
- Acepta el prompt de "Permitir depuración USB" en la pantalla del celular.

## Error "Permiso Denegado"
- Algunos dispositivos requieren desactivar primero el "Bloqueo de OEM" si está disponible.
- Asegúrate de que el paquete MDM no tenga protección de nivel de sistema superior.

## El servidor Backend no inicia
- Verifica que el puerto 3001 esté libre.
- Ejecuta `npm install` en la carpeta `backend/`.
- Asegúrate de haber ejecutado `node scripts/init-db.js`.
