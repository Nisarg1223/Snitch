import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const Protected = ({ children,role="buyer" }) => {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#eaeded',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#0f1111',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>📦</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Verifying your session...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
 if(user.role !== role){
    return <Navigate to="/"/>
 }
  return children;
};

export default Protected;