import {
  Clock,
  Raycaster,
  Scene,
  Color,
  Fog,
  WebGLRenderer,
  PerspectiveCamera,
  Vector3,
  AnimationMixer,
  AnimationClip,
  MeshPhongMaterial,
  Mesh,
  BoxHelper,
  VectorKeyframeTrack,
  LoopOnce,
  HemisphereLight,
  DirectionalLight,
  PointLight,
  PlaneGeometry,
  SphereGeometry,
  MeshBasicMaterial,
  TextGeometry,
  FontLoader,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const minFOV = 50;
const maxFOV = 105;
const clock = new Clock();
const textAnimationClock = new Clock();
const raycaster = new Raycaster();
let scene;
let renderer;
let canvas;
let camera;
let model;
let textObject;
let modelScreenCoordinate;
let textObjectScreenCoordinate;
let neck;
let waist;
let onModelClickAnimations;
let onTextClickAnimations;
let lastModelClickAnimationID;
let previousClickAnimationID;
let mixer;
let textObjectMixer;
let idle;
let textAnimationAction;
let stopAnimation = false;
let currentlyAnimating = false;
let requestAnimationFrameID;

function init() {
  const MODEL_PATH = './assets/aknbb.glb';
  canvas = document.getElementById('resume');
  const backgroundColor = 0xdbdbdb;

  scene = new Scene();
  scene.background = new Color(backgroundColor);
  scene.fog = new Fog(backgroundColor, 60, 100);

  renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);

  camera = new PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 30;

  const loader = new GLTFLoader();

  loader.load(
    MODEL_PATH,
    function (gltf) {
      model = gltf.scene;
      const fileAnimations = gltf.animations;

      model.traverse((o) => {
        if (o.isMesh) {
          /* eslint-disable  no-param-reassign */
          o.castShadow = true;
          o.receiveShadow = true;
        }
        if (o.isBone && o.name === 'Neck') {
          neck = o;
        }
        if (o.isBone && o.name === 'Spine') {
          waist = o;
        }
      });

      model.scale.set(7, 7, 7);
      model.position.y = -10;
      model.position.x = 12;
      scene.add(model);

      const vector = new Vector3();
      const canvasElement = renderer.domElement;
      model.updateMatrixWorld();
      vector.setFromMatrixPosition(model.matrixWorld);
      vector.project(camera);
      const x = Math.round((0.5 + vector.x / 2) * (canvasElement.width / window.devicePixelRatio));
      const y = Math.round((0.5 - vector.y / 4) * (canvasElement.height / window.devicePixelRatio));
      modelScreenCoordinate = { x, y };

      mixer = new AnimationMixer(model);

      const animationClips = fileAnimations.filter((val) => val.name !== 'idle');
      onModelClickAnimations = animationClips.map((val) => {
        let clip = AnimationClip.findByName(animationClips, val.name);

        clip.tracks.splice(3, 3);
        clip.tracks.splice(9, 3);

        clip = mixer.clipAction(clip);
        return clip;
      });
      /* eslint-disable  no-underscore-dangle */
      onTextClickAnimations = onModelClickAnimations.filter((anim) => anim._clip.name === 'dance');
      onModelClickAnimations = onModelClickAnimations.filter((anim) => anim._clip.name !== 'dance');

      const idleAnim = AnimationClip.findByName(fileAnimations, 'idle');

      idleAnim.tracks.splice(3, 3);
      idleAnim.tracks.splice(9, 3);

      idle = mixer.clipAction(idleAnim);
      idle.play();
    },
    undefined,
    function (error) {
      /* eslint-disable no-console */
      console.error(error);
    },
  );

  const fontLoader = new FontLoader();
  fontLoader.load('assets/helvetiker.json', function (font) {
    const textGeometry = new TextGeometry('Click to see \n    Resume', {
      font: font,
      size: 2,
      height: 1,
      curveSegments: 3,
      bevelThickness: 0.2,
      bevelSize: 0.2,
      bevelEnabled: true,
    });

    const textMaterial = new MeshPhongMaterial(
      { color: 0x0284ad, specular: 0xd1d1d1 },
    );

    textObject = new Mesh(textGeometry, textMaterial);
    textObject.position.x = -16;
    textObject.name = 'resumeText';
    const bbox = new BoxHelper(textObject, 0xffffff);
    bbox.name = 'resumeTextBBOX';
    bbox.material.visible = false;
    bbox.update();
    scene.add(textObject);
    scene.add(bbox);

    const vector = new Vector3();
    textObject.updateMatrixWorld();
    vector.setFromMatrixPosition(textObject.matrixWorld);
    vector.project(camera);
    const x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
    const y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));
    textObjectScreenCoordinate = { x, y };

    textObjectMixer = new AnimationMixer(textObject);
    const track = new VectorKeyframeTrack(
      '.position',
      [0, 1, 2],
      [
        textObject.position.x,
        textObject.position.y,
        textObject.position.z,
        textObject.position.x,
        textObject.position.y,
        textObject.position.z - 6,
        textObject.position.x,
        textObject.position.y,
        textObject.position.z,
      ],
    );
    const animationClip = new AnimationClip(null, 0.15, [track]);
    textAnimationAction = textObjectMixer.clipAction(animationClip);
    textAnimationAction.setLoop(LoopOnce);
  });

  const hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.61);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const dirLight = new DirectionalLight(0xffffff, 0.3);
  dirLight.position.set(0, 50, 8);
  scene.add(dirLight);

  const light = new PointLight(backgroundColor, 0.6, 100);
  light.position.set(0, 24, 8);
  light.castShadow = true;
  scene.add(light);
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 500;

  const floorGeometry = new PlaneGeometry(5000, 5000, 1, 1);
  const floorMaterial = new MeshPhongMaterial({
    color: backgroundColor,
    shininess: 0,
  });

  const floor = new Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -0.5 * Math.PI;
  floor.receiveShadow = true;
  floor.position.y = -10;
  scene.add(floor);

  const geometry = new SphereGeometry(8, 32, 32);
  const material = new MeshBasicMaterial({ color: 0xd6bc02 });
  const sphere = new Mesh(geometry, material);
  sphere.position.x = 20;
  sphere.position.y = -2;
  sphere.position.z = -24;
  scene.add(sphere);
  updateFrame();
  toggleRendering();
}

