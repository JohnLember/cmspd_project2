import LoginForm from "../../components/auth/LoginForm.jsx";
import LoginHeader from "../../components/auth/LoginHeader.jsx";
import ThemeToggle from "../../components/auth/ThemeToggle.jsx";

export default function Login() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <LoginHeader />
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-end">
          <ThemeToggle />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
