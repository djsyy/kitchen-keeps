import { Outlet } from 'react-router-dom';
import Footer from './components/layout/Footer';

export default function App() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
