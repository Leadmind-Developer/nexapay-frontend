"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IoMoon,
  IoFingerPrint,
  IoLockClosed,
  IoDocumentText,
  IoBook,
  IoChevronForward,
} from "react-icons/io5";
import clsx from "clsx";

import api from "@/lib/api";
import OTPInput from "@/components/auth/OTPInput";
import ToggleSwitch from "@/components/ui/ToggleSwitch";

type SecurityStatus = {
  transactionPinSet: boolean;
  twoFAEnabled: boolean;
  totpEnabled: boolean;
  pushDevices: number;
};

export default function SettingsPage() {
  const router = useRouter();

  /* --------------------------------
   * State
   * -------------------------------- */
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const [security, setSecurity] = useState<SecurityStatus | null>(null);

  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingAction, setPendingAction] =
    useState<null | (() => Promise<void>)>(null);

  /* --------------------------------
   * Initial load
   * -------------------------------- */
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const dark = theme === "dark";

    setIsDarkMode(dark);
    document.documentElement.classList.toggle("dark", dark);
    setBiometricAvailable(!!window.PublicKeyCredential);

    loadSecurityStatus();
    loadBiometricStatus();
  }, []);

  const loadSecurityStatus = async () => {
    const res = await api.get("/auth/security-status");
    setSecurity(res.data);
  };

  const loadBiometricStatus = async () => {
    try {
      const res = await api.get("/auth/biometric/status");
      setBiometricEnabled(!!res.data?.enabled);
    } catch {
      /* silent */
    }
  };

  /* --------------------------------
   * Theme
   * -------------------------------- */
  const toggleTheme = (enabled: boolean) => {
    setIsDarkMode(enabled);
    localStorage.setItem("theme", enabled ? "dark" : "light");
    document.documentElement.classList.toggle("dark", enabled);
  };

  /* --------------------------------
   * Step-up security
   * -------------------------------- */
  const withStepUpSecurity = async (action: () => Promise<void>) => {
    if (!security) return;

    if (!security.totpEnabled && security.pushDevices === 0) {
      alert("Please enable an authenticator or push notifications first.");
      return;
    }

    setPendingAction(() => action);
    setOtpValue("");
  };

  const verifyStepUp = async () => {
    if (!pendingAction || !security) return;

    setOtpLoading(true);
    try {
      await api.post("/auth/verify-2fa", {
        totp: security.totpEnabled ? otpValue : undefined,
      });

      await pendingAction();
      setPendingAction(null);
      setOtpValue("");
      loadSecurityStatus();
    } finally {
      setOtpLoading(false);
    }
  };

  /* --------------------------------
   * Actions
   * -------------------------------- */
  const toggleBiometric = async (enabled: boolean) => {
    if (enabled && !biometricAvailable) return;

    await withStepUpSecurity(async () => {
      await api.post("/auth/biometric", { enabled });
      setBiometricEnabled(enabled);
    });
  };

  /* --------------------------------
   * UI helpers
   * -------------------------------- */
  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <h2 className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">
        {title}
      </h2>
      {children}
    </div>
  );

  const Row = ({
    icon,
    label,
    action,
    disabled,
  }: {
    icon: React.ReactNode;
    label: string;
    action?: React.ReactNode;
    disabled?: boolean;
  }) => (
    <div
      className={clsx(
        "flex items-center justify-between px-4 py-4 border-t",
        "border-zinc-200 dark:border-zinc-800",
        disabled && "opacity-50"
      )}
    >
      <div className="flex items-center gap-3 text-zinc-800 dark:text-zinc-100">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {action}
    </div>
  );

  /* --------------------------------
   * Render
   * -------------------------------- */
  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      {/* Preferences */}
      <Section title="Preferences">
        <Row
          icon={<IoMoon size={18} />}
          label="Dark mode"
          action={
            <ToggleSwitch
              checked={isDarkMode}
              onChange={toggleTheme}
            />
          }
        />

        <Row
          icon={<IoFingerPrint size={18} />}
          label="Biometric login"
          disabled={!biometricAvailable}
          action={
            <ToggleSwitch
              checked={biometricEnabled}
              onChange={toggleBiometric}
              disabled={!biometricAvailable}
            />
          }
        />
      </Section>

      {/* Security */}
      <Section title="Security">
        {!security?.totpEnabled && (
          <button
            onClick={() => router.push("/dashboard/security/authenticator")}
            className="w-full text-left"
          >
            <Row
              icon={<IoLockClosed size={18} />}
              label="Set up authenticator"
              action={<IoChevronForward className="text-zinc-400" />}
            />
          </button>
        )}

        <button
          onClick={() => router.push("/dashboard/security/change-pin")}
          className="w-full text-left"
        >
          <Row
            icon={<IoLockClosed size={18} />}
            label="Change transaction PIN"
            action={<IoChevronForward className="text-zinc-400" />}
          />
        </button>

        <button
          onClick={() => router.push("/dashboard/security/push-devices")}
          className="w-full text-left"
        >
          <Row
            icon={<IoFingerPrint size={18} />}
            label={`Push devices (${security?.pushDevices ?? 0})`}
            action={<IoChevronForward className="text-zinc-400" />}
          />
        </button>
      </Section>

      {/* App Info */}
      <Section title="App info">
        <Row
          icon={<IoDocumentText size={18} />}
          label="Privacy policy"
          action={<IoChevronForward className="text-zinc-400" />}
        />
        <Row
          icon={<IoBook size={18} />}
          label="Terms & conditions"
          action={<IoChevronForward className="text-zinc-400" />}
        />
      </Section>

      {/* Step-up verification */}
      {pendingAction && security && (
        <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
          {security.totpEnabled && (
            <>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                Enter the code from your authenticator app
              </p>
              <OTPInput
                length={6}
                value={otpValue}
                onChange={setOtpValue}
                disabled={otpLoading}
              />
            </>
          )}

          {!security.totpEnabled && security.pushDevices > 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              A push notification has been sent. Approve it to continue.
            </p>
          )}

          <button
            onClick={verifyStepUp}
            disabled={
              otpLoading ||
              (security.totpEnabled && otpValue.length < 6)
            }
            className="mt-4 w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium disabled:opacity-50"
          >
            {otpLoading ? "Verifying…" : "Confirm"}
          </button>
        </div>
      )}

      <p className="text-center text-xs text-zinc-400">
        App version 1.0.0
      </p>
    </div>
  );
}
