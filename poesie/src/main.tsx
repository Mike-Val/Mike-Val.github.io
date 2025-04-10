import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.tsx'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import './fonts.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MantineProvider 
            defaultColorScheme='dark'
            theme={{
                fontFamily: 'kingthings_typewriter'
            }}
        >
            <App />
        </MantineProvider>
    </React.StrictMode>,
)