function updateFrame() {
  if (mixer) {
    mixer.update(clock.getDelta());
  }

  if (textObjectMixer) {
    textObjectMixer.update(textAnimationClock.getDelta());
  }

  if (resizeRendererToDisplaySize(renderer)) {
    const aspect = canvas.clientWidth / canvas.clientHeight;
    camera.aspect = aspect;
    const fov = Math.min(maxFOV, Math.max(minFOV, (((1.5 - aspect) * 55) + 50)));
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
  /* eslint-disable  no-undef */
}

function resizeRendererToDisplaySize(canvasRenderer) {
  const width = Math.min(document.documentElement.clientWidth, window.innerWidth);
  const height = Math.min(document.documentElement.clientHeight, window.innerHeight);
  const canvasPixelWidth = canvas.width / window.devicePixelRatio;
  const canvasPixelHeight = canvas.height / window.devicePixelRatio;

  const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {
    canvasRenderer.setSize(width, height, false);
  }
  return needResize;
}

function raycast(e, touch = false) {
  const mouse = {};
  if (touch) {
    mouse.x = 2 * (e.changedTouches[0].clientX / window.innerWidth) - 1;
    mouse.y = 1 - 2 * (e.changedTouches[0].clientY / window.innerHeight);
  } else {
    mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
    mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
  }
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects[0]) {
    const { object } = intersects[0];

    if (object.parent && object.parent.name === 'akin') {
      if (!currentlyAnimating) {
        currentlyAnimating = true;
        const tempId = lastModelClickAnimationID;
        lastModelClickAnimationID = randomize(lastModelClickAnimationID, previousClickAnimationID, onModelClickAnimations.length);
        previousClickAnimationID = tempId;
        playModifierAnimation(idle, 0.25, onModelClickAnimations[lastModelClickAnimationID], 0.25);
      }
    }

    if (object.name === 'resumeText' || object.name === 'resumeTextBBOX') {
      if (!currentlyAnimating) {
        currentlyAnimating = true;
        playModifierAnimation(idle, 0.25, onTextClickAnimations[0], 0.25);
      }
      textAnimationAction.reset().play();
      setTimeout(function () {
        window.location.href = 'https://drive.google.com/file/d/1bA2PTs19gqXZ-metpnV9LutfgBZ7K-v8/view?usp=sharing';
      }, 2500);
    }
  }
}

