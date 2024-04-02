import { ScrollSnapPlugin } from "./ScrollSnapPlugin.js";

export class ScrollSnapAutoplay extends ScrollSnapPlugin {
  public intervalDuration: number;
  public timeoutDuration: number;
  private debounceId: number | null = null;
  private interval: number | null;
  private readonly events: string[];

  public constructor(
    intervalDuration = 3141,
    timeoutDuration = 6282,
    events: string[] = ["touchmove", "wheel"]
  ) {
    super();

    this.intervalDuration = intervalDuration;
    this.timeoutDuration = timeoutDuration;
    this.interval = null;
    this.events = events;
  }

  public get id(): string {
    return "ScrollSnapAutoplay";
  }

  public enable = () => {
    if (this.slider) {
      this.debounceId && clearTimeout(this.debounceId);
      this.debounceId = null;
      this.interval = setInterval(this.onInterval, this.intervalDuration);

      for (const event of this.events) {
        this.slider.addEventListener(event, this.disableTemporarily, {
          passive: true,
        });
      }
    }
  };

  public disable(): void {
    if (this.slider) {
      for (const event of this.events) {
        this.slider.removeEventListener(event, this.disableTemporarily);
      }

      this.interval && clearInterval(this.interval);
      this.interval = null;
      this.debounceId && clearTimeout(this.debounceId);
      this.debounceId = null;
    }
  }

  public disableTemporarily = () => {
    if (!this.interval) {
      return;
    }

    clearInterval(this.interval);
    this.interval = null;

    this.debounceId && clearTimeout(this.debounceId);
    this.debounceId = setTimeout(this.enable, this.timeoutDuration);
  };

  public onInterval = () => {
    if (this.slider && this.slider.plugins.has("ScrollSnapLoop")) {
      this.slider.slideTo(this.slider.slide + 1);
      return;
    }

    requestAnimationFrame(() => {
      if (this.slider) {
        const { scrollLeft, offsetWidth, scrollWidth } = this.slider.element;
        const isLastSlide = scrollLeft + offsetWidth === scrollWidth;
        const target = isLastSlide ? 0 : this.slider.slide + 1;

        this.slider.slideTo(target);
      }
    });
  };
}
