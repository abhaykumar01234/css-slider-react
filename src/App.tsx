import { Slider } from "./components/Slider";

export const App = () => {
  return (
    <div className="layout">
      <header className="fluid">Header</header>
      <main>
        <div className="columns">
          <div className="column">Col A</div>
          <div className="column">Col B</div>

          <Slider className="column">
            {Array.from({ length: 4 }, (_, idx) => (
              <Slider.Slide key={idx}>
                <img
                  alt={`slide${idx}`}
                  src={`https://source.unsplash.com/random/200x300?sig=${idx}`}
                />
              </Slider.Slide>
            ))}
            <Slider.Slide className="flex-center">
              <h2>Name: Abhay Kumar</h2>
              <h3>Age: 31 years</h3>
            </Slider.Slide>
          </Slider>

          <div className="column">Col C</div>
          <div className="column">Col D</div>
        </div>

        <span>Lorem ipsum dolor sit amet.</span>
      </main>
      <footer className="fluid">Footer</footer>
    </div>
  );
};
