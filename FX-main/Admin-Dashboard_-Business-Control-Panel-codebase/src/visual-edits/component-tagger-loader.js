import { parse } from "@babel/parser";
import MagicString from "magic-string";
import { walk } from "estree-walker";
import path from "path";

/* ───────────────────────────────────────────── Blacklists */
const threeFiberElems = [
  "object3D", "audioListener", "positionalAudio", "mesh", "batchedMesh",
  "instancedMesh", "scene", "sprite", "lOD", "skinnedMesh", "skeleton",
  "bone", "lineSegments", "lineLoop", "points", "group", "camera",
  "perspectiveCamera", "orthographicCamera", "cubeCamera", "arrayCamera",
  "instancedBufferGeometry", "bufferGeometry", "boxBufferGeometry",
  "circleBufferGeometry", "coneBufferGeometry", "cylinderBufferGeometry",
  "dodecahedronBufferGeometry", "extrudeBufferGeometry",
  "icosahedronBufferGeometry", "latheBufferGeometry",
  "octahedronBufferGeometry", "planeBufferGeometry",
  "polyhedronBufferGeometry", "ringBufferGeometry",
  "shapeBufferGeometry", "sphereBufferGeometry",
  "tetrahedronBufferGeometry", "torusBufferGeometry",
  "torusKnotBufferGeometry", "tubeBufferGeometry",
  "wireframeGeometry", "tetrahedronGeometry", "octahedronGeometry",
  "icosahedronGeometry", "dodecahedronGeometry", "polyhedronGeometry",
  "tubeGeometry", "torusKnotGeometry", "torusGeometry", "sphereGeometry",
  "ringGeometry", "planeGeometry", "latheGeometry", "shapeGeometry",
  "extrudeGeometry", "edgesGeometry", "coneGeometry", "cylinderGeometry",
  "circleGeometry", "boxGeometry", "capsuleGeometry", "material",
  "shadowMaterial", "spriteMaterial", "rawShaderMaterial",
  "shaderMaterial", "pointsMaterial", "meshPhysicalMaterial",
  "meshStandardMaterial", "meshPhongMaterial", "meshToonMaterial",
  "meshNormalMaterial", "meshLambertMaterial", "meshDepthMaterial",
  "meshDistanceMaterial", "meshBasicMaterial", "meshMatcapMaterial",
  "lineDashedMaterial", "lineBasicMaterial", "primitive", "light",
  "spotLightShadow", "spotLight", "pointLight", "rectAreaLight",
  "hemisphereLight", "directionalLightShadow", "directionalLight",
  "ambientLight", "lightShadow", "ambientLightProbe",
  "hemisphereLightProbe", "lightProbe", "spotLightHelper",
  "skeletonHelper", "pointLightHelper", "hemisphereLightHelper",
  "gridHelper", "polarGridHelper", "directionalLightHelper",
  "cameraHelper", "boxHelper", "box3Helper", "planeHelper",
  "arrowHelper", "axesHelper", "texture", "videoTexture", "dataTexture",
  "dataTexture3D", "compressedTexture", "cubeTexture",
  "canvasTexture", "depthTexture", "raycaster", "vector2", "vector3",
  "vector4", "euler", "matrix3", "matrix4", "quaternion",
  "bufferAttribute", "float16BufferAttribute", "float32BufferAttribute",
  "float64BufferAttribute", "int8BufferAttribute", "int16BufferAttribute",
  "int32BufferAttribute", "uint8BufferAttribute", "uint16BufferAttribute",
  "uint32BufferAttribute", "instancedBufferAttribute", "color", "fog",
  "fogExp2", "shape", "colorShiftMaterial"
];

const dreiElems = [
  "AsciiRenderer", "Billboard", "Clone", "ComputedAttribute", "Decal",
  "Edges", "Effects", "GradientTexture", "MarchingCubes", "Outlines",
  "PositionalAudio", "Sampler", "ScreenSizer", "ScreenSpace", "Splat",
  "Svg", "Text", "Text3D", "Trail", "CubeCamera",
  "OrthographicCamera", "PerspectiveCamera", "CameraControls",
  "FaceControls", "KeyboardControls", "MotionPathControls",
  "PresentationControls", "ScrollControls", "DragControls",
  "GizmoHelper", "Grid", "Helper", "PivotControls",
  "TransformControls", "CubeTexture", "Fbx", "Gltf", "Ktx2",
  "Loader", "Progress", "ScreenVideoTexture", "Texture",
  "TrailTexture", "VideoTexture", "WebcamVideoTexture", "CycleRaycast",
  "DetectGPU", "Example", "FaceLandmarker", "Fbo", "Html", "Select",
  "SpriteAnimator", "StatsGl", "Stats", "Wireframe",
  "CurveModifier", "AdaptiveDpr", "AdaptiveEvents", "BakeShadows",
  "Bvh", "Detailed", "Instances", "Merged", "meshBounds",
  "PerformanceMonitor", "Points", "Preload", "Segments",
  "Fisheye", "Hud", "Mask", "MeshPortalMaterial", "RenderCubeTexture",
  "RenderTexture", "View", "MeshDiscardMaterial",
  "MeshDistortMaterial", "MeshReflectorMaterial",
  "MeshRefractionMaterial", "MeshTransmissionMaterial",
  "MeshWobbleMaterial", "PointMaterial", "shaderMaterial",
  "SoftShadows", "CatmullRomLine", "CubicBezierLine", "Facemesh",
  "Line", "Mesh", "QuadraticBezierLine", "RoundedBox",
  "ScreenQuad", "AccumulativeShadows", "Backdrop", "BBAnchor",
  "Bounds", "CameraShake", "Caustics", "Center", "Cloud",
  "ContactShadows", "Environment", "Float", "Lightformer",
  "MatcapTexture", "NormalTexture", "RandomizedLight", "Resize",
  "ShadowAlpha", "Shadow", "Sky", "Sparkles", "SpotLightShadow",
  "SpotLight", "Stage", "Stars", "OrbitControls"
];

const shouldTag = (name) =>
  !threeFiberElems.includes(name) && !dreiElems.includes(name);

/* ───────────────────────────────────────────── Loader */
export default function componentTagger(src, map) {
  const done = this.async();

  try {
    if (/node_modules/.test(this.resourcePath))
      return done(null, src, map);

    const ast = parse(src, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    const ms = new MagicString(src);
    const rel = path.relative(process.cwd(), this.resourcePath);
    let mutated = false;

    walk(ast, {
      enter(node, parent) {
        if (parent && !node.parent) {
          Object.defineProperty(node, "parent", {
            value: parent,
            enumerable: false,
          });
        }
      },
    });

    walk(ast, {
      enter(node) {
        if (node.type !== "JSXOpeningElement") return;

        const { line, column } = node.loc.start;
        const tagName =
          node.name.type === "JSXIdentifier" ? node.name.name : null;

        if (!tagName || !shouldTag(tagName)) return;

        const orchidsId = `${rel}:${line}:${column}`;

        ms.appendLeft(
          node.name.end,
          ` data-orchids-id="${orchidsId}" data-orchids-name="${tagName}"`
        );

        mutated = true;
      },
    });

    if (!mutated) return done(null, src, map);

    const out = ms.toString();
    const outMap = ms.generateMap({ hires: true });

    done(null, out, JSON.stringify(outMap));
  } catch (err) {
    done(err);
  }
}
