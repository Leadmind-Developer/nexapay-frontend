// app/register/page.tsx
import AuthPage from "@/components/AuthPage";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <AuthPage
      videoSrc="/videos/register-bg.mp4"
      imageSrc="/images/register-bg.jpg" // desktop still image
    >
      <AuthForm mode="register" />
    </AuthPage>
  );
}
