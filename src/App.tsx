import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/Home'
import { BuilderPage } from '@/pages/Builder'
import { RostersPage } from '@/pages/Rosters'
import { TrackerPage } from '@/pages/Tracker'
import { NotFoundPage } from '@/pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="builder" element={<BuilderPage />} />
          <Route path="rosters" element={<RostersPage />} />
          <Route path="tracker" element={<TrackerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
