declare module "detect-inapp" {
  export default class InApp {
    constructor(useragent: string);
    readonly browser: string;
    readonly isInApp: boolean;
    readonly isMobile: boolean;
    readonly isDesktop: boolean;
  }
}
