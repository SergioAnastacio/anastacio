
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ApperrorPage />;
    }

    return this.props.children;
  }
}

const Apploading = lazy(() => import('./app/loading'));
const Appnotfound = lazy(() => import('./app/notfound'));
const ApperrorPage = () => null;
const RoutePageAppAdminUsersPage = lazy(() => import('./app/admin/users/page'));
const RoutePageAppCustomersIdPage = lazy(() => import('./app/customers/[id]/page'));
const RoutePageAppPage = lazy(() => import('./app/page'));
const RouteLayoutAppLayout = lazy(() => import('./app/layout'));

const AppRouter = () => (
  <Router>
    <ErrorBoundary>
      <Suspense fallback={<Apploading />}>
        <Routes>

      <Route element={<RouteLayoutAppLayout />}>
        <Route path="/" element={<RoutePageAppPage />} />
        <Route path="/admin/users" element={<RoutePageAppAdminUsersPage />} />
        <Route path="/customers/:id" element={<RoutePageAppCustomersIdPage />} />
      </Route>
          <Route path="*" element={<Appnotfound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  </Router>
);

export default AppRouter;
