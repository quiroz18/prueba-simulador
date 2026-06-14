# Simulador de examen

Proyecto estático listo para GitHub + Netlify.

## Archivos importantes
- `index.html`: interfaz del simulador.
- `style.css`: diseño responsive con modo oscuro.
- `script.js`: temporizador, navegación, respuestas y resultados.
- `questions.js`: banco de preguntas conectado al simulador.
- `preguntas_ocr.json`: preguntas extraídas por OCR en formato JSON.
- `ocr_paginas_raw.txt`: OCR bruto por página para revisión.

## Cómo probar
Abre `index.html` en el navegador.

## Cómo publicar en Netlify
1. Sube esta carpeta a GitHub.
2. En Netlify: New site from Git.
3. Publish directory: `/`.

## Nota
El PDF recibido está compuesto por capturas. Se hizo OCR y se conectó al simulador. Algunas preguntas/opciones necesitan revisión manual porque varias capturas cortan las opciones o se repiten. Las preguntas 36, 37 y 38 no aparecieron claramente en el OCR del PDF recibido, por eso quedaron marcadas como pendientes.
