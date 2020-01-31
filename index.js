import { default as V } from "./vector.js";

// const a = V.new(1, 1);
// const b = V.new(5, 5);
// const c = b.unit();

// console.log(a, b, c, b.mag());

var canvas = document.createElement("canvas", {});
canvas.width = 600;
canvas.height = 400;

var ctx = canvas.getContext("2d");

const useContext = context => fn => (...args) => fn(context, ...args);

const onContext = useContext(ctx);

const circle = onContext((context, x, y, r) => {
  context.beginPath();
  context.ellipse(x, y, r, r, 0, 0, 2 * Math.PI);
  context.stroke();
});

const settingsData = ({ path, acceleration, maxSpeed }) => ({
  path,
  acceleration,
  maxSpeed
});

const frameData = ({ settings, position, speed, target }) => ({
  settings: settingsData({ ...settings }),
  position,
  speed,
  target
});

const drawFrame = frame => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  frame.settings.path.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.stroke();

  circle(frame.position.x, frame.position.y, 10);

  const position = frame.position;
  const speed = frame.speed;

  const target = frame.settings.path[frame.target];

  // const dir = target.sub(position).unit();
  // const nextSpeed = speed
  //   .add(dir.scale(frame.settings.acceleration.x))
  //   .limit(frame.settings.maxSpeed.x);
  // const nextPosition = position.add(nextSpeed);
  // const nextTarget =
  //   target.sub(nextPosition).mag() < frame.settings.maxSpeed.x
  //     ? (frame.target + 1) % frame.settings.path.length
  //     : frame.target;
  const dir = target.sub(position).unit();

  const axesAcceleration = frame.settings.acceleration;
  var acceleration;
  if (
    Math.abs(dir.y / dir.x) > Math.abs(axesAcceleration.y / axesAcceleration.x)
  ) {
    acceleration = Math.abs(axesAcceleration.y / dir.y);
  } else {
    acceleration = Math.abs(axesAcceleration.x / dir.x);
  }

  // console.log(acceleration);
  const accelerationVec = dir.scale(acceleration);

  // const acceleration =
  //   dir.x * axesAcceleration.y < axesAcceleration.x
  //     ? axesAcceleration.y
  //     : axesAcceleration.x;
  // var acceleration = Math.abs(Math.min(
  //   axesAcceleration.x / (dir.x + 0.000000001),
  //   axesAcceleration.y / (dir.y + 0.000000001)
  // ));

  const speedT = speed.add(accelerationVec);
  var maxSpeed = 100000;
  if (
    Math.abs(speedT.x) > frame.settings.maxSpeed.x &&
    Math.abs(speedT.y) < frame.settings.maxSpeed.y
  ) {
    maxSpeed = frame.settings.maxSpeed.x;
  } else if (
    Math.abs(speedT.y) > frame.settings.maxSpeed.y &&
    Math.abs(speedT.x) < frame.settings.maxSpeed.x
  ) {
    maxSpeed = frame.settings.maxSpeed.y;
  } else if (
    Math.abs(speedT.x) > frame.settings.maxSpeed.x &&
    Math.abs(speedT.y) > frame.settings.maxSpeed.y
  ) {
    maxSpeed =
      frame.settings.maxSpeed.x > frame.settings.maxSpeed.y
        ? frame.settings.maxSpeed.y
        : frame.settings.maxSpeed.x;
  }

  // console.log(maxSpeed);

  const nextSpeed = speedT.limit(maxSpeed);
  const nextPosition = position.add(nextSpeed);
  const nextTarget =
    target.sub(nextPosition).mag() < frame.settings.maxSpeed.x
      ? (frame.target + 1) % frame.settings.path.length
      : frame.target;

  const newFrame = frameData({
    ...frame,
    position: nextPosition,
    target: nextTarget,
    speed: nextSpeed
  });

  return newFrame;
};

const draw = frame => () => {
  const newFrame = drawFrame(frame);

  window.requestAnimationFrame(draw(newFrame));
};

const settings = settingsData({
  path: [
    V.new(100, 100),
    V.new(100, 200),
    V.new(200, 200),
    V.new(200, 100),
    V.new(100, 100)
  ],
  acceleration: V.new(0.1, 1),
  maxSpeed: V.new(4, 2)
});

window.requestAnimationFrame(
  draw(
    frameData({
      settings,
      position: V.new(0, 0),
      speed: V.new(0, 0),
      target: 0
    })
  )
);

document.body.appendChild(canvas);
