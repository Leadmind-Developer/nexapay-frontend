// app/reset-password/page.tsx
import AuthPage from "@/components/AuthPage";
import AuthForm from "@/components/AuthForm";

export default function ResetPasswordPage() {
  return (
    <AuthPage
      videoSrc="/videos/login-bg.mp4"
      imageSrc="/images/login-bg.jpg" // desktop still image
    >
      <AuthForm mode="forgot" /> {/* 'forgot' mode triggers reset password flow */}
    </AuthPage>
  );
}
