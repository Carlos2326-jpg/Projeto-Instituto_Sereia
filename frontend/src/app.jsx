import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./Controllers/AuthContext";
import AppRoutes from "./routes";
import "./Assets/Styles/global.css";
import "./Assets/Styles/ui.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
