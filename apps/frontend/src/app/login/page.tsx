import React from "react";
import Link from "next/link";

export default function Login() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-indigo-600 mb-6 text-center">Choose Login Type</h1>
        <div className="space-y-4">
          <Link
            href="/login-donor"
            className="block w-full text-center text-xl font-semibold text-blue-500 p-4 border-2 border-blue-500 rounded-md hover:bg-blue-50 transition duration-300"
          >
            Login As Donor 🧪
          </Link>
          <Link
            href="/login-recipient"
            className="block w-full text-center text-xl font-semibold text-rose-500 p-4 border-2 border-rose-500 rounded-md hover:bg-rose-50 transition duration-300"
          >
            Login As Recipient 🫄
          </Link>
        </div>
      </div>
    </div>
  );
}
