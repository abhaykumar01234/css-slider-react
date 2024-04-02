import type { ScrollSnapSlider } from "./ScrollSnapSlider";

export abstract class ScrollSnapPlugin {
  public slider: ScrollSnapSlider | null;
  public constructor() {
    this.slider = null;
  }
  public abstract get id(): string;
  public abstract enable(): void;
  public abstract disable(): void;
}
