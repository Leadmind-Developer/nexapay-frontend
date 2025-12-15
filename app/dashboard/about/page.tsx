"use client";

import React from "react";
import { IoMailOutline, IoCallOutline, IoGlobeOutline } from "react-icons/io5";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import Image from "next/image";
import logo from "../assets/logo.png";

export default function AboutPage() {
  return (
    <ResponsiveLandingWrapper>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-blue-600 dark:bg-blue-700 rounded-2xl text-center py-12 shadow-md">
          <Image src={logo} alt="Nexa Logo" width={80} height={80} className="mx-auto mb-2" />
          <h1 className="text-white text-2xl font-bold">About Nexa</h1>
          <p className="text-white text-sm opacity-90 mt-1">Your all-in-one smart payment app</p>
        </div>

        {/* Our Story */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-2">
          <h2 className="text-blue-600 dark:text-blue-400 font-bold text-lg">Our Story</h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            Nexa was built with one mission — to make everyday payments effortless,
            fast, and secure. Whether you’re recharging airtime, buying data, or paying
            bills, Nexa keeps your financial life in one place.
          </p>
        </div>

        {/* Our Mission */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-2">
          <h2 className="text-blue-600 dark:text-blue-400 font-bold text-lg">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            To empower individuals and businesses across Africa with reliable,
            transparent, and innovative payment experiences that simplify daily life.
          </p>
        </div>

        {/* Our Vision */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-2">
          <h2 className="text-blue-600 dark:text-blue-400 font-bold text-lg">Our Vision</h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            To become Africa’s most trusted and user-friendly digital payment ecosystem.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-3">
          <h2 className="text-blue-600 dark:text-blue-400 font-bold text-lg">Contact Us</h2>

          <a
            href="mailto:support@nexaapp.com"
            className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <IoMailOutline size={22} />
            <span>support@nexaapp.com</span>
          </a>

          <a
            href="tel:+2348012345678"
            className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <IoCallOutline size={22} />
            <span>+234 801 234 5678</span>
          </a>

          <a
            href="https://www.nexaapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <IoGlobeOutline size={22} />
            <span>www.nexaapp.com</span>
          </a>
        </div>

        {/* Version / Footer */}
        <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-6">
          © {new Date().getFullYear()} Nexa Technologies. All rights reserved.
        </p>
      </div>
    </ResponsiveLandingWrapper>
  );
}
