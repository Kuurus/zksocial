// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import ProfileOnboarding from "./ProfileOnboarding";
// import TinderCard from "./TinderCard";
// import { createKintoSDK, KintoAccountInfo } from "kinto-web-sdk";
// import { IProfile } from "@/types";

// const APP_ADDRESS = "0x10E0436902aE99A04E81Cb6e4463331363FEcD71"; // Replace with your actual Kinto app address
// const kintoSDK = createKintoSDK(APP_ADDRESS);

// export default function ClientHome() {
//   const [showOnboarding, setShowOnboarding] = useState(false);
//   const [profile, setProfile] = useState<IProfile | null>(null);
//   const [kintoAccount, setKintoAccount] = useState<KintoAccountInfo | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const [connectLoading, setConnectLoading] = useState(false);

//   const connectKinto = async () => {
//     setConnectLoading(true);
//     try {
//       const accountInfo = await kintoSDK.connect();
//       setKintoAccount(accountInfo);
//       if (accountInfo.exists) {
//         // Sign a message with Kinto
//         try {
//           const message = "Sign this message to authenticate with our app";
//           // const signature = await kintoSDK.signMessage(message);
//           console.log("Message signed successfully:", signature);
//         } catch (error) {
//           console.error("Failed to sign message:", error);
//           setError("Failed to authenticate. Please try again.");
//         }
//       } else {
//         // User needs to create a Kinto account
//         setShowOnboarding(true);
//       }
//     } catch (error) {
//       console.error("Failed to connect to Kinto:", error);
//       setError("Failed to connect to Kinto. Please try again.");
//     } finally {
//       setConnectLoading(false);
//     }
//   };

//   const handleOnboardingComplete = (profileData: IProfile) => {
//     setProfile(profileData);
//     setShowOnboarding(false);
//     localStorage.setItem("userProfile", JSON.stringify(profileData));
//     // axios.post(process.env.NEXT_PUBLIC_API_URL + "/register", {
//     //   userId: kintoAccount?.id,
//     //   bio: profileData.bio,
//     //   age: profileData.age,
//     //   location: profileData.location,
//     // });
//   };

//   const createKintoWallet = async () => {
//     try {
//       await kintoSDK.createNewWallet();
//       // After wallet creation, you might want to refresh the connection
//       const accountInfo = await kintoSDK.connect();
//       setKintoAccount(accountInfo);
//     } catch (error) {
//       console.error("Failed to create Kinto wallet:", error);
//       setError("Failed to create Kinto wallet. Please try again.");
//     }
//   };

//   if (error) {
//     return (
//       <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-pink-200 to-pink-400 p-4">
//         <p className="text-white text-xl mb-4">{error}</p>
//         <button onClick={() => window.location.reload()} className="bg-white text-pink-500 py-2 px-4 rounded-full">
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   if (!kintoAccount) {
//     return (
//       <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-pink-200 to-pink-400 p-4">
//         <h2 className="text-white text-2xl mb-4">Welcome to Spermify!</h2>
//         <p className="text-white text-xl mb-4">To get started, you need to connect to Kinto.</p>
//         <button
//           onClick={connectKinto}
//           className="bg-white text-pink-500 py-3 px-6 rounded-full text-xl font-semibold hover:bg-pink-100 transition duration-300"
//         >
//           {connectLoading ? "Connecting..." : "Connect to Kinto"}
//         </button>
//       </div>
//     );
//   }

//   if (!kintoAccount.exists) {
//     return (
//       <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-pink-200 to-pink-400 p-4">
//         <h2 className="text-white text-2xl mb-4">Welcome to Spermify!</h2>
//         <p className="text-white text-xl mb-4">To get started, you need to create a Kinto wallet.</p>
//         <button
//           onClick={createKintoWallet}
//           className="bg-white text-pink-500 py-3 px-6 rounded-full text-xl font-semibold hover:bg-pink-100 transition duration-300"
//         >
//           Create Kinto Wallet
//         </button>
//       </div>
//     );
//   }

//   return (
//     <main className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-pink-200 to-pink-400 p-4">
//       {showOnboarding ? (
//         <ProfileOnboarding onComplete={handleOnboardingComplete} />
//       ) : profile ? (
//         <div className="w-full max-w-md">
//           <TinderCard card={profile} />
//           <div className="mt-8 text-center">
//             <h2 className="text-2xl font-bold text-white mb-4">Profile Complete!</h2>
//             <Link
//               href="/matching"
//               className="bg-white text-pink-500 py-3 px-6 rounded-full text-xl font-semibold hover:bg-pink-100 transition duration-300"
//             >
//               Start Matching
//             </Link>
//           </div>
//         </div>
//       ) : null}
//     </main>
//   );
// }
