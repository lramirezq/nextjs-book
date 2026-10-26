# Mis Tareas — Proyecto del libro *Next.js de Cero a Producción*

Aplicación de ejemplo que se construye paso a paso a lo largo del libro
**Next.js de Cero a Producción** (Kimün Academy). Es una lista de tareas con
cuentas de usuario que reúne, en un proyecto pequeño y real, todo lo que enseña
el libro: componentes de servidor y cliente, el patrón **BFF**, sesión con
cookies seguras, formularios con Server Actions y validación con Zod.

> 📘 Este repositorio es el **código de acompañamiento**. El libro explica el
> *porqué* de cada decisión; aquí tienes el *cómo*, listo para ejecutar.

---

## Qué aprenderás viendo este código

- **Server Components vs Client Components**: la mayor parte de la app corre en
  el servidor; solo el formulario de login es interactivo en el navegador.
- **El patrón BFF (Backend for Frontend)**: la interfaz nunca toca los datos
  directamente. Todo pasa por las Server Actions, que orquestan, validan y
  protegen.
- **Autenticación real**: contraseñas hasheadas (scrypt), sesión en una cookie
  **HttpOnly** firmada, y rutas privadas protegidas por partida doble
  (middleware + validación en el servidor).
- **Validación en el borde** con Zod en cada Server Action.
- **Aislamiento por usuario**: cada persona ve y modifica solo sus tareas.

---

## Cómo ejecutarlo

Necesitas **Node.js 18.18 o superior**. No hace falta ninguna base de datos:
los datos se guardan en un archivo `data.json` que se crea solo.

```bash
# 1. Clona el repositorio
git clone https://github.com/lramirezq/nextjs-book.git
cd nextjs-book

# 2. Instala las dependencias
npm install

# 3. Arranca el servidor de desarrollo
npm run dev
```

Abre <http://localhost:3000> y crea una cuenta. ¡Listo!

### Comandos disponibles

| Comando         | Qué hace                                      |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Servidor de desarrollo con recarga automática |
| `npm run build` | Compila y optimiza para producción            |
| `npm run start` | Sirve el build de producción                  |
| `npm run lint`  | Revisa el código con ESLint                   |

---

## Verlo en vivo (desplegar en Vercel)

Puedes desplegar tu propia copia en segundos. Vercel es gratuito para proyectos
personales:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lramirezq/nextjs-book)

> Tras desplegar, define la variable de entorno `SESSION_SECRET` con un valor
> propio (genera uno con `openssl rand -hex 32`).

---

## Mapa del proyecto

```
src/
├── app/
│   ├── page.tsx              # Portada (Server Component)
│   ├── layout.tsx            # Layout raíz
│   ├── globals.css           # Estilos (Tailwind)
│   ├── login/page.tsx        # Página de inicio de sesión
│   ├── register/page.tsx     # Página de registro
│   ├── tasks/page.tsx        # Lista de tareas (ruta protegida)
│   ├── auth-actions.ts       # Server Actions: register, login, logout
│   ├── task-actions.ts       # Server Actions: el BFF de las tareas
│   └── _components/
│       ├── auth-form.tsx     # Formulario (Client Component)
│       └── task-list.tsx     # Lista de tareas (Server Component)
├── lib/
│   ├── db.ts                 # Capa de datos (solo servidor)
│   └── auth.ts               # Contraseñas y sesión (solo servidor)
└── middleware.ts             # Guardia de rutas privadas
```

## De qué capítulo viene cada pieza

| Archivo                        | Capítulo del libro                         |
| ------------------------------ | ------------------------------------------ |
| `app/page.tsx`                 | 1 — Server Components                       |
| `app/_components/auth-form.tsx`| 7 — Formularios, `useActionState`          |
| `app/tasks/page.tsx`           | 2 y 12 — Routing y proyecto final          |
| `app/auth-actions.ts`          | 5 y 7 — Server Actions y sesión            |
| `app/task-actions.ts`          | 4, 5 y 12 — El patrón BFF                  |
| `lib/db.ts`                    | 12 — Capa de datos aislada                 |
| `lib/auth.ts`                  | 5 — Cookies HttpOnly, contraseñas          |
| `middleware.ts`                | 5 — Proteger rutas                         |
| `next.config.ts`               | 10 — Cabeceras de seguridad                |

---

## Nota didáctica

Para que el proyecto funcione sin instalar nada extra, los datos se guardan en un
archivo JSON. En una aplicación de producción usarías una base de datos real
(PostgreSQL, por ejemplo); lo bueno del patrón BFF es que **solo cambiaría el
interior de `lib/db.ts`** — el resto de la app no se entera. Esa es, justamente,
la ventaja de aislar la capa de datos.

## Licencia

MIT — eres libre de usar este código para aprender, enseñar o construir sobre él.
Ver [LICENSE](./LICENSE).
