"use strict";       // модель разработки, при которой ограничивается синтаксис 
console.clear();    // очищаем консоль
class Stage {       // класс "Этап"
    constructor() {

        // контейнер
        this.render = function () {                 // визуализация сцены
            this.renderer.render(this.scene, this.camera);
        };
        this.add = function (elem) {                // добавление элемента на сцену
            this.scene.add(elem);
        };      
        this.remove = function (elem) {             // удаление элемента со сцены
            this.scene.remove(elem);
        };
        this.container = document.getElementById('game');      // в контейнер возвращается ссылка на элемент с названием "game"

        // рендерер
        // cоздание средства визуализации WebGL
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,        // сглаживание
            alpha: false            // альфа
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);   // устанавливаем размеры окна браузера в рендерер
        this.renderer.setClearColor('#D0CBC7', 1);                      // устанавливаем чистый цвет и непрозрачность
        this.container.appendChild(this.renderer.domElement);           // добавляем узел "рендерер" в контейнер
        this.scene = new THREE.Scene();                                 // создание пустой сцены

        // камера
        let aspect = window.innerWidth / window.innerHeight;            // соотношение сторон
        let d = 20;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, -100, 1000);     // указываем расположение камеры. У такой камеры нет перспективы.
                                                    // 1 параметр - слева, 2 параметр - справа, 3 параметр - сверху, 4 параметр - снизу, 5 параметр - близко, 6 параметр - далеко
                                                    // т.е. камера снимает расстояние от -100 до 1000
        // перемещение камеры по осям
        this.camera.position.x = 2;
        this.camera.position.y = 2;
        this.camera.position.z = 2;
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));     // направляем камеру на созданный трехмерный вектор (создан по 3-м точкам)

        // свет
        this.light = new THREE.DirectionalLight(0xffffff, 0.5);       // создаем направленный свет. 1 параметр - цвет - белый, 2 параметр - интенсивность
        this.light.position.set(0, 499, 0);                           // располагаем свет по 3-м точкам
        this.scene.add(this.light);                                   // добавляем свет на сцену
        this.softLight = new THREE.AmbientLight(0xffffff, 0.4);       // создаем окружающий свет - одинаково освещает все эл-ты на сцене. 1 параметр - цвет - белый, 2 параметр - интенсивность
        this.scene.add(this.softLight);                               // добавляем свет на сцену
        window.addEventListener('resize', () => this.onResize());     // прослушиватель событий. При изменении размеров будет вызываться функция onResize
        this.onResize();
    }
    setCamera(y, speed = 0.3) {                         // установка камеры
        TweenLite.to(this.camera.position, speed, { y: y + 4, ease: Power1.easeInOut });          // анимируем камеру, задаем ей скорость и плавность
        TweenLite.to(this.camera.lookAt, speed, { y: y, ease: Power1.easeInOut });                // анимируем место, на которое смотрит камера, задаем ей скорость и плавность
    }
    onResize() {
        let viewSize = 30;              // размер просмотра
        this.renderer.setSize(window.innerWidth, window.innerHeight);       // в рендерер устанавливаем новые размеры окна браузера

        // изменение соотношения сторон со всех ракурсов камеры
        this.camera.left = window.innerWidth / -viewSize;               
        this.camera.right = window.innerWidth / viewSize;
        this.camera.top = window.innerHeight / viewSize;
        this.camera.bottom = window.innerHeight / -viewSize;

        this.camera.updateProjectionMatrix();                               // обновляем проекционную матрицу
    }
}
class Block {
    constructor(block) {

        // устанавливаем размеры и позицию
        this.STATES = { ACTIVE: 'active', STOPPED: 'stopped', MISSED: 'missed' };       // состояния: активный, остановленный, пропущенный
        this.MOVE_AMOUNT = 12;          // сумма перемещений
        this.dimension = { width: 0, height: 0, depth: 0 };     // измерение: ширина 0, высота 0, глубина 0
        this.position = { x: 0, y: 0, z: 0 };                   // позиция по 3-м точкам: 0 0 0 
        this.targetBlock = block;                               // целевой блок
        this.index = (this.targetBlock ? this.targetBlock.index : 0) + 1;
        this.workingPlane = this.index % 2 ? 'x' : 'z';         // рабочая плоскость: либо ось X, либо ось Z
        this.workingDimension = this.index % 2 ? 'width' : 'depth';     // рабочий размер: либо ширина, либо глубина
        
        // установка размеров из целевого блока или значениями по умолчанию
        this.dimension.width = this.targetBlock ? this.targetBlock.dimension.width : 10;
        this.dimension.height = this.targetBlock ? this.targetBlock.dimension.height : 2;
        this.dimension.depth = this.targetBlock ? this.targetBlock.dimension.depth : 10;

        // установка позиций из целевого блока или значениями по умолчанию
        this.position.x = this.targetBlock ? this.targetBlock.position.x : 0;
        this.position.y = this.dimension.height * this.index;
        this.position.z = this.targetBlock ? this.targetBlock.position.z : 0;
        this.colorOffset = this.targetBlock ? this.targetBlock.colorOffset : Math.round(Math.random() * 100);

        // установка цвета
        if (!this.targetBlock) {
            this.color = 0x333344;
        }
        else {
            let offset = this.index + this.colorOffset;     // смещение
            var r = Math.sin(0.3 * offset) * 55 + 200;
            var g = Math.sin(0.3 * offset + 2) * 55 + 200;
            var b = Math.sin(0.3 * offset + 4) * 55 + 200;
            this.color = new THREE.Color(r / 255, g / 255, b / 255);    // установка цвета блока
        }

        // состояние
        this.state = this.index > 1 ? this.STATES.ACTIVE : this.STATES.STOPPED;

        // установка направления
        this.speed = -0.1 - (this.index * 0.005);       // скорость
        if (this.speed < -4)
            this.speed = -4;
        this.direction = this.speed;

        // Создание блока
        let geometry = new THREE.BoxGeometry(this.dimension.width, this.dimension.height, this.dimension.depth);          // создаем куб с шириной, высотой и глубиной dimension
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(this.dimension.width / 2, this.dimension.height / 2, this.dimension.depth / 2));       // создание матрицы размерами в 2 раза меньше dimension
        this.material = new THREE.MeshToonMaterial({ color: this.color, shading: THREE.FlatShading });          // создание материала
        this.mesh = new THREE.Mesh(geometry, this.material);            // создание треугольной сетки. 1 параметр - наш объект, 2 параметр - материал
        this.mesh.position.set(this.position.x, this.position.y + (this.state == this.STATES.ACTIVE ? 0 : 0), this.position.z);      // установка расположения сетки по 3-м точкам
        if (this.state == this.STATES.ACTIVE) {
            this.position[this.workingPlane] = Math.random() > 0.5 ? -this.MOVE_AMOUNT : this.MOVE_AMOUNT;
        }
    }
    reverseDirection() {    // обратное направление
        this.direction = this.direction > 0 ? this.speed : Math.abs(this.speed);
    }
    place() {               // место
        this.state = this.STATES.STOPPED;       // состояние становится остановленным
        let overlap = this.targetBlock.dimension[this.workingDimension] - Math.abs(this.position[this.workingPlane] - this.targetBlock.position[this.workingPlane]);      // перекрытие
        let blocksToReturn = {          // блоки для возврата
            plane: this.workingPlane,   // плоскость
            direction: this.direction   // направление
        };
        if (this.dimension[this.workingDimension] - overlap < 0.3) {
            overlap = this.dimension[this.workingDimension];
            blocksToReturn.bonus = true;
            this.position.x = this.targetBlock.position.x;      // присваивается позиция целевого блока по оси X
            this.position.z = this.targetBlock.position.z;      // присваивается позиция целевого блока по оси Z
            this.dimension.width = this.targetBlock.dimension.width;        // присваивается измерение высоты целевого блока
            this.dimension.depth = this.targetBlock.dimension.depth;        // присваивается измерение глубины целевого блока
        }
        if (overlap > 0) {  // если перекрытие > 0
            let choppedDimensions = { width: this.dimension.width, height: this.dimension.height, depth: this.dimension.depth };    // нарезанные размеры. присваивается ширина, высота и глубина dimension
            choppedDimensions[this.workingDimension] -= overlap;        // из нарезанных размеров вычитается перекрытие
            this.dimension[this.workingDimension] = overlap;
            let placedGeometry = new THREE.BoxGeometry(this.dimension.width, this.dimension.height, this.dimension.depth);      // размещенная геометрия. создаем куб с шириной, высотой и глубиной dimension
            placedGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(this.dimension.width / 2, this.dimension.height / 2, this.dimension.depth / 2));     // создание матрицы размерами в 2 раза меньше dimension
            let placedMesh = new THREE.Mesh(placedGeometry, this.material);       // размещенная сетка. 1 параметр - объект - наш куб, 2 параметр - материал
            let choppedGeometry = new THREE.BoxGeometry(choppedDimensions.width, choppedDimensions.height, choppedDimensions.depth);    // нарезанная геометрия. создаем куб с шириной, высотой и глубиной нарезанных размеров
            choppedGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(choppedDimensions.width / 2, choppedDimensions.height / 2, choppedDimensions.depth / 2));   // создание матрицы размерами в 2 раза меньше нарезанных размеров
            let choppedMesh = new THREE.Mesh(choppedGeometry, this.material);    // нарезанная сетка, 1 параметр - нарезанный куб, 2 параметр - материал
            let choppedPosition = {         // меняем нарезанные позиции
                x: this.position.x,
                y: this.position.y,
                z: this.position.z
            };
            if (this.position[this.workingPlane] < this.targetBlock.position[this.workingPlane]) {      // если позиция нашей рабочей области < позиции целевого блока, то обновляем позицию рабочей области
                this.position[this.workingPlane] = this.targetBlock.position[this.workingPlane];
            }
            else {                      // иначе в нарезанные позиции добавляем перекрытие
                choppedPosition[this.workingPlane] += overlap;
            }
            placedMesh.position.set(this.position.x, this.position.y, this.position.z);             // меняем позиции размещенной сетки
            choppedMesh.position.set(choppedPosition.x, choppedPosition.y, choppedPosition.z);      // меняем позиции нарезанной сетки
            blocksToReturn.placed = placedMesh;
            if (!blocksToReturn.bonus)
                blocksToReturn.chopped = choppedMesh;
        }
        else {      // иначе меняем состояние на "пропущенный"
            this.state = this.STATES.MISSED;
        }
        this.dimension[this.workingDimension] = overlap;        // в измерение присваиваем перекрытие
        return blocksToReturn;                                  // возвращаем блоки для возврата
    }
    tick() {
        if (this.state == this.STATES.ACTIVE) {                            // если состояние "активный"
            let value = this.position[this.workingPlane];                  // в value записывается позиция рабочей области
            if (value > this.MOVE_AMOUNT || value < -this.MOVE_AMOUNT)    // если value не вышел за границы
                this.reverseDirection();                                  // тогда будем двигать блок в обратном направлении
            this.position[this.workingPlane] += this.direction;
            this.mesh.position[this.workingPlane] = this.position[this.workingPlane];
        }
    }
}
class Game {            // класс игра
    constructor() {
        this.STATES = {                 // состояния
            'LOADING': 'loading',       // загрузка
            'PLAYING': 'playing',       // играть
            'READY': 'ready',           // готов
            'ENDED': 'ended',           // закончился
            'RESETTING': 'resetting'    // сброс настроек
        };
        this.blocks = [];
        this.state = this.STATES.LOADING;   // изначальное состояние - загрузка
        this.stage = new Stage();           // создаем экземпляр класса "Этап"
        this.mainContainer = document.getElementById('container');      // в главный контейнер возвращается ссылка на элемент с названием "container"
        this.scoreContainer = document.getElementById('score');         // в контейнер со счётом возвращается ссылка на элемент с названием "score"
        this.startButton = document.getElementById('start-button');     // в переменную "кнопка старта" возвращается ссылка на элемент с названием "start-button"
        this.instructions = document.getElementById('instructions');    // в переменную "инструкции" возвращается ссылка на элемент с названием "instructions"
        this.scoreContainer.innerHTML = '0';                            // устанавливает новое значение HTML для этого элемента
        this.newBlocks = new THREE.Group();                             // создаем группу новых блоков
        this.placedBlocks = new THREE.Group();                          // создаем группу размещенных блоков
        this.choppedBlocks = new THREE.Group();                         // создаем группу нарезанных блоков

        // добавляем все блоки в наш этап
        this.stage.add(this.newBlocks);
        this.stage.add(this.placedBlocks);
        this.stage.add(this.choppedBlocks);

        // вызываем функцию "добавить блок"
        this.addBlock();
        // вызываем функцию "тик"
        this.tick();
        // обновляем наш этап и меняем ему состояние на "готов"
        this.updateState(this.STATES.READY);

        // прослушиватели событий
        document.addEventListener('keydown', e => {         // нажатие клавиши
            if (e.keyCode == 32)                            // если это пробел, то
                this.onAction();                            // вызов функции "по действию"
        });
        document.addEventListener('click', e => {           // клик мыши
            this.onAction();                                // вызов функции "по действию"
        });
        document.addEventListener('touchstart', e => {      // тап по экрану
            e.preventDefault();                             // метод предотвращения по умолчанию
        });
    }
    updateState(newState) {     // обновление состояния
        for (let key in this.STATES)
            this.mainContainer.classList.remove(this.STATES[key]);      // из нашего главного контейнера удаляется состояние по ключу
        this.mainContainer.classList.add(newState);                     // а затем добавляется новое состояние
        this.state = newState;                                          // новое состояние становится текущим состоянием
    }
    onAction() {                // "По действию"
        switch (this.state) {
            case this.STATES.READY:     // если состояние "готов"
                this.startGame();       // вызов функции "начать игру"
                break;  
            case this.STATES.PLAYING:   // если состояние "играть"
                this.placeBlock();      // вызов функции "разместить блок"
                break;
            case this.STATES.ENDED:     // если состояние "закончился"
                this.restartGame();     // вызов функции "перезапустить игру"
                break;
        }
    }
    startGame() {       // начать игру
        if (this.state != this.STATES.PLAYING) {       // если наше состояние не "играющий" (мы еще не играем)
            this.scoreContainer.innerHTML = '0';       // тогда в контейнер счёта устанавливаем новое значение HTML
            this.updateState(this.STATES.PLAYING);     // вызываем функцию "обновления состояния" и передаём туда состояние "играем"
            this.addBlock();                            // вызываем функцию "добавить блок"
        }
    }
    restartGame() {      // перезапустить игру
        this.updateState(this.STATES.RESETTING);        // обновляем состояние и передаем туда состояние "сброс настроек"
        let oldBlocks = this.placedBlocks.children;     // в переменную "старые блоки" присваиваем размещенные блоки
        let removeSpeed = 0.2;                          // скорость удаления
        let delayAmount = 0.02;                         // сумма задержки
        for (let i = 0; i < oldBlocks.length; i++) {    // плавное, но быстрое удаление блоков
            TweenLite.to(oldBlocks[i].scale, removeSpeed, { x: 0, y: 0, z: 0, delay: (oldBlocks.length - i) * delayAmount, ease: Power1.easeIn, onComplete: () => this.placedBlocks.remove(oldBlocks[i]) });
            TweenLite.to(oldBlocks[i].rotation, removeSpeed, { y: 0.5, delay: (oldBlocks.length - i) * delayAmount, ease: Power1.easeIn });
        }
        let cameraMoveSpeed = removeSpeed * 2 + (oldBlocks.length * delayAmount);   // скорость перемещения камеры
        this.stage.setCamera(2, cameraMoveSpeed);                                   // перемещаем камеру в новое место
        let countdown = { value: this.blocks.length - 1 };                          // обратный отсчет
        TweenLite.to(countdown, cameraMoveSpeed, { value: 0, onUpdate: () => { this.scoreContainer.innerHTML = String(Math.round(countdown.value)); } });      // анимируем удаление
        this.blocks = this.blocks.slice(0, 1);
        setTimeout(() => {              // установка времени ожидания
            this.startGame();           // начинаем игру
        }, cameraMoveSpeed * 1000);     // быстро перемещаем камеру
    }
    placeBlock() {          // разместить блок
        let currentBlock = this.blocks[this.blocks.length - 1];     // текущий блок, принимает позицию "кол-во всех блоков-1"
        let newBlocks = currentBlock.place();                       // новый блок, принимает позицию текущего блока
        this.newBlocks.remove(currentBlock.mesh);                   // в новом блоке удаляем сетку текущего блока
        if (newBlocks.placed)               // если новый блок размещен
            this.placedBlocks.add(newBlocks.placed);    // тогда добавляем новый блок в "размещенные блоки"
        if (newBlocks.chopped) {            // если новый блок нарезан
            this.choppedBlocks.add(newBlocks.chopped);  // тогда добавляем новый блок в "нарезанные блоки"
            let positionParams = { y: '-=30', ease: Power1.easeIn, onComplete: () => this.choppedBlocks.remove(newBlocks.chopped) };        // параметры положения
            let rotateRandomness = 10;      // перемещать случайно
            let rotationParams = {          // параметры перемещения
                delay: 0.05,                // задержка
                // обновляем координаты точек
                x: newBlocks.plane == 'z' ? ((Math.random() * rotateRandomness) - (rotateRandomness / 2)) : 0.1,
                z: newBlocks.plane == 'x' ? ((Math.random() * rotateRandomness) - (rotateRandomness / 2)) : 0.1,
                y: Math.random() * 0.1,
            };
            // есои позиция нарезанного нового блока на нашей плоскости больше позиции размещенного нового блока на нашей плоскости
            if (newBlocks.chopped.position[newBlocks.plane] > newBlocks.placed.position[newBlocks.plane]) {
                positionParams[newBlocks.plane] = '+=' + (40 * Math.abs(newBlocks.direction));          // то меняем параметры положения
            }
            else {
                positionParams[newBlocks.plane] = '-=' + (40 * Math.abs(newBlocks.direction));          // иначе меняем параметры положения
            }
            TweenLite.to(newBlocks.chopped.position, 1, positionParams);                                // анимируем нарезание нового блока
            TweenLite.to(newBlocks.chopped.rotation, 1, rotationParams);                                // анимируем нарезание нового блока
        }
        this.addBlock();            // добавляем новый блок
    }
    addBlock() {        // добавление нового блока
        let lastBlock = this.blocks[this.blocks.length - 1];        // последний блок
        if (lastBlock && lastBlock.state == lastBlock.STATES.MISSED) {      // если последний блок существует и его состояние "пропущенный"
            return this.endGame();                                          // то вызывается функция "конец игры"
        }
        this.scoreContainer.innerHTML = String(this.blocks.length - 1);     // в контейнер счёта очков заполняется кол-во блоков (сколько игрок набрал очков)
        let newKidOnTheBlock = new Block(lastBlock);
        this.newBlocks.add(newKidOnTheBlock.mesh);              // в новые блоки добавляется сетка нового потомка 
        this.blocks.push(newKidOnTheBlock);
        this.stage.setCamera(this.blocks.length * 2);           // установка камеры в новое положение
        if (this.blocks.length >= 5)                            // если кол-во блоков >=5
            this.instructions.classList.add('hide');            // то инструкция прячется
    }
    endGame() {     // конец игры
        this.updateState(this.STATES.ENDED);        // обновляем состояние и передаем в функцию "завершен"
    }
    tick() {        // тик
        this.blocks[this.blocks.length - 1].tick();         // создание тика
        this.stage.render();                                // запуск рендера
        requestAnimationFrame(() => { this.tick(); });     // запрос анимационного кадра
    }
}
let game = new Game();                                     // экземпляр класса "игра"