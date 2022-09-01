const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
context.fillStyle = "#000";

const vertexBuffer = [
  [1, 1, 1],
  [-1, 1, 1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, -1],
  [1, -1, -1],
];

const indexBuffer = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 0],
  [5, 1],
  [6, 2],
  [7, 3],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
];

context.strokeStyle = "#fff";

document.body.append(canvas);

const renderAnimation = (matrix: DOMMatrix) => {
  const transformedBuffer = vertexBuffer.map((vertex) => {
    const point = new DOMPoint(...vertex);
    const transformedPoint = point.matrixTransform(matrix);
    const pixelX =
      ((transformedPoint.x / transformedPoint.w) * 0.5 + 0.5) * canvas.width;
    const pixelY =
      ((transformedPoint.y / transformedPoint.w) * -0.5 + 0.5) * canvas.height;
    return [pixelX, pixelY, transformedPoint.z];
  });
  indexBuffer.forEach((item) => {
    const vertex1 = transformedBuffer[item[0]];
    const vertex2 = transformedBuffer[item[1]];
    context.beginPath();
    context.moveTo(vertex1[0], vertex1[1]);
    context.lineTo(vertex2[0], vertex2[1]);
    context.stroke();
  });
};
const player = {
  position: new DOMPoint(),
  rotX: 0,
  rotY: 0,
};

const renderFrame = () => {
  requestAnimationFrame((time) => {
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (keyMap["KeyW"] === true) {
      player.position.z += 0.1;
    }
    if (keyMap["KeyS"] === true) {
      player.position.z -= 0.1;
    }
    if (keyMap["KeyA"] === true) {
      player.position.x += 0.1;
    }
    if (keyMap["KeyD"] === true) {
      player.position.x -= 0.1;
    }

    const aspectRatio = canvas.width / canvas.height;
    const viewAngle = Math.tan(Math.PI / 4);
    const nearZ = 0.01;
    const farZ = 500;
    // pretier-ignore
    const projection = new DOMMatrix([
      1 / (viewAngle * aspectRatio),
      0,
      0,
      0,
      0,
      1 / viewAngle,
      0,
      0,
      0,
      0,
      (-nearZ - farZ) / (nearZ - farZ),
      (2 * farZ * nearZ) / (nearZ - farZ),
      0,
      0,
      1,
      0,
    ]);

    const matrix = new DOMMatrix()
      .translate(0, 0, 100)
      .rotate(time / 133, time / 100, 20)
      .scale(1, 1, 1);
    const viewMatrix = new DOMMatrix().translate(
      player.rotX,
      player.rotY,
      player.position.z
    );
    const resultMatrix = projection.multiply(viewMatrix.multiply(matrix));
    // const resultMatrix = matrix.multiply(viewMatrix.multiply(projection));
    renderAnimation(resultMatrix);
    renderFrame();
  });
};
renderFrame();
const keyMap: Record<string, boolean> = {};
canvas.onmousemove = (event) => {
  player.rotX += event.movementX / 100;
  player.rotY += event.movementY / 100;
};
canvas.onclick = () => {
  canvas.requestPointerLock();
};

document.body.onkeydown = (event) => {
  keyMap[event.code] = undefined;
};
document.body.onkeyup = (event) => {
  keyMap[event.code] = true;
};
