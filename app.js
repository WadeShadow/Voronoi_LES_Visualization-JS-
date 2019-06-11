var voronoi = require("voronoi-diagram");

const SITE_NUM = 400;
const DIM = 3;
const CONTAINER_SIZE = 1;

var sites = new Array(SITE_NUM)
for (var i = 0; i < SITE_NUM; ++i) {
    var p = new Array(DIM)
    for (var j = 0; j < DIM; ++j) {
        p[j] = (2 * CONTAINER_SIZE) * Math.random() - CONTAINER_SIZE;
    }
    sites[i] = p;
}

var voronoi = voronoi(sites);

function euclideanDis(x, y) {
    // let dim = x.length;

    // if (dim !== y.length)
    // throw new Error('Your points do not correspond to each other');

    // let sumArr = x.map((xElement, index) => {
    //     return (xElement - y[index]) * (xElement - y[index]);
    // });

    return Math.sqrt((x[0] - y[0]) * (x[0] - y[0]) + (x[1] - y[1]) * (x[1] - y[1]) + (x[2] - y[2]) * (x[2] - y[2]));
}

function isOutsideContainer(point, radius) {
    return point.some((coordinat) => {
        return (coordinat + radius > CONTAINER_SIZE) || (coordinat - radius < -CONTAINER_SIZE);
    });
}

var {
    positions
} = voronoi;

var distances = positions.map((point) => {
    let dists = sites.map((site) => {
        return euclideanDis(site, point);
    });

    return dists.reduce((acc, value) => value < acc ? value : acc);
});


var sphereInfo = distances.reduce((acc, distance, index) => {
    if (isOutsideContainer(positions[index], distance))
        return acc;
    if(acc===-1)
        return index;
    return distances[acc] > distance ? acc : index;
}, -1);

var sphere = {
    center: positions[sphereInfo],
    radius: distances[sphereInfo]
};

console.log(sphere.radius);

/**
 * Three.js realization of animation
 */

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x333333);

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 50);
camera.position.set(0, 0, 6);

var scene = new THREE.Scene();

var controls = new THREE.OrbitControls(camera, renderer.domElement);

var lights = [];
lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

lights[ 0 ].position.set( 0, 200, 0 );
lights[ 1 ].position.set( 100, 200, 100 );
lights[ 2 ].position.set( - 100, - 200, - 100 );

scene.add( lights[ 0 ] );
scene.add( lights[ 1 ] );
scene.add( lights[ 2 ] );


// var light = new THREE.AmbientLight(0xffffff);
// scene.add(light);
var material = new THREE.MeshStandardMaterial({
    color: 0xbeff6c,
    roughness: 0.67,
    emissive:0x223a26,
    metalness: 1
});
var geometry = new THREE.SphereGeometry(0.025, 20, 20);

sites.forEach(site => {

    // let material = new THREE.MeshBasicMaterial({
    //     color: 0x4ff9b3,
    //     vertexColors: THREE.FaceColors
    // });

    // for (let face of geometry.faces) {
    //     face.color.setRGB((Math.random()+3)/4, Math.random(), (Math.random()+3)/4);
    // }

    let mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = site[0];
    mesh.position.y = site[1];
    mesh.position.z = site[2];

    scene.add(mesh);
});

material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    roughness: 0.26,
    // transparent: true,
    // opacity: 0.9,
    emissive:0xa50000,
    metalness: 1
});
geometry = new THREE.SphereGeometry(0.01, 20, 20);

positions.forEach(site => {

    // let material = new THREE.MeshBasicMaterial({
    //     color: 0xff0000,
    //     vertexColors: THREE.FaceColors
    // });

    // for (let face of geometry.faces) {
    //     face.color.setRGB(Math.random(), Math.random(), Math.random());
    // }

    let mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = site[0];
    mesh.position.y = site[1];
    mesh.position.z = site[2];

    scene.add(mesh);
});

geometry = new THREE.SphereGeometry(sphere.radius, 50, 50);

// let material = new THREE.MeshBasicMaterial({
//     color: 0xffffff,
//     vertexColors: THREE.FaceColors
// });

// for (let face of geometry.faces) {
//     face.color.setRGB((Math.random()+3)/4, (Math.random()+3)/4, 1);
// }

material = new THREE.MeshStandardMaterial({
    color: 0x2194ce,
    wireframe: true,
    emissive:0x3d5c72,
    wireframeLinewidth: 10,
    roughness: 0.67,
    metalness: 1
});


var mesh = new THREE.Mesh(geometry, material);

mesh.position.x = sphere.center[0];
mesh.position.y = sphere.center[1];
mesh.position.z = sphere.center[2];


scene.add(mesh);

function animate() {
    mesh.rotation.x += 0.001;

    // camera.position.set(cam.positionX, cam.positionY, cam.positionZ);
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}
animate();


// console.log(sites);
// console.log("\n=====================================\n");
// console.log(positions);
// console.log("\n=====================================\n");
// console.log(sphere);

{
    /* voronoi.cells.forEach(function (cell) {
        if (cell.indexOf(-1) >= 0) {
            return
        }

        var vpoints = cell.map(function (v) {
            return voronoi.positions[v];
        });

        var hull = ch(vpoints);


        //Find center of mass
        var center = [0, 0, 0]
        for (var i = 0; i < vpoints.length; ++i) {
            for (var j = 0; j < 3; ++j) {
                if (vpoints[i][j] < -1 || vpoints[i][j] > 1) {
                    return
                }
                center[j] += vpoints[i][j]
            }
        }
        for (var j = 0; j < 3; ++j) {
            center[j] /= vpoints.length
        }

        //Rescale points
        var offset = points.length;
        var color = [ Math.random(), Math.random(), Math.random() ]
        for(var i=0; i<vpoints.length; ++i) {
            colors.push(color.slice());
        }
        points.push.apply(points, vpoints);

          //Append cells
        cells.push.apply(cells, hull.map(function(f) {
            return f.map(function(v) {
                return v + offset
            })
        }));

        console.log(vpoints);


    }); */
}