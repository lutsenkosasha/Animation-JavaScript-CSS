var canvas, ctx; 
      window.onload = function() {    // window.onliad получает значение функции. window.onliad срабатывает, когда загружено все содержимое страницы
        canvas = document.getElementById("canvas");   // в canvas возвращается ссылка на элемент с названием "canvas". canvas - холст
        ctx = canvas.getContext("2d");                // метод возвращает контекст рисования на холсте
        document.addEventListener("keydown", keyDownEvent);   // прослушиватель событий. При нажатии клавиши будет вызываться функция keyDownEvent

        // рендеринг X раз в секунду
        var x = 8;
        setInterval(draw, 1000 / x);      // установка интервала. Повторно вызывается функция draw с фиксированной временной задержкой (каждые 8 раз в секунду)
      };

      // игровой мир
      var gridSize = (tileSize = 20);     // размер сетки = 20 x 20 = 400
      var nextX = (nextY = 0);

      // змейка
      var defaultTailSize = 3;            // размер хвоста змеи по умолчанию
      var tailSize = defaultTailSize;     // размер хвоста = размеру хвоста по умолчанию
      var snakeTrail = [];                // змеиная тропа
      var snakeX = (snakeY = 10);         // координаты головы змеи

      // яблоки
      var appleX = (appleY = 15);         // координаты яблока

      // Рисовать
      function draw() {

        // движение змеи на следующие позиции
        snakeX += nextX;
        snakeY += nextY;

        // змея больше игрового мира?
        if (snakeX < 0) {
          snakeX = gridSize - 1;
        }
        if (snakeX > gridSize - 1) {       // если координата змеи по X равна или превышает размер игрового мира
          snakeX = 0;                      // то сбрасываем координату
        }
        if (snakeY < 0) {
          snakeY = gridSize - 1;
        }
        if (snakeY > gridSize - 1) {      // если координата змеи по Y равна или превышает размер игрового мира
          snakeY = 0;                     // то сбрасываем координату
        }

        // змея укусила яблоко?
        if (snakeX == appleX && snakeY == appleY) {   // если координаты змеи и яблока совпали, то
          tailSize++;                                 // увеличиваем длину хвоста 
          appleX = Math.floor(Math.random() * gridSize);    // создаем рандомные координаты для нового яблока
          appleY = Math.floor(Math.random() * gridSize);
        }
        // фон
        ctx.fillStyle = "#1C1D24";                          // цвет фона
        ctx.fillRect(0, 0, canvas.width, canvas.height);    // закрасить фон этим цветом

      // Закрашиваем змею
      // создаем градиентный цвет
      grd = ctx.createLinearGradient(0.000, 150.000, 300.000, 150.000);
      
      // добавление цветовых остановок
      grd.addColorStop(0.000, 'rgba(247, 149, 51, 1.000)');
      grd.addColorStop(0.151, 'rgba(243, 112, 85, 1.000)');
      grd.addColorStop(0.311, 'rgba(239, 78, 123, 1.000)');
      grd.addColorStop(0.462, 'rgba(161, 102, 171, 1.000)');
      grd.addColorStop(0.621, 'rgba(80, 115, 184, 1.000)');
      grd.addColorStop(0.748, 'rgba(16, 152, 173, 1.000)');
      grd.addColorStop(0.875, 'rgba(7, 179, 155, 1.000)');
      grd.addColorStop(1.000, 'rgba(111, 186, 130, 1.000)');
        ctx.fillStyle = grd;                             // передаем градиентный цвет в контекст
        for (var i = 0; i < snakeTrail.length; i++) {
          ctx.fillRect(                                 // рисует залитый прямоугольник по координатам x y
            snakeTrail[i].x * tileSize,                 // координата начальной точки прямоугольника по оси X
            snakeTrail[i].y * tileSize,                 // координата начальной точки прямоугольника по оси Y
            tileSize,                                   // ширина прямоугольника - размер хвоста
            tileSize                                    // высота прямоугольника - размер хвоста
          );
          // змея укусила себя за хвост?
          if (snakeTrail[i].x == snakeX && snakeTrail[i].y == snakeY) {   // если координаты змеиного пути совпали с координатами головы змеи
            tailSize = defaultTailSize;                                   // тогда мы проиграли, начинаем игру заново, длина хвоста по умолчанию равна 3
          }
        }
        // Закрашиваем яблоки
        ctx.fillStyle = grd;                            // передаем градиентный цвет в контекст
        ctx.fillRect(appleX * tileSize, appleY * tileSize, tileSize, tileSize);     // рисуем залитый прямоугольник по координатам x y

        // проложить змеиную тропу
        snakeTrail.push({ x: snakeX, y: snakeY });      // в змеиную тропу передаются координаты, где сейчас находится змея
        while (snakeTrail.length > tailSize) {          // пока длина змеиной тропы > размера хвоста
          snakeTrail.shift();                           // метод shift удаляет первый элемент из массива и возвращает этот удаленный элемент
        }
      }

      // управление
      function keyDownEvent(e) {    // Событие нажатия клавиши
        switch (e.keyCode) {
          case 37:        // стрелочка влево
            nextX = -1;   // изменение направления
            nextY = 0;
            break;
          case 38:        // стрелочка вверх
            nextX = 0;
            nextY = -1;
            break;
          case 39:        // стрелочка направо
            nextX = 1;
            nextY = 0;
            break;
          case 40:        // стрелочка вниз
            nextX = 0;
            nextY = 1;
            break;
        }
      }