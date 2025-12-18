// app/reset-password/page.tsx
import AuthPage from "@/components/AuthPage";
import AuthForm from "@/components/AuthForm";

export default function ResetPasswordPage() {
  return (
    <AuthPage
      videoSrc="/videos/login-bg.mp4"
      imageSrc="/images/login-bg.jpg"
    >
      <AuthForm mode="forgot" /> {/* now allowed */}
    </AuthPage>
  );
}
