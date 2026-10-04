import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://radoncoxia.pro";
  const routes = [
    "",
    "/cdss",
    "/doz-kisitlari",
    "/doz-hesaplayici",
    "/hedef-hacim",
    "/references",
    "/yasal-uyari",
    "/iletisim",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
