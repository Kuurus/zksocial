"use client";

import { useState } from "react";
import Image from "next/image";

interface ProfileOnboardingProps {
  onComplete: (profile: ProfileData) => void;
}

interface ProfileData {
  userId:string;
  name: string;
  age: string;
  bio: string;
  //image: string;
}

export default function ProfileOnboarding({ onComplete }: ProfileOnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");

  const steps = [
    {
      title: "What's your name?",
      component: (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full p-4 text-2xl border-b-2 border-pink-500 focus:outline-none"
        />
      )
    },
    {
      title: "How old are you?",
      component: (
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Your age"
          className="w-full p-4 text-2xl border-b-2 border-pink-500 focus:outline-none"
        />
      )
    },
    {
      title: "Tell us about yourself",
      component: (
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A short bio about yourself"
          className="w-full p-4 text-xl border-2 border-pink-500 rounded-lg h-40 focus:outline-none"
        />
      )
    },
    {
      title: "Add a profile picture",
      component: (
        <div className="flex flex-col items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImage(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
            id="imageUpload"
          />
          <label
            htmlFor="imageUpload"
            className="bg-pink-500 text-white py-2 px-4 rounded-full cursor-pointer hover:bg-pink-600 transition duration-300"
          >
            Choose Image
          </label>
          {image && (
            <div className="mt-4 w-48 h-48 relative">
              <Image src={image} alt="Profile" fill style={{objectFit: "cover"}} className="rounded-full" />
            </div>
          )}
        </div>
      )
    }
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      let profile: ProfileData = { userId:"0", name, age, bio };
      // Register a random user before creating the profile
      const randomUser = {
        username: `user_${Math.random().toString(36).substring(7)}`,
        email: `${Math.random().toString(36).substring(7)}@example.com`,
        password: Math.random().toString(36).substring(7),
        gender: Math.random() < 0.5 ? 'male' : 'female'
      };

      try {
        const registerResponse = await fetch('https://zksocial-backend.vercel.app/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(randomUser),
        });

        if (!registerResponse.ok) {
          throw new Error('Failed to register user');
        }

        const userData = await registerResponse.json();
        profile.userId = userData.id; // Add the user ID to the profile data
      } catch (error) {
        console.error('Error registering user:', error);
        // Handle error (e.g., show error message to user)
        return;
      }
      try {
        const response = await fetch('https://zksocial-backend.vercel.app/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profile),
        });

        if (!response.ok) {
          throw new Error('Failed to save profile');
        }

        onComplete(profile);
      } catch (error) {
        console.error('Error saving profile:', error);
        // Handle error (e.g., show error message to user)
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-md">
      <div className="h-4 bg-pink-500" style={{width: `${((step + 1) / steps.length) * 100}%`}}></div>
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-pink-500">{steps[step].title}</h2>
        {steps[step].component}
        <button
          onClick={handleNext}
          className="w-full bg-pink-500 text-white py-4 rounded-full text-xl font-semibold mt-8 hover:bg-pink-600 transition duration-300"
        >
          {step === steps.length - 1 ? "Complete Profile" : "Next"}
        </button>
      </div>
    </div>
  );
}