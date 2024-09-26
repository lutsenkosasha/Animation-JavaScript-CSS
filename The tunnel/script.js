// Получение размеров окна
const canvas = document.querySelector('canvas');    /* возвращает первый элемент в документе с названием 'canvas' , сохраняется в константную (неизменяемую) переменную canvas */

canvas.width = window.innerWidth,     /* устанавливаем ширину canvas, равную ширине окна браузера */
canvas.height = window.innerHeight;   /* устанавливаем высоту canvas, равную высоте окна браузера */

// Создание средства визуализации WebGL
const renderer = new THREE.WebGLRenderer({ canvas });   /* создаем рендерер, его задача: отрисовать на canvas то, что камера видит на сцене */

renderer.setSize(canvas.width, canvas.height);          /* обновляем размер рисунка рендерера */

// Создание пустой сцены
const scene = new THREE.Scene();

// Создание перспективной камеры
const camera = new THREE.PerspectiveCamera(65, canvas.width / canvas.height, 0.001, 1000);    /* первый параметр - угол обзора камеры = 65 градусов
                                                                                                второй параметр - соотношение сторон
                                                                                                третий параметр - минимальное расстояние от камеры, на которой отображается сцена
                                                                                                четвертый - максимальное расстояние, на котором мы видим сцену с позиции камеры */
camera.position.z = 400;                      /* смещение камеры по оси Z (глубина) */

const ambient = new THREE.AmbientLight(0xffffff, 0.75);       /* окружающий свет. первый параметр - цвет - белый, второй параметр - интенсивность */
scene.add(ambient);         /* добавляем на сцену свет */

// Двумерный массив (матрица) точек
const points = [
  [68.5,185.5],
  [1,262.5],
  [270.9,281.9],
  [345.5,212.8],
  [178,155.7],
  [240.3,72.3],
  [153.4,0.6],
  [52.6,53.3],
  [68.5,185.5]
];

// Преобразуем массив точек в вершины
for (let i = 0; i < points.length; i++) {
  const x = points[i][0],
        y = 0,
        z = points[i][1];

  points[i] = new THREE.Vector3(x, y, z);     /* создаем новый трехмерный вектор по координатам x,y,z, которые получили из матрицы точек*/
}

// Создание контура из точек
const path = new THREE.CatmullRomCurve3(points);    /* создание 3D кривой по точкам из массива */

// Создание геометрии трубы на основе контура (вытягивается по этой кривой)
const geometry = new THREE.TubeGeometry(path, 600, 8, 32, true);    /* 1 параметр - наша кривая; 2 параметр - число сегментов, из которых состоит труба; 3 параметр - радиус трубы; */ 
                                                                    /* 4 параметр - число сегментов, из которых состоит поперечное сечение; 5 параметр - наша труба замкнутая (закрытая) */

// Установка другого цвета на каждой грани трубы
for (let i = 0, j = geometry.faces.length; i < j; i++) {
  geometry.faces[i].color = new THREE.Color("hsl("+Math.floor((Math.random()*20)+200)+", 60%, 60%)");     /* рандомно выбираются приятные цвета */
}

// Основной материал
const material = new THREE.MeshLambertMaterial({      /* сетчатый материал для неблестящих поверхностей */
  side: THREE.BackSide,
  vertexColors: THREE.FaceColors        /* Сообщаем библиотеке Three.js, что цвета исходят из граней  */
});

// Создание треугольной сетки
const tube = new THREE.Mesh(geometry, material);    // первый параметр - наша труба, второй параметр - материал

// Добавление трубы в сцену
scene.add(tube);

// Создание точечного источника света (исхоит из одной точки во всех направлениях) в нашей сцене
const light = new THREE.PointLight(0xffffff, 1, 100);   // 1 параметр - цвет - белый, 2 параметр - максимальная дальность действия света,
                                                        // 3 параметр - величина, на которую свет тускнеет с увеличением расстояния до источника света
scene.add(light);           // добавляем точечный свет на сцену

let percentage = 0;

// Функция рендеринга
function render() {
  percentage += 0.00025;  // Скорость

  const p1 = path.getPointAt(percentage % 1),           // получаем новые точки в процентах
        p2 = path.getPointAt((percentage + 0.03) % 1);

  camera.position.set(p1.x, p1.y, p1.z);              // перемещаем камеру на новую точку p1
  camera.lookAt(p2);                                  // направляем камеру на точку p2

  light.position.set(p2.x, p2.y, p2.z);               // устанавливаем точечный свет на точку p2

  // Визуализация сцены
  renderer.render(scene, camera);                     // запускаем наш рендер

  requestAnimationFrame(render);                      // запрос анимационного кадра
}

requestAnimationFrame(render);                      // запрос анимационного кадра

// Функция "при изменении окна"
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;       // меняем у камеры соотношение сторон под размер окна браузера
  camera.updateProjectionMatrix();                              // обновляем проекционную матрицу

  renderer.setSize(window.innerWidth, window.innerHeight);      // устанавливаем размеры окна браузера для рендерера
}

window.addEventListener('resize', onWindowResize, false);       // прослушиватель событий
                                                                // 1 параметр - тип события (изменение размеров), 2 параметр - объект, который получает уведомление
                                                                // 3 параметр - значит, что уведомление отправляется сначала 2 параметру, а потом становится доступным всем объектам