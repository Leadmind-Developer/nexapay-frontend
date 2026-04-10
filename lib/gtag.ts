// lib/gtag.ts
export const GA_ID = "G-ZDKP54Y9FL";

export const pageview = (url: string) => {
  window.gtag("config", GA_ID, {
    page_path: url,
  });
};
