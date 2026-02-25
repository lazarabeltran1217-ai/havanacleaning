import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/portal/", "/account/", "/api/", "/book/confirm"],
      },
    ],
    sitemap: "https://havanacleaning.com/sitemap.xml",
  };
}
