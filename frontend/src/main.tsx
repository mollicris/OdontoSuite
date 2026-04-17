import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import './index.css'
import { Providers } from './core/providers/providers.tsx'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Providers />
  </StrictMode>,
)
