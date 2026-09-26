import { SignUp } from '@clerk/nextjs';
import { Radiation } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#060a12] p-6">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Radiation className="w-7 h-7 text-amber-400" />
          <span className="text-xl font-black text-white">RadOnc CDSS Kayıt</span>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}