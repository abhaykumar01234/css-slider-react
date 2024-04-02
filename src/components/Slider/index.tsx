import type {
  CSSProperties,
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  FC,
} from "react";
import { forwardRef, useState, useEffect, useRef, useCallback } from "react";
import { ScrollSnapSlider } from "./core/ScrollSnapSlider";
import "./core/slider.css";

type SliderProps = ComponentPropsWithoutRef<"ul"> & {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  onSlideStart?: (slideIndex: number) => void;
  onSlidePass?: (slideIndex: number) => void;
  onSlideStop?: (slideIndex: number) => void;
};

const Root: FC<SliderProps> = ({
  width,
  height,
  className = "",
  style = {},
  onSlideStart,
  onSlidePass,
  onSlideStop,
  ...props
}) => {
  const ref = useRef<HTMLUListElement>(null);
  const [sliderObj, setSliderObj] = useState<ScrollSnapSlider | null>(null);
  const [active, setActive] = useState<number>(0);

  const slidesCount = sliderObj?.element.childNodes.length || 0;

  const slideTo = (index: number) =>
    sliderObj && 0 <= index && index < slidesCount && sliderObj.slideTo(index);

  const slideLeft = () =>
    sliderObj && 0 <= active - 1 && sliderObj.slideTo(active - 1);

  const slideRight = () =>
    sliderObj && active - 1 < slidesCount && sliderObj.slideTo(active + 1);

  const handleSlideStart = useCallback(
    (event: Event) => {
      const customEvent = event as CustomEvent<number>;
      // console.info(`Started sliding towards slide ${customEvent.detail}.`);
      if (typeof onSlideStart === "function") onSlideStart(customEvent.detail);
    },
    [onSlideStart]
  );

  const handleSlidePass = useCallback(
    (event: Event) => {
      const customEvent = event as CustomEvent<number>;
      // console.info(`Passing slide ${customEvent.detail}.`);
      setActive(customEvent.detail);
      if (typeof onSlidePass === "function") onSlidePass(customEvent.detail);
    },
    [onSlidePass]
  );

  const handleSlideStop = useCallback(
    (event: Event) => {
      const customEvent = event as CustomEvent<number>;
      // console.info(`Stopped sliding at slide ${customEvent.detail}.`);
      setActive(customEvent.detail);
      if (typeof onSlideStop === "function") onSlideStop(customEvent.detail);
    },
    [onSlideStop]
  );

  useEffect(() => {
    if (ref.current) {
      const slider = new ScrollSnapSlider({ element: ref.current });

      setSliderObj(slider);

      slider.addEventListener("slide-start", handleSlideStart);
      slider.addEventListener("slide-pass", handleSlidePass);
      slider.addEventListener("slide-stop", handleSlideStop);

      return () => {
        slider.removeEventListener("slide-start", handleSlideStart);
        slider.removeEventListener("slide-pass", handleSlidePass);
        slider.removeEventListener("slide-stop", handleSlideStop);
      };
    }
  }, [handleSlidePass, handleSlideStart, handleSlideStop]);

  return (
    <>
      <ul
        className={`slider ${className}`}
        style={{ ...style, width, height }}
        {...props}
        ref={ref}
      />
      {sliderObj && false && (
        <div className="indicators">
          <button className="left" onClick={slideLeft} disabled={active === 0}>
            {active === 0 ? "👈🏿" : "👈"}
          </button>
          {Array.from({ length: slidesCount }, (_, idx) => (
            <button key={idx} onClick={() => slideTo(idx)}>
              {active === idx ? "🔵" : "⚪️"}
            </button>
          ))}
          <button
            className="right"
            onClick={slideRight}
            disabled={active === slidesCount - 1}
          >
            {active === slidesCount - 1 ? "👉🏿" : "👉"}
          </button>
        </div>
      )}
    </>
  );
};

const Slide: FC<ComponentPropsWithRef<"li">> = forwardRef(
  ({ className = "", ...props }, ref) => (
    <li className={`slide ${className}`} {...props} ref={ref} />
  )
);

export const Slider = Object.assign(Root, {
  Slide,
});

Slider.displayName = "Slider";
Slide.displayName = "Slide";
