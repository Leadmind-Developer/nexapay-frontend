// app/register/page.tsx
import AuthPage from "@/components/AuthPage";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <AuthPage videoSrc="" imageSrc="">
      <AuthForm mode="register" />
    </AuthPage>
  );
}
