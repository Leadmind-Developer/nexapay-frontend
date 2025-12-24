"use client";

import React from "react";

interface ErrorMessageProps {
  message?: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="bg-red-100 dark:bg-red-900 border dark:border-red-800 p-6 rounded text-center space-y-2">
      <h2 className="text-lg font-bold">Error</h2>
      <p className="text-sm">{message || "Something went wrong. Please try again."}</p>
    </div>
  );
}
