import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./hooks/store";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

/**
 * App — root component.
 *
 * Provider order matters:
 *   1. Redux store  — must wrap everything (AuthContext reads from it)
 *   2. BrowserRouter — must wrap AuthProvider (which uses useNavigate)
 *   3. AuthProvider  — bootstraps session, connects socket
 */
export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}