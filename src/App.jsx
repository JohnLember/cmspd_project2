import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import { useTheme } from "./context/ThemeContext.jsx";
import AppRouter from "./routes/AppRouter.jsx";

function ToastHost() {
  const { theme } = useTheme();

  return (
    <ToastContainer
      position="top-center"
      autoClose={false}
      closeOnClick={false}
      pauseOnHover
      draggable={false}
      newestOnTop
      limit={3}
      theme={theme === "dark" ? "dark" : "light"}
      toastStyle={{
        background: "var(--gov-surface)",
        color: "var(--gov-text)",
        border: "1px solid var(--gov-border)",
        boxShadow: "var(--gov-shadow)",
      }}
    />
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
        <ToastHost />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
