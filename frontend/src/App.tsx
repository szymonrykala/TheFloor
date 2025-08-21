import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/http'
import { BrowserRouter } from 'react-router'

import { Routes, Route } from "react-router";
import { PlayerGameView } from "./pages/Player";
import { MainLayout } from "./layouts/main";
import { HomeView } from "./pages/Home";
import SuflerView from './pages/Sufler';
import { BoardView } from './pages/Board';
import { AppContextProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';


function Routing() {
  return (
    <Routes>
      <Route element={< MainLayout />}>
        < Route index path="/" element={< HomeView />} />

        < Route path="/games/:gameId" element={< PlayerGameView />} />
        < Route path="/games/:gameId/sufler" element={< SuflerView />} />
        < Route path="/games/:gameId/board" element={< BoardView />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter basename='/app'>
      <QueryClientProvider
        client={queryClient}
      >
        <AppContextProvider>
          <Toaster
            position="top-center"
            reverseOrder={true}
            toastOptions={{
              error: {
                className: 'notification-error'
              },
              success: {
                className: 'notification-success'
              }
            }}
          />
          <Routing />
        </AppContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App
