"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button"; // or your button component

export default function EventSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-600">
        🎉 Payment Successful!
      </h1>
      <p className="mb-6 text-lg">
        Your ticket has been booked successfully. Please check your email for your ticket details. 
        If you don’t receive it within 30 minutes, contact our{" "}
        <Link href="/Support" className="text-blue-600 underline">
          support team
        </Link>.
      </p>
      <p className="mb-6 text-lg">
        Meanwhile, explore more exciting events happening soon!
      </p>
      <Link href="/events">
        <Button size="lg" className="px-8 py-4">
          Browse Events
        </Button>
      </Link>
    </div>
  );
}
