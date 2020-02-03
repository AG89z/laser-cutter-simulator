import { default as V } from "./vector.js";
import * as Simulator from "./simulator";

function givePrediction() {
  const fileData = loadFile();

  //   if (fileData) {
  const settingsData = loadSettings();
  const startPosition = V.new(0, 0);
  const path = [
    { position: V.new(100, 100), desiredSpeed: 200 },
    { position: V.new(100, 700), desiredSpeed: 200 },
    { position: V.new(700, 700), desiredSpeed: 200 },
    { position: V.new(700, 100), desiredSpeed: 200 },
    { position: V.new(100, 100), desiredSpeed: 200 }
  ];
  const timePath = Simulator.plan(path, {}, startPosition);
  const canvas = document.getElementById("canvas");
  animatePath(path, timePath, canvas);

  const timeEstimation = Simulator.estimateTime();

  const timeEstimationElement = document.getElementById("time-estimation");
  timeEstimationElement.innerText = `${timeEstimation.toFixed(2)} min.`;
  //   }
}

function loadSettings() {
  return settings.reduce(
    (res, setting) => ({
      ...res,
      [`${setting}`]: document.getElementsByName(setting)[0].value
    }),
    {}
  );
}

function loadFile() {
  const upload = document.getElementsByName("file-upload")[0].files[0];

  if (upload) {
    return window.URL.createObjectURL(upload);
  }

  return null;
}

function drawFrame(canvas, path, laserPosition) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  path.forEach(p => ctx.lineTo(p.position.x, p.position.y));
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(laserPosition.x, laserPosition.y, 10, 10, 0, 0, 2 * Math.PI);
  ctx.stroke();
}

function moveLaser(lastPosition, speedPointIdx, timePath, ellapsedTime) {
  const { start, target, speed, acceleration } = timePath[speedPointIdx];
  const position = lastPosition ? lastPosition : start;
  const positionToTargetVec = target.sub(position);
  const directionToTarget = positionToTargetVec.unit();
  const ellapsedTimeSeconds = ellapsedTime / 1000;
  const speedToTarget = directionToTarget
    .scale(speed)
    .add(directionToTarget.scale(acceleration))
    .scale(ellapsedTimeSeconds);

  const nextPosition = position.add(speedToTarget);

  return Math.abs(target.sub(nextPosition).mag()) < speedToTarget.mag()
    ? [target, (speedPointIdx + 1) % timePath.length]
    : [nextPosition, speedPointIdx];
}

function animatePath(path, timePath, canvas) {
  const draw = (position, speedPointIdx, startTime) => () => {
    const now = performance.now();
    const ellapsedTime = now - startTime;

    const [nextPosition, nextIdx] = moveLaser(
      position,
      speedPointIdx,
      timePath,
      ellapsedTime
    );

    drawFrame(canvas, path, nextPosition);

    window.requestAnimationFrame(draw(nextPosition, nextIdx, now));
  };

  window.requestAnimationFrame(draw(null, 0, 0, performance.now()));
}

/// INIT

const settings = Object.freeze([
  "maximum-speed-x",
  "maximum-speed-y",
  "acceleration-x",
  "acceleration-y",
  "cutting-speed",
  "engraving-speed"
]);

settings.map(setting =>
  document
    .getElementsByName(setting)[0]
    .addEventListener("change", givePrediction)
);

document
  .getElementsByName("file-upload")[0]
  .addEventListener("change", givePrediction);

window.onresize = () => {
  const canvas = document.getElementById("canvas");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
};

///
