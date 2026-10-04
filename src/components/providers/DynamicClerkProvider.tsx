'use client';

import React, { useMemo } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { trTR, enUS } from '@clerk/localizations';
import { useLanguage } from '@/context/LanguageContext';

export default function DynamicClerkProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();

  const localization = useMemo(() => {
    if (language === 'tr') {
      return {
        ...trTR,
        formButtonPrimary: 'Giriş Yap',
        formFieldLabel__identifier: 'E-posta adresi veya kullanıcı adı',
        formFieldInputPlaceholder__identifier: 'E-posta adresi veya kullanıcı adı',
        formFieldLabel__emailAddress_username: 'E-posta adresi veya kullanıcı adı',
        formFieldInputPlaceholder__emailAddress_username: 'E-posta adresi veya kullanıcı adı',
        formFieldLabel__emailAddress: 'E-posta adresi veya kullanıcı adı',
        formFieldInputPlaceholder__emailAddress: 'E-posta adresi veya kullanıcı adı',
        formFieldLabel__username: 'Kullanıcı adı',
        formFieldInputPlaceholder__username: 'Kullanıcı adı',
        formFieldLabel__password: 'Şifre',
        formFieldInputPlaceholder__password: 'Şifre',
        signIn: {
          ...trTR.signIn,
          start: {
            ...trTR.signIn?.start,
            title: 'Giriş yap',
            subtitle: 'RadOnco CDSS ile devam etmek için',
            actionText: 'Hesabınız yok mu?',
            actionLink: 'Kayıt Ol',
          },
          password: {
            ...trTR.signIn?.password,
            title: 'Şifrenizi girin',
            subtitle: 'RadOnco CDSS ile devam etmek için',
          },
        },
        signUp: {
          ...trTR.signUp,
          start: {
            ...trTR.signUp?.start,
            title: 'Kayıt ol',
            subtitle: 'RadOnco CDSS ile başlamak için',
            actionText: 'Zaten hesabınız var mı?',
            actionLink: 'Giriş Yap',
          },
        },
      };
    }

    return {
      ...enUS,
      formButtonPrimary: 'Sign In',
      formFieldLabel__identifier: 'Email address or username',
      formFieldInputPlaceholder__identifier: 'Email address or username',
      formFieldLabel__emailAddress_username: 'Email address or username',
      formFieldInputPlaceholder__emailAddress_username: 'Email address or username',
      formFieldLabel__emailAddress: 'Email address',
      formFieldInputPlaceholder__emailAddress: 'Email address',
      formFieldLabel__username: 'Username',
      formFieldInputPlaceholder__username: 'Username',
      formFieldLabel__password: 'Password',
      formFieldInputPlaceholder__password: 'Password',
      signIn: {
        ...enUS.signIn,
        start: {
          ...enUS.signIn?.start,
          title: 'Sign in to RadOnco CDSS',
          subtitle: 'Welcome back! Please sign in to continue',
          actionText: "Don't have an account?",
          actionLink: 'Sign Up',
        },
        password: {
          ...enUS.signIn?.password,
          title: 'Enter your password',
          subtitle: 'to continue to RadOnco CDSS',
        },
      },
      signUp: {
        ...enUS.signUp,
        start: {
          ...enUS.signUp?.start,
          title: 'Create your RadOnco CDSS Account',
          subtitle: 'Welcome! Please sign up to get started',
          actionText: 'Already have an account?',
          actionLink: 'Sign In',
        },
      },
    };
  }, [language]);

  return (
    <ClerkProvider
      key={language}
      localization={localization}
    >
      {children}
    </ClerkProvider>
  );
}
