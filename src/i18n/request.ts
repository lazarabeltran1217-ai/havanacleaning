import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headersList = await headers();

  // Check cookie first, then Accept-Language header, default to "en"
  let locale = cookieStore.get("locale")?.value || "en";

  if (!["en", "es"].includes(locale)) {
    const acceptLang = headersList.get("accept-language") || "";
    locale = acceptLang.includes("es") ? "es" : "en";
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
