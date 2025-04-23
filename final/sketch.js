const greeting = "P5.JS 2.0";
const blockSize = 130;
const cursiveSize = 40;
let animationStarts = greeting.split("").map(() => 0);

let cursiveFont;
let blockFont;
let letters;

let bendShader;
let img;
let bgImg;
let paper;

async function setup() {
  createCanvas(600, 400, WEBGL);
  setAttributes({ antialias: true });

  blockFont = await loadFont(
    "https://fonts.googleapis.com/css2?family=Tilt+Warp&display=swap"
  );
  cursiveFont = await loadFont(
    "https://fonts.googleapis.com/css2?family=Meow+Script&display=swap"
  );
  img = await loadImage("van-fg.jpg");
  bgImg = await loadImage("van-bg.jpg");
  paper = await loadImage(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Old_paper7.jpg/640px-Old_paper7.jpg"
  );

  // Generate 3D geometry for each letter
  textSize(blockSize);
  textAlign(CENTER, CENTER);
  letters = greeting.split("").map((letter) => {
    return blockFont.textToModel(letter, 0, 0, {
      extrude: 100,
      sampleFactor: 0.5,
    });
  });

  // Custom shader to map an image to the letters and bend them
  bendShader = baseMaterialShader().modify(() => {
    const t = uniformFloat(() => frameCount * 0.01);
    const imgInput = uniformTexture(img);
    let origPosition = varyingVector2();

    getWorldInputs((inputs) => {
      origPosition = inputs.position.xy;
      let newPos = inputs.position.xy;
      newPos.y += 20 * sin(t + inputs.position.x * 0.01);
      inputs.position = vec3(newPos.x, newPos.y, inputs.position.z);
      return inputs;
    });

    getPixelInputs((inputs) => {
      let coord = origPosition / [600, 400];
      coord /= 2;
      coord += 0.5;
      inputs.color = texture(imgInput, coord);
      return inputs;
    });
  });

  // Text description for screen readers
  describe('"Greetings from P5.JS" in the style of an old postcard');
}

function draw() {
  background(255);

  push();
  // Clip to a smaller rectangle to make a border
  clip(() => {
    rectMode(CENTER);
    rect(0, 0, 560, 360);
  });

  // Draw the background image behind everything
  imageMode(CENTER);
  image(bgImg, 0, 0, width, height);

  // Draw a gradient overlay
  noStroke();
  beginShape(QUAD_STRIP);
  fill(255, 200);
  vertex(-width / 2, height / 2);
  vertex(width / 2, height / 2);
  fill(0, 100);
  vertex(-width / 2, -height / 2);
  vertex(width / 2, -height / 2);
  endShape();

  // Make sure subsequent 3D things don't clip through the background image
  clearDepth();

  // Draw top text
  push();
  textFont(cursiveFont);
  textSize(cursiveSize);
  fill(255);
  textAlign(LEFT, TOP);
  text("Greetings from", -width / 2 + 40, -height / 2 + 50);
  pop();

  // Draw bottom text
  push();
  translate(0, 40);
  shader(bendShader); // Use our custom shader
  rotateX(PI * 0.1);
  rotateY(PI * 0.1);
  ambientLight(0);
  directionalLight(color("#FFFFFF"), 0, 0, -1);
  directionalLight(color("#FFFFFF"), 0, 0.2, -1);
  textSize(blockSize);
  textFont(blockFont);
  noStroke();

  // Draw each 3D letter in its target location
  translate(-fontWidth(greeting) / 2, 0);
  letters.forEach((letter, i) => {
    // Calculate how far into its entrance animation each letter is
    const progress = easeOutElastic(
      map(frameCount - animationStarts[i], i * 3, i * 3 + 70, 0, 1, true)
    );

    const letterW = fontWidth(greeting[i]);
    translate(letterW / 2, 0);
    push();
    scale(1, 1, progress);

    model(letter);

    // See if each letter is close to the mouse and restart its animation
    const position = worldToScreen(0, 0, 0);
    if (dist(position.x, position.y, mouseX, mouseY) < 40) {
      animationStarts[i] = frameCount;
    }

    pop();
    translate(letterW / 2, 0);
  });
  pop();
  pop();

  // Add a paper texture overlay on top of everything
  clearDepth();
  push();
  imageMode(CENTER);
  blendMode(MULTIPLY);
  tint(255, 200);
  image(paper, 0, 0, width, height);
  pop();
}

// Save the canvas at high resolution when a key is pressed
async function keyPressed() {
  const prevDensity = pixelDensity();
  pixelDensity(1500 / width);
  await redraw();
  saveCanvas("postcard.jpg");
  pixelDensity(prevDensity);
}

// Elastic easing function from easings.net
function easeOutElastic(x) {
  const c4 = (2 * Math.PI) / 3;

  return x === 0
    ? 0
    : x === 1
    ? 1
    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}
