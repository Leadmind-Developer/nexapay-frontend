// app/login/page.tsx
import AuthPage from "@/components/AuthPage";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <AuthPage
      videoSrc="/videos/login-bg.mp4"
      imageSrc="/images/login-bg.jpg" // desktop still image
    >
      <AuthForm mode="login" />
    </AuthPage>
  );
}
