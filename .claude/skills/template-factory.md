# Skill: TemplateFactory (Moments)

Guía técnica para la generación de nuevas plantillas premium para el ecosistema de Moments.

## 1. Disparadores (Triggers)
Activar esta skill cuando el usuario pida:
- "Crea una nueva plantilla para [Evento]"
- "Genera un diseño nivel [Tier]"
- "Crea una variante de [Plantilla]"
- "Adapta el diseño de [Referencia] al proyecto"

## 2. Estructura y Estándares Técnicos
- **Base Estructural**: No crear layouts desde cero. Usar siempre el componente del tier correspondiente en `src/components/templates/`.
  - **Deluxe**: Copiar `DeluxeTemplate.tsx`. Incluye loader, música, cuenta regresiva, itinerario avanzado, rsvp modal y logística.
  - **Plus**: Copiar `PlusTemplate.tsx`. Incluye cuenta regresiva, itinerario y rsvp básico.
  - **Essential**: Copiar `EssentialTemplate.tsx`. Diseño estático simplificado.
- **Micro-animaciones**: Implementar revelado de secciones mediante `IntersectionObserver` y las clases `reveal`, `slide-up`, `slide-left/right` ya definidas en el CSS interno de los templates deluxe.

## 3. Flujo de Implementación (Receta)
1. **Identificar el Tier**: Asegurarse de qué funcionalidades se requieren según el plan contratado.
2. **Crear Componente**: Crear nueva carpeta en `src/components/templates/[slug]/` y colocar allí el `[Name]Template.tsx`.
3. **Personalizar Visual**: 
   - Modificar las variables CSS en el bloque `:root` del `<style>` tag del componente.
   - Seleccionar tipografías premium (Google Fonts: Cormorant Garamond, Jost, etc.).
   - Actualizar assets/imágenes en el objeto `EVENT` (mock data).
4. **Registro Central**: Añadir la entrada correspondiente en `TEMPLATES` dentro de `src/lib/templates.ts`.
5. **Página de Preview**: Generar `src/app/plantillas/[slug]/page.tsx` para visualización inmediata.

## 4. Restricciones (Guardrails)
- **NO** modificar `globals.css` para estilos específicos de una plantilla; usar siempre el bloque `<style>` interno o Tailwind local.
- **NO** romper la lógica del RSVP; mantener la paridad con el sistema de tokens de Supabase definido en las migraciones.
- **NO** usar placeholders externos si se pueden generar assets coherentes o usar Unsplash de alta calidad.
