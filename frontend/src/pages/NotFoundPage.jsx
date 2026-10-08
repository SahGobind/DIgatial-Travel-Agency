import React from 'react';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import Container from '../components/common/Container';
import Button from '../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16">
      <Container size="narrow" className="text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 text-[#0B2A6F] flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        <h1 className="text-6xl font-extrabold text-[#0B2A6F]">404</h1>
        <h2 className="text-2xl font-bold text-[#172033]">
          Destination Not Found
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          The page or travel route you are looking for doesn't exist or has been relocated.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Button to="/" variant="primary" size="md" icon={Home}>
            Back to Home
          </Button>
          <Button to="/services" variant="outline" size="md">
            View Services
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default NotFoundPage;
