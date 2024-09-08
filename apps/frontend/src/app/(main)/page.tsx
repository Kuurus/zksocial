// import ClientHome from "./components/ClientHome";

import Link from "next/link";

export default function Home() {
  return (
    <>
      <Link href="/login-donor">Login Male</Link>
      <Link href="/profile-donor">Profile Male</Link>
    </>
  );
}
