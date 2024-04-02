import { ScrollSnapPlugin } from "./ScrollSnapPlugin";

export type ScrollSnapSliderOptions = Partial<ScrollSnapSlider> & {
  element: HTMLElement;
};

export class ScrollSnapSlider {
  public element!: HTMLElement;
  public plugins: Map<string, ScrollSnapPlugin>;
  public removeEventListener: HTMLElement["removeEventListener"];
  public addEventListener: HTMLElement["addEventListener"];

  public roundingMethod: (value: number) => number = Math.round;
  public scrollTimeout: number = 100;
  public itemSize: number = 0;

  public sizingMethod: (
    slider: ScrollSnapSlider,
    entries?: ResizeObserverEntry[] | undefined
  ) => number = (slider: ScrollSnapSlider) => {
    return (slider.element.firstElementChild as HTMLElement).offsetWidth;
  };

  public slide: number = 0;

  private resizeObserver: ResizeObserver;
  private scrollTimeoutId: null | number;
  private slideScrollLeft: number = 0;

  constructor(options: ScrollSnapSliderOptions) {
    Object.assign(this, {
      scrollTimeout: 100,
      roundingMethod: Math.round,
      sizingMethod: (slider: ScrollSnapSlider) => {
        return (slider.element.firstElementChild as HTMLElement).offsetWidth;
      },
      ...options,
    });

    this.scrollTimeoutId = null;
    this.addEventListener = this.element.addEventListener.bind(this.element);
    this.removeEventListener = this.element.removeEventListener.bind(
      this.element
    );
    this.plugins = new Map<string, ScrollSnapPlugin>();

    this.resizeObserver = new ResizeObserver(this.rafSlideSize);
    this.resizeObserver.observe(this.element);
    for (const child of this.element.children) {
      this.resizeObserver.observe(child);
    }

    this.rafSlideSize();
    this.attachListeners();
  }

  public with(plugins: ScrollSnapPlugin[], enabled = true): ScrollSnapSlider {
    for (const plugin of plugins) {
      plugin.slider = this;
      this.plugins.set(plugin.id, plugin);
      enabled && plugin.enable();
    }

    return this;
  }

  public attachListeners(): void {
    this.addEventListener("scroll", this.onScroll, { passive: true });
  }

  public detachListeners(): void {
    this.removeEventListener("scroll", this.onScroll);
    this.scrollTimeoutId && clearTimeout(this.scrollTimeoutId);
  }

  public slideTo = (index: number) => {
    requestAnimationFrame(() => {
      this.element.scrollTo({
        left: index * this.itemSize,
      });
    });
  };

  public destroy(): void {
    this.scrollTimeoutId && clearTimeout(this.scrollTimeoutId);
    this.detachListeners();

    for (const [id, plugin] of this.plugins) {
      plugin.disable();
      plugin.slider = null;
      this.plugins.delete(id);
    }
  }

  update = () => {
    requestAnimationFrame(() => {
      this.slide = this.roundingMethod(this.element.scrollLeft / this.itemSize);
      this.slideScrollLeft = this.slide * this.itemSize;
    });
  };

  private onScrollEnd = () => {
    this.scrollTimeoutId = null;
    this.update();
    this.dispatch("slide-stop", this.slide);
  };

  private rafSlideSize = (entries?: ResizeObserverEntry[]) => {
    requestAnimationFrame(() => {
      this.itemSize = this.sizingMethod(this, entries);
      this.update();
    });
  };

  private dispatch(event: string, detail: unknown): boolean {
    return this.element.dispatchEvent(
      new CustomEvent(event, {
        detail,
      })
    );
  }

  private onScroll = () => {
    requestAnimationFrame(() => {
      const { scrollLeft } = this.element;
      const newSlide = this.roundingMethod(scrollLeft / this.itemSize);

      if (null === this.scrollTimeoutId) {
        const direction = scrollLeft > this.slideScrollLeft ? 1 : -1;
        this.dispatch("slide-start", this.slide + direction);
      }

      if (newSlide !== this.slide) {
        this.update();
        this.dispatch("slide-pass", this.slide);
      }

      this.scrollTimeoutId && clearTimeout(this.scrollTimeoutId);
      this.scrollTimeoutId = setTimeout(this.onScrollEnd, this.scrollTimeout);
    });
  };
}
