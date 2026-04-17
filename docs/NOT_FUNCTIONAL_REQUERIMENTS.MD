# Requerimientos no funcionales

### Dependencies

| Dependencias           |                     Rol/Descripción                      | Estado |
| ---------------------- | :------------------------------------------------------: | :----: |
| tankstack router       |                       Enrutamiento                       |   ✅   |
| @mantine/core          | Core components library: inputs, buttons, overlays, etc. |   ✅   |
| @mantine/hooks         |            Hooks for state and UI management             |   ✅   |
| @mantine/dates y dayjs |      Date inputs, calendars, para manejo de fechas       |   ✅   |
| react-helmet-async     |                        meta datos                        |   ✅   |
| @mantine/form con zod  |                     para formularios                     |   ✅   |
| @mantine/notifications |                   para notificaciones                    |   ❌   |
| tankstack Query        |                          Cacheo                          |   ✅   |
| tankstack Table        |                   Tablas mas dinámicas                   |   ✅   |
| Axios                  |                para peticiones http fetch                |   ✅   |
| Zustand                |                 para gestion de estados                  |   ✅   |
| react-google-recaptcha |               validar que no sea un robot                |   ✅   |

### Lint

| devDependencias |                 Rol/Descripción                  | Estado |
| --------------- | :----------------------------------------------: | :----: |
| husky           | ejecutar scripts automáticos en los hooks de Git |   ✅   |
| lint-staged     |   "staged" (preparados para el commit) en Git.   |   ✅   |
| @biomejs/biome  |            herramienta para formatear            |   ✅   |

### Test

| devDependencies             |                              Rol/Descripción                               | Estado |
| --------------------------- | :------------------------------------------------------------------------: | :----: |
| vitest                      |               Test runner, reemplaza Jest, nativo para Vite                |   ✅   |
| happy-dom                   | Simula el browser (DOM) sin levantar un browser real, más rápido que jsdom |   ✅   |
| @testing-library/react      |                  Renderiza componentes React en los tests                  |   ✅   |
| @testing-library/user-event |       Simula interacciones reales del usuario (click, tipear, etc.)        |   ✅   |
| @testing-library/jest-dom   |     Matchers extra para el DOM (toBeInTheDocument, toBeVisible, etc.)      |   ✅   |
| @vitest/coverage-v8         |                       Reporte de cobertura de código                       |   ✅   |
| @vitest/ui                  |              Interfaz visual para ver los tests en el browser              |   ✅   |

### Utils

| otros |                               para                               | testunitario |
| ----- | :--------------------------------------------------------------: | :----------: |
| utils | formato de fechas con dayjs 'DD/MM/YYYY HH:mm' parceo de utc etc |      ✅      |

### DevOps

| otros  |                   para                   | Estado |
| ------ | :--------------------------------------: | :----: |
| nginx  | configurar servidor de archivos staticos |   ✅   |
| Docker | configuracion del container del proyecto |   ✅   |

### Convenciones

| otros        |              para              | Estado |
| ------------ | :----------------------------: | :----: |
| Programacion |           Funcional            |   ✅   |
| PR           | new branch por cada feat o fix |   ✅   |

> estando en dev
> git checkpout jira-110
> git add .
> commit "feat: JIRA-110/add buton compoennt"
>
> PR:
> #hash commit #[JIRA-110](https:///jira)
