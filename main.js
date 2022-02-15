"use strict";

let elemento;

// SETTINGS of this demo:
const SETTINGS = {
  gltfModelURL: "scene2.gltf",
  cubeMapURL: "Bridge2/",
  offsetYZ: [0.8, 0.5], // offset of the model in 3D along vertical and depth axis
  scale: 2.5,
};

let THREECAMERA = null;

// build the 3D. called once when Jeeliz Face Filter is OK
function init_threeScene(spec) {
  const threeStuffs = JeelizThreeHelper.init(spec, null);

  // CREATE THE ENVMAP:

  const envMap = new THREE.CubeTextureLoader().load([
    "textures/posx.jpg",
    "textures/negx.jpg",
    "textures/posy.jpg",
    "textures/negy.jpg",
    "textures/posz.jpg",
    "textures/negz.jpg",
  ]);

  const textMap = new THREE.TextureLoader().load("textures/0_map.jpeg");
  const bumpMap = new THREE.TextureLoader().load("textures/0_Gelo.jpg");
  const displacementMap = new THREE.TextureLoader().load(
    "textures/0_bump_e_displace.jpeg"
  );
  // const envMap = new THREE.TextureLoader().load("textures/0_enviroment3.jpg");

  const materialPhong = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 33.78,
    emissive: 0x9ecdff,
    emissiveIntensity: 1.16,
    reflectivity: 1,
    map: textMap,
    bumpMap: bumpMap,
    bumpScale: 8.74,
    displacementMap: displacementMap,
    displacementScale: 0.4,
    side: 0,
    blending: 1,
    opacity: 0.74,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    envMap: envMap,
  });

  // const light = new THREE.DirectionalLight(0xffffff, 1);
  // light.position.set(5, 10, 0);

  // IMPORT THE GLTF MODEL:
  // from https://threejs.org/examples/#webgl_loader_gltf
  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load(SETTINGS.gltfModelURL, function (gltf) {
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        child.material = materialPhong;
        // child.material.envMap = envMap;

        elemento = child;
      }
    });
    gltf.scene.frustumCulled = false;

    // gltf.scene.add(light);

    // center and scale the object:
    const bbox = new THREE.Box3().expandByObject(gltf.scene);

    // center the model:
    const centerBBox = bbox.getCenter(new THREE.Vector3());
    gltf.scene.position.add(centerBBox.multiplyScalar(-1));
    gltf.scene.position.add(
      new THREE.Vector3(0, SETTINGS.offsetYZ[0], SETTINGS.offsetYZ[1])
    );

    // scale the model according to its width:
    const sizeX = bbox.getSize(new THREE.Vector3()).x;
    gltf.scene.scale.multiplyScalar(SETTINGS.scale / sizeX);

    // dispatch the model:
    threeStuffs.faceObject.add(gltf.scene);
  }); //end gltfLoader.load callback

  //CREATE THE CAMERA
  THREECAMERA = JeelizThreeHelper.create_camera();
} //end init_threeScene()

//entry point, launched by body.onload():
function main() {
  JeelizResizer.size_canvas({
    canvasId: "jeeFaceFilterCanvas",
    isFullScreen: true,
    callback: start,
    onResize: function () {
      JeelizThreeHelper.update_camera(THREECAMERA);
    },
  });
}

function start() {
  JEELIZFACEFILTER.init({
    videoSettings: {
      // increase the default video resolution since we are in full screen
      idealWidth: 1280, // ideal video width in pixels
      idealHeight: 800, // ideal video height in pixels
      maxWidth: 1920, // max video width in pixels
      maxHeight: 1920, // max video height in pixels
    },
    followZRot: true,
    canvasId: "jeeFaceFilterCanvas",
    NNCPath: "../../../neuralNets/", //root of NN_DEFAULT.json file
    callbackReady: function (errCode, spec) {
      if (errCode) {
        console.log("AN ERROR HAPPENS. SORRY BRO :( . ERR =", errCode);
        return;
      }

      console.log("INFO: JEELIZFACEFILTER IS READY");
      init_threeScene(spec);
    }, //end callbackReady()

    // called at each render iteration (drawing loop):
    callbackTrack: function (detectState) {
      JeelizThreeHelper.render(detectState, THREECAMERA);
    },
  }); //end JEELIZFACEFILTER.init call
} //end start()
