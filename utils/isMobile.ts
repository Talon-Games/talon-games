export default function isMobile(): boolean {
  const hasSmallScreen = window.innerWidth < 640;
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;

  const isMobileDevice =
    /android|avantgo|blackberry|iphone|ipad|ipod|iemobile|opera mini|palmos|webos/i.test(
      userAgent,
    );

  return hasSmallScreen || isMobileDevice;
}