function playModifierAnimation(from, fSpeed, to, tSpeed) {
  to.setLoop(LoopOnce);
  to.reset();
  to.play();
  from.crossFadeTo(to, fSpeed, true);
  setTimeout(function () {
    from.enabled = true;
    to.crossFadeTo(from, tSpeed, true);
    currentlyAnimating = false;
  }, to._clip.duration * 1000 - ((tSpeed + fSpeed) * 1000));
}

function getMousePos(e) {
  return { x: e.clientX, y: e.clientY };
}

function moveJoint(mouse, joint, degreeLimit, targetScreenCoordinate) {
  const degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit, targetScreenCoordinate);
  joint.rotation.y = degToRad(degrees.x);
  joint.rotation.x = degToRad(degrees.y);
}

function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

function startRendering() {
  if (!requestAnimationFrameID) {
    stopAnimation = false;
    updateFrameFrequently();
    if ('ontouchend' in document) {
      canvas.addEventListener('touchend', raycastOnTouch);
    } else {
      canvas.addEventListener('click', raycastOnClick);
    }
    document.addEventListener('mousemove', moveJointOnMouseMove);
  }
}

function stopRendering() {
  if (requestAnimationFrameID) {
    cancelAnimationFrame(requestAnimationFrameID);
    requestAnimationFrameID = undefined;
    stopAnimation = true;
    if ('ontouchend' in document) {
      canvas.removeEventListener('touchend', raycastOnTouch);
    } else {
      canvas.removeEventListener('click', raycastOnClick);
    }
    document.removeEventListener('mousemove', moveJointOnMouseMove);
  }
}

function raycastOnTouch(event) {
  raycast(event, true);
}

function raycastOnClick(event) {
  raycast(event);
}

function moveJointOnMouseMove(event) {
  const mouseCoordinates = getMousePos(event);
  if (neck && waist) {
    moveJoint(mouseCoordinates, neck, 50, modelScreenCoordinate);
    moveJoint(mouseCoordinates, waist, 10, modelScreenCoordinate);
  }
  if (textObject) {
    moveJoint(mouseCoordinates, textObject, 5, textObjectScreenCoordinate);
  }
}

function updateFrameFrequently() {
  if (stopAnimation) {
    requestAnimationFrameID = undefined;
    return;
  }
  updateFrame();
  requestAnimationFrameID = requestAnimationFrame(updateFrameFrequently);
}

function toggleRendering() {
  /* eslint-disable  no-undef */
  const intersectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startRendering();
      } else {
        stopRendering();
      }
    });
  }, { threshold: 0.1 });
  intersectionObserver.observe(canvas);
}

function getMouseDegrees(x, y, degreeLimit, targetScreenCoordinate) {
  let dx = 0;
  let dy = 0;
  let xdiff;
  let xPercentage;
  let ydiff;
  let yPercentage;

  if (x <= targetScreenCoordinate.x) {
    xdiff = targetScreenCoordinate.x - x;
    xPercentage = (xdiff / targetScreenCoordinate.x) * 100;
    dx = ((degreeLimit * 1.6 * xPercentage) / 100) * -1;
  }

  if (x >= targetScreenCoordinate.x) {
    xdiff = x - targetScreenCoordinate.x;
    xPercentage = (xdiff / targetScreenCoordinate.x) * 100;
    dx = (degreeLimit * xPercentage) / 100;
  }
  if (y <= targetScreenCoordinate.y) {
    ydiff = targetScreenCoordinate.y - y;
    yPercentage = (ydiff / targetScreenCoordinate.y) * 100;
    dy = (((degreeLimit * 0.25) * yPercentage) / 100) * -1;
  }
  if (y >= targetScreenCoordinate.y) {
    ydiff = y - targetScreenCoordinate.y;
    yPercentage = (ydiff / targetScreenCoordinate.y) * 100;
    dy = (degreeLimit * 1.1 * yPercentage) / 100;
  }

  return { x: dx, y: dy };
}

function randomize(lastNumber, previousNumber, maxNumber) {
  let result;
  do {
    result = Math.floor(Math.random() * maxNumber);
  } while (result === previousNumber || result === lastNumber);
  return result;
}

init();
