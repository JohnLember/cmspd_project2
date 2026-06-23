import LoginForm from "../../components/auth/LoginForm.jsx";
import LoginHeader from "../../components/auth/LoginHeader.jsx";
import ThemeToggle from "../../components/auth/ThemeToggle.jsx";

export default function Login() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-end">
        <ThemeToggle />
      </div>
      <div className="grid w-full items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <LoginHeader />
        <LoginForm />
      </div>
    </div>
  );
}
