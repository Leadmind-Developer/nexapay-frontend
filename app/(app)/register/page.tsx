import AuthPage from "@/components/AuthPage";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <AuthPage plainBackground>
      <AuthForm mode="register" />
    </AuthPage>
  );
}
