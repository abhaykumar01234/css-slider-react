import { ScrollSnapPlugin } from "./ScrollSnapPlugin.js";

export class ScrollSnapLoop extends ScrollSnapPlugin {
  public get id(): string {
    return "ScrollSnapLoop";
  }

  public enable(): void {
    if (this.slider) {
      this.slider.addEventListener("slide-pass", this.loopSlides);
      this.slider.addEventListener("slide-stop", this.loopSlides);
      this.loopSlides();
    }
  }

  public disable(): void {
    if (this.slider) {
      this.slider.removeEventListener("slide-pass", this.loopSlides);
      this.slider.removeEventListener("slide-stop", this.loopSlides);

      const slides = this.slider.element.querySelectorAll<
        HTMLOrSVGElement & Element
      >("[data-index]");
      const sortedSlides = Array.from(slides).sort(this.sortFunction);

      Element.prototype.append.apply(this.slider.element, sortedSlides);
    }
  }

  private removeSnapping() {
    if (this.slider) {
      this.slider.detachListeners();
      this.slider.element.style.scrollBehavior = "auto";
      this.slider.element.style.scrollSnapStop = "unset";
      this.slider.element.style.scrollSnapType = "none";
    }
  }

  private addSnapping() {
    if (this.slider) {
      this.slider.element.style.scrollBehavior = "";
      this.slider.element.style.scrollSnapStop = "";
      this.slider.element.style.scrollSnapType = "";
      this.slider.attachListeners();
      setTimeout(this.slider.update, 0);
    }
  }

  private loopEndToStart() {
    requestAnimationFrame(() => {
      if (this.slider) {
        this.removeSnapping();
        this.slider.element.prepend(
          this.slider.element.children[this.slider.element.children.length - 1]
        );
        this.slider.element.scrollLeft += this.slider.itemSize;
        this.addSnapping();
      }
    });
  }

  private loopStartToEnd() {
    requestAnimationFrame(() => {
      if (this.slider) {
        this.removeSnapping();
        this.slider.element.append(this.slider.element.children[0]);
        this.slider.element.scrollLeft -= this.slider.itemSize;
        this.addSnapping();
      }
    });
  }

  private loopSlides = () => {
    if (this.slider) {
      if (this.slider.element.children.length < 3) {
        return;
      }

      requestAnimationFrame(() => {
        const { scrollLeft, offsetWidth, scrollWidth } = this.slider!.element;
        if (scrollLeft < 5) {
          this.loopEndToStart();
          return;
        }

        if (scrollWidth - scrollLeft - offsetWidth < 5) {
          this.loopStartToEnd();
        }
      });
    }
  };

  private sortFunction(a: HTMLOrSVGElement, b: HTMLOrSVGElement): number {
    return parseInt(a.dataset.index!, 10) - parseInt(b.dataset.index!, 10);
  }
}
