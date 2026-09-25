import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f1f5f9] p-4">
      <SignUp />
    </main>
  );
}
