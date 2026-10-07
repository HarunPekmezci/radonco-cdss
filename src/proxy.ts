import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/', 
  '/cdss(.*)',
  '/prognostic(.*)',
  '/doz-kisitlari(.*)',
  '/doz-hesaplayici(.*)',
  '/hedef-hacim(.*)',
  '/contouring-atlas(.*)',
  '/toxicity(.*)',
  '/guidelines(.*)',
  '/ai-asistan(.*)',
  '/academy(.*)',
  '/kaynakca(.*)',
  '/references(.*)',
  '/iletisim(.*)',
  '/contact(.*)',
  '/yasal-uyari(.*)',
  '/legal-notice(.*)',
  '/gizlilik(.*)',
  '/privacy(.*)',
  '/disclaimer(.*)',
  '/sitemap.xml', 
  '/robots.txt',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
