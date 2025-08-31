const today_date = new Date();
let date_counter = 0;

// Функция валидации формата даты дд.мм.гггг
function isValidDateFormat(dateString) {
  if (!dateString || dateString.trim() === '') {
    return true; // Пустая дата допустима
  }
  
  // Проверяем формат дд.мм.гггг
  const dateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  const match = dateString.match(dateRegex);
  
  if (!match) {
    return false; // Формат не соответствует дд.мм.гггг
  }
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  
  // Проверяем диапазоны
  if (day < 1 || day > 31) {
    return false;
  }
  
  if (month < 1 || month > 12) {
    return false;
  }
  
  if (year < 1900 || year > 2100) {
    return false;
  }
  
  // Дополнительная проверка - создаем дату и проверяем, что она валидна
  try {
    const testDate = new Date(year, month - 1, day);
    if (testDate.getFullYear() !== year || testDate.getMonth() !== month - 1 || testDate.getDate() !== day) {
      return false;
    }
  } catch (error) {
    return false;
  }
  return true;
}
let json_data;
let json_lessons;
let list_of_all_students;
let json_color_style;

let types_of_lessons_symbols = [
  '<i class="fa-regular fa-question fa-2xl"></i>', // 1 Вопрос (Знак вопроса)
  '<i class="fa-regular fa-square fa-2xl"></i>', // 2 Запланированное (Пустой квадрат)
  '<i class="fa-regular fa-square-check fa-2xl"></i>', // 3 Проведенное (Галочка)
  '<i class="fa-regular fa-rectangle-xmark fa-2xl"></i>', // 4 Отмененное (Крестик)
  '<i class="fa-regular fa-share-from-square fa-2xl"></i>', // 5 Перенос (Стрелочка закрученная)
  '<i class="fa-sharp fa-solid fa-person-chalkboard fa-2xl"></i>', // 6 Вводное бесплатное (Круг)
  '<i class="fa-regular fa-heart fa-2xl"></i>', // 7 Бесплатное, подарок (Сердечко)
  '<i class="fa-regular fa-circle-question fa-2xl"></i>', // 8 Напоминание об уточнении, комментарий обязателен (Вопрос)
  '<i class="fa-regular fa-lightbulb fa-2xl"></i>', // 9 Напоминание об оплате (Лампочка)
  '<i class="fa-regular fa-money-bill-1 fa-2xl"></i>' // 10 Оплата от студента занятий (Купюра денег)
]
let types_of_lessons_names = [
  'Not selected', // 1 Вопрос (Знак вопроса)
  'Scheduled', // 2 Запланированное (Пустой квадрат)
  'Done', // 3 Проведенное (Галочка)
  'Cancelled', // 4 Отмененное (Крестик)
  'Postponed', // 5 Перенос (Стрелочка закрученная)
  'Intro free', // 6 Вводное бесплатное (Круг)
  'Free, gift', // 7 Бесплатное, подарок (Сердечко)
  'Note', // 8 Напоминание об уточнении, комментарий обязателен (Вопрос)
  'Payment notification', // 9 Напоминание об оплате (Лампочка)
  'Payment recieve' // 10 Оплата от студента занятий (Купюра денег)
]
let name_of_month_en_full = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
]
let name_of_week_en = [
  "Sun",
  "Mon",
  "Tues",
  "Wed",
  "Thurs",
  "Fri",
  "Sat"
]
let name_of_week_en_full = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
]
let password = '';
let link_bd = '';
let link_lessons = '';
let link_style = '';
let backup_db = '';
let link_status = '';

// Проверка пароля клавишей Enter (отключена для новой системы авторизации)
// document.getElementById("password_input").addEventListener("keypress", function (event) {
//   // If the user presses the "Enter" key on the keyboard
//   if (event.key === "Enter") {
//     // Cancel the default action, if needed
//     event.preventDefault();
//     // Trigger the button element with a click
//     password_check();
//   }
// });

function loading_animation() {

  document.getElementById("calendar").innerHTML = ''
    + '<div id="spinner" class="d-flex justify-content-center">'
    + '<img width="100vw" height="100vh" src="././img/blossom.gif"/>'
    + '</div></div>'

}

function modal_loading_animation() {

  document.getElementById("ModalBody").innerHTML = ""
    + '<div id="spinner" class="d-flex justify-content-center">'
    + '<img width="100vw" height="100vh" src="././img/blossom.gif"/>'
    + '</div></div>'

}

// Функция проверки пароля (отключена для новой системы авторизации)
function password_check() {
  console.warn('password_check() is deprecated. Use new authentication system instead.');
  
  // Эта функция больше не используется, но оставляем для совместимости
  // password = document.getElementById("password_input").value;

  // loading_animation();

  // link_bd = "https://" + password + ".onrender.com/students";
  // link_lessons = "https://" + password + ".onrender.com/lessons";
  // link_style = "https://" + password + ".onrender.com/style";
  // backup_db = "https://" + password + ".onrender.com/db";
  // link_status = "https://" + password + ".onrender.com/status";

  // Start_onload();
  // funct_check_status();

  // Hide the login background after successful login
  // document.querySelector('.login-background').style.display = 'none';
}



//Получение данных
function Start_onload() {

  number_day_of_calendar = today_date.getDate();
  number_day_of_week = today_date.getDay();
  number_month_of_calendar = today_date.getMonth() + 1;
  number_year_of_calendar = today_date.getFullYear();

  if (number_day_of_calendar < 10) {
    number_day_of_calendar = "0" + number_day_of_calendar
  }

  if (number_month_of_calendar < 10) {
    number_month_of_calendar = "0" + number_month_of_calendar
  }

  today_date.setMonth(today_date.getMonth());

  let date_1 = new Date().getMonth() + 1 + '.' + new Date().getFullYear();
  let date_2 = today_date.getMonth() + 1 + '.' + today_date.getFullYear();

  //Получение данных за выбранный месяц после проверки текущий месяц или нет
  if (date_1 === date_2) {
    today_date.setDate(new Date().getDate());
    number_day_of_calendar = new Date().getDate()
    number_day_of_week = new Date().getDay();
    number_month_of_calendar = new Date().getMonth() + 1;
    number_year_of_calendar = new Date().getFullYear();

    if (number_day_of_calendar < 10) {
      number_day_of_calendar = "0" + number_day_of_calendar
    }

    if (number_month_of_calendar < 10) {
      number_month_of_calendar = "0" + number_month_of_calendar
    }


    // Old function disabled - using new version from script_modifications.js
    /*
    function funct_get_data() {
      return new Promise(function (resolve, reject) {
        $.ajax({
          url: link_bd + '?q=' + number_month_of_calendar + '_' + number_year_of_calendar + '&_sort=name&_order=asc',
          method: 'get',
          dataType: 'json',
          success: function (data) {
            resolve(data) // Разрешает промис и запускает then()
            json_data = data;
          },
          error: function (err) {
            reject(err) // Запрещает промис и запускает catch()
          }
        });
      });
    */
    // }
  } else {
    today_date.setDate(1);



    // Old function disabled - using new version from script_modifications.js
    /*
    function funct_get_data() {
      return new Promise(function (resolve, reject) {
        $.ajax({
          url: link_bd + '?q=' + number_month_of_calendar + '_' + number_year_of_calendar + '&_sort=name&_order=asc',
          method: 'get',
          dataType: 'json',
          success: function (data) {
            resolve(data) // Разрешает промис и запускает then()
            json_data = data;
          },
          error: function (err) {
            reject(err) // Запрещает промис и запускает catch()
          }
        });
      });
    */
    // }
  }


  //Отрисовка календаря
  funct_get_data().then(function render_calendar_true() {
    // Запускает это когда промис разрешает
    let quontity = (json_data.length); //Количество студентов по фильтру


    //Отрисовка текста над календарем за выбранный месяц после проверки текущий месяц или нет
    // Если месяц текущий указать число месяц год и день недели
    if (date_1 === date_2) {
      function render_text_about_calendar_full() {
        // Задаем цвет в календаре и строчке с сегодняшним числом

        set_style_calendar("full");



        //Пишем информацию про дату полную
        let date = document.getElementById('information_about_calendar');
        let anchor_date = Number(number_day_of_calendar - 2);
        if (anchor_date <= 0) {
          anchor_date = 1;
        }

        date.innerHTML = '<h2><button class="btn" onclick="change_month_is_get_minus()"><i class="fa-sharp fa-solid fa-chevron-left fa-lg"></i></button>'
          + '<span>'
          + number_day_of_calendar
          + '.'
          + number_month_of_calendar
          + '.'
          + number_year_of_calendar
          + '</span>'
          + '<button class="btn" onclick="change_month_is_get_plus()"><i class="fa-sharp fa-solid fa-chevron-right fa-lg"></i></button>'
          + '<h3><a id="today_day_of_week_anchor" href="javascript:void(0);" onclick="scrollToDate()">'
          + name_of_week_en_full[number_day_of_week]
          + '</a></h3></h2>';
        
        

      } render_text_about_calendar_full();
    } else {// Если месяц не текущий указать месяц год
      function render_text_about_calendar_not_full() {
        // Убираем цвет в календаре строчке с сегодняшним числом

        set_style_calendar("nofull");


        //Пишем информацию про дату неполную
        let date = document.getElementById('information_about_calendar');

        date.innerHTML = '<h2><button class="btn" onclick="change_month_is_get_minus()"><i class="fa-sharp fa-solid fa-chevron-left fa-lg"></i></button>'
          + '<span>'
          + number_month_of_calendar
          + '.'
          + number_year_of_calendar
          + '</span>'
          + '<button class="btn" onclick="change_month_is_get_plus()"><i class="fa-sharp fa-solid fa-chevron-right fa-lg"></i></button>'
          + '<div id="return_to_bottom_div">'
          + '<a class="btn" href="#bottom_of_table_anchor">'
          + '<i class="fa-solid fa-chevron-down fa-lg"></i>'
          + '</a>'
          + '</div>';
        + '</h2>'

      } render_text_about_calendar_not_full();
    }
    // Отрисовка календаря
    function createCalendar(elem, year, month) {

      let mon = month - 1; // месяцы в JS идут от 0 до 11, а не от 1 до 12
      let d = new Date(year, mon);
      // Создание столбцов th
      let rows1 = ''; // 1 строка 1 недели
      let rows234 = ''; // первая строка недель со 2 по 4

      //Формирование первой строки таблицы th с именами 
      for (let i = 0; i < quontity; i++) {
        rows1 += '<th id=student_top_th_'
          + json_data[i].id
          + ' class="student_top_th" onclick="openModalUser()" data-toggle="tooltip" data-placement="top" title="' + (json_data[i].current_cost || json_data[i].curent_cost || '') + '">'
          + '<i id="i_hide_row_student" class="fa-solid fa-eye-slash"></i>'
          + '<span id="top_student_span">' + json_data[i].quantity_paid_lessons + '</span>'
          + '<h3>' + json_data[i].name + '</h3>'
          + '</th>';
      } rows1 += '<th id="student_top_th_add_new" class="student_top_th_add_new">'
        //Кнопка чтобы добавить из всех студентов которая запускает функцию addFromPrevStudents_OpenModalUser()
        + '<input id="btn_add_from_all" type="button" value="Add from all" class="btn btn-outline-dark btn-sm rounded-pill" onclick="addFromPrevStudents_OpenModalUser()" data-bs-dismiss="modal"><br>'
        + '<input id="btn_add_add_new" type="button" value="Add new" class="btn btn-outline-dark btn-sm rounded-pill" onclick="addNew_modalUser()" data-bs-dismiss="modal"></th>'

      //Формирование 2-3-4 строки таблицы th 
      for (let i = 0; i < quontity; i++) {
        rows234 += '<th id=student_th_' + [i + 1] + ' class="table-color"></th>';
      } rows234 += '<th class="table-color"></th>'

      //Создание прототипа таблицы с вставленными столбцами
      // 1 строка 1 недели
      let table = '<table><thead><tr id="tr_1"><th class="student_top_th_month">'
        + '<button id="show_buttons_add_students_this_month" class="btn" onclick="show_buttons_add_students()"><i id="i_hide_row_student" class="fa-solid fa-plus"></i></button>'
        + '<br>'
        + '<span>'
        + name_of_month_en_full[number_month_of_calendar - 1]
        + '</span></th>' + rows1 + ''
        + '</tr></thead><tbody>';

      //Посчитать количество дней в неделе
      function getDay(date) { // получить номер дня недели, от 0 (пн) до 6 (вс)
        let day = date.getDay();
        if (day == 0) day = 7; // сделать воскресенье (0) последним днем
        return day - 1;
      }
      //Пока день месяца соответствует текущему месяцу создавать строки таблицы
      while (d.getMonth() == mon) {
        let birthdayStyle = getBirthdayHighlightStyle(d);
        let day_week_name = d.getDay();
        let date_of_firstTd_in_a_row = d.getDate();
        if (date_of_firstTd_in_a_row < 10) {
          date_of_firstTd_in_a_row = "0" + date_of_firstTd_in_a_row
        }
        table += '<td id="' + date_of_firstTd_in_a_row + '_new_day_row" class="m_d_' + date_of_firstTd_in_a_row + ' day_of_month"' + (birthdayStyle ? ' ' + birthdayStyle : '') + ' onclick="openModaltodayLessons()"><div><span>' + name_of_week_en[day_week_name] + '</span><span>' + date_of_firstTd_in_a_row + '</span></div></td>';

        if (getDay(d) !== 7) {
          for (let i = 0; i < quontity + 1; i++) {
            //Проверка данных есть ли данные по текущему td
            let date_of_td = d.getDate();
            if (date_of_td < 10) {
              date_of_td = "0" + date_of_td
            }
            let birthdayStyle = getBirthdayHighlightStyle(d);
            if (json_data[i] !== undefined) {
              table += '<td id=' + date_of_td + '_' + json_data[i].id + ' class="m_d_'
                + date_of_td + ' month_day_td student_td_' + json_data[i].id + '"' + birthdayStyle + ' onclick="openModalCalendar()"></td>';
            } else {
              table += '<td id=' + date_of_td + '_add_new class="m_d_'
                + date_of_td + ' month_day_td_new"' + birthdayStyle + '></td>';
            }
          }
        }

        // если день недели воскресенье (6), значит, это конец недели
        if (getDay(d) == 6) {
          let lastDay = d.getDate(); // Получаем число последнего дня недели
          let lastMonth = mon + 1;   // Месяцы в JS идут с 0, поэтому +1
          let lastYear = year;       // Год остается тем же

          // Добавляем ведущий 0 для однозначных чисел
          if (lastDay < 10) lastDay = "0" + lastDay;
          if (lastMonth < 10) lastMonth = "0" + lastMonth;

          let rowId = `${lastDay}_${lastMonth}_${lastYear}`; // Формат дд_мм_гггг

          // Добавляем строку с нужным id
          table += `</tr><th id="${rowId}" class="endweek table-color" onclick="CopyLessonOnNextWeek('${rowId}')"></th>` + rows234 + '<tr>';
        }

        // если день по счету не 8 то новый ряд
        if (getDay(d) !== 8) {
          table += '</tr><tr>';
        }

        d.setDate(d.getDate() + 1);

      }

      // закрыть таблицу закрывающими тегами
      table += '</tr></tbody></table><div id="bottom_of_table_anchor"></div>'


      document.getElementById("bottom_button_to_top").innerHTML = '<div id="return_to_top_div">'
        + '<a class="btn" href="#top">'
        + '<i class="fa-solid fa-chevron-up fa-lg"></i>'
        + '</a>'
        + '</div>';


      elem.innerHTML = table;


    } createCalendar(calendar, number_year_of_calendar, number_month_of_calendar);

// Функция для получения стиля для выделения дня рождения пользователя
function getBirthdayHighlightStyle(currentDate) {
  const user = Auth.getUser();
  if (user && user.birthday) {
    const birthday = new Date(user.birthday);
    // Проверяем, совпадает ли месяц и день
    if (currentDate.getMonth() === birthday.getMonth() && 
        currentDate.getDate() === birthday.getDate()) {
      // Добавляем стиль с фоновой анимацией для дня рождения
      return ' style="background-image: url(\'img/birthday.gif\'); background-size: cover; background-position: center;"';
    }
  }
  return ''; // Возвращаем пустую строку, если это не день рождения
}

    // Запускает это когда данные по студентам не загрузились
  }).catch(function render_calendar_false(error) {
    console.error('Students loading failed with error:', error);
    function render_text_about_calendar_error() {
      let error_get = document.getElementById('calendar');
      error_get.innerHTML = '<div id="error_block_1"><h1>Data not loaded</h1>'
        + '<p>Error: ' + (error?.message || 'Unknown error') + '</p>'
        + '<input type="button" class="btn btn-outline-secondary" value="Retry" onclick="document.location.reload(true)"></div>';
    } render_text_about_calendar_error();
  })

  // Перебор данных и запись занятий в календарь.  
  // Запускает это когда данные по занятием загрузились
  funct_get_data().then(function render_calendar_true_lessons() {

    function set_lessons_in_calendar() {

      // Используем новую функцию получения уроков
      funct_get_lessons()
        .then(response => {
          json_lessons = response

          for (let i = 0; i < json_lessons.length; i++) {
            let lesson_td_date = json_lessons[i].date;
            let lesson_type = json_lessons[i].lesson_type;
            let lesson_comment = json_lessons[i].note;
            let do_we_have_this_user_for_this_month;

            if (json_lessons[i].lesson_type !== "NewStudent" && json_lessons[i].lesson_type !== "Prev_Student_for_this_month") {
              let array_lesson_td_date = lesson_td_date.split("_");

              if (array_lesson_td_date[1] == number_month_of_calendar && array_lesson_td_date[2] == number_year_of_calendar) {
                do_we_have_this_user_for_this_month = json_data.find(element => element.id == json_lessons[i].student_id);
                if (do_we_have_this_user_for_this_month === undefined || do_we_have_this_user_for_this_month === null) {
                  //ничего
                } else {
                  if (json_lessons[i].student_id == do_we_have_this_user_for_this_month.id) {
                    document.getElementById(array_lesson_td_date[0] + "_" + json_lessons[i].student_id).setAttribute("data-toggle", "tooltip");
                    document.getElementById(array_lesson_td_date[0] + "_" + json_lessons[i].student_id).setAttribute("data-placement", "top");
                    document.getElementById(array_lesson_td_date[0] + "_" + json_lessons[i].student_id).setAttribute("title", lesson_comment);
                    document.getElementById(array_lesson_td_date[0] + "_" + json_lessons[i].student_id).innerHTML += ' <span>' + array_lesson_td_date[3] + '</span> ' + types_of_lessons_symbols[parseInt(lesson_type) - 1];
                  }
                }
              }
            }
          }
          //Создает кнопку меню для вызова меню
          document.getElementById("menu_right").innerHTML = ''

            + '  <div id="menu_container_right">'
            + '    <button id="menu_container_button_4" class="btn" type="button" onclick="open_modal_chart()">'
            + '      <i class="fa-solid fa-chart-line fa-2xl"></i>'
            + '    </button>'
            + '    <button id="menu_container_button" class="btn" type="button" onclick="insert_dashboard_inputs(0)">'
            + '      <i class="fa-solid fa-hryvnia-sign fa-2xl"></i>'
            + '    </button>'
            + '    <button id="menu_container_button_3" class="btn" type="button" onclick="open_modal_style()">'
            + '      <i class="fa-solid fa-gear fa-2xl"></i>'
            + '    </button>'
            + ' </div>';

          document.getElementById("menu_left").innerHTML = ''
            + '  <div id="menu_container_left">'
            + '  <button id="menu_container_button_2" class="btn" type="button" onclick="Start_onload()">'
            + '  <i class="fa-solid fa-repeat fa-2xl"></i>'
            + '  </button>'
            + ' </div>';

        })
        .catch(error => {
          console.error('funct_get_lessons failed:', error);
          // Show error message but continue with calendar rendering
          json_lessons = [];
        })

    } set_lessons_in_calendar(); show_bday_of_students(); $(".popover").popover('dispose');
  }).catch(function render_calendar_false_lessons(error) {
    // Запускает это когда данные по занятием не загрузились
    console.error('Lessons loading failed with error:', error);
    function render_text_about_lessons_error() {
      let error_get = document.getElementById('calendar');
      error_get.innerHTML = '<div id="error_block_2"><h1>Lessons not loaded</h1>'
        + '<p>Error: ' + (error?.message || 'Unknown error') + '</p>'
        + '<input type="button" class="btn btn-outline-secondary" value="Retry" onclick="document.location.reload(true)"></div>';
    } render_text_about_lessons_error();
  })


};
// Функция для смены месяца нажатием на кнопку вбок
function change_month_is_get_minus() {
  today_date.setDate(1);
  today_date.setMonth(today_date.getMonth() - 1);

  let date_1 = new Date().getMonth() + 1 + '.' + new Date().getFullYear();
  let date_2 = today_date.getMonth() + 1 + '.' + today_date.getFullYear();

  if (date_1 === date_2) {
    Start_onload();
  } else {
    Start_onload();
  }


};
function change_month_is_get_plus() {
  today_date.setDate(1);
  today_date.setMonth(today_date.getMonth() + 1);

  let date_1 = new Date().getMonth() + 1 + '.' + new Date().getFullYear();
  let date_2 = today_date.getMonth() + 1 + '.' + today_date.getFullYear();

  if (date_1 === date_2) {
    Start_onload();
  } else {
    Start_onload();
  }
};

//Функция прокрутки к текущей дате
function scrollToDate() {
  let anchor_date = (number_day_of_calendar - 2).toString().padStart(2, '0'); // Добавляем ведущий ноль
  let targetElement = document.getElementById(anchor_date + '_new_day_row'); // Ищем элемент с таким id
  if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Плавный скроллинг
  } else {
      console.log('Элемент не найден!');
  }
}


//Функции для модальных окон пользователя
function openModalUser() {
  let clicked_data = (event.target.id);

  if (clicked_data == "i_hide_row_student") {

    let clicked_row = (event.currentTarget.id)
    const myArray = clicked_row.split("_");
    hide_row_of_student(myArray[3]);

  } else {



    $('#myModal').modal('toggle')

    document.getElementById("ModalBody").innerHTML = '<div id="stident_id"></div> <div id="student_information"></div>'

    document.getElementById("stident_id").innerHTML = ''
      + '    <div class="input-group-id">'
      + '        <input id="id_of_the_student_modal" class="input-group-text" id="basic-addon0" value="" type="hidden" disabled>'
      + '     </div>'
    //Создание тела html для модального окна пользователя
    document.getElementById("student_information").innerHTML = ''

    + '    <div class="input-group form-switch mb-3">'
    + '        <label for="status_switch_student_modal">Archive student for next months</label>'
    + '        <input id="status_switch_student_modal" type="checkbox" class="form-check-input" disabled'
    + '    </div>'

      + '    <div class="input-group mb-3">'
      + '        <label for="name_of_the_student_modal">Name of the student</label>'
      + '       <input id="name_of_the_student_modal" type="text" class="form-control w-100" placeholder="" disabled>'
      + '     </div>'

      + '    <div class="input-group mb-3">'
      + '        <label for="quantity_of_the_student_modal">Quantity of the student lessons</label>'
      + '       <input id="quantity_of_the_student_modal" type="text" class="form-control w-100" placeholder="" disabled>'
      + '     </div>'

      + '    <div class="input-group mb-3">'
      + '        <label for="cost_of_the_student_modal">Cost for 1 student lesson</label>'
      + '       <input id="cost_of_the_student_modal" type="text" class="form-control w-100" placeholder="" disabled>'
      + '     </div>'

      + '    <div class="input-group mb-3">'
      + '        <label for="bday_of_the_student_modal">Birthday</label>'
      + '       <input id="bday_of_the_student_modal" type="text" class="form-control w-100" placeholder="" disabled>'
      + '     </div>'

      + '    <div class="input-group mb-3">'
      + '        <label for="comment_of_the_student_modal">Comment of the current student</label>'
      + '      <textarea id="comment_of_the_student_modal" type="text" class="form-control w-100" placeholder="" disabled></textarea>'
      + '     </div>';

    document.getElementById("ModalFooter").innerHTML = ''
      + '    <input type="button" value="Edit" class="btn btn-outline-warning rounded-pill" onclick="editModalUser()">'
      + '    <input type="button" value="Close" class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">'

    //Переменная берет id ячейки на которую нажали и разделяет id знаком _ и создает массив со значениями
    let id_student = "";

    if (id_student == "") {
      id_student = event.srcElement.id;
    }
    // if (id_student == "") {
    //   id_student = event.path[1].id;
    // }
    if (id_student == "" || id_student == "top_student_span" || id_student == "bottom_student_span") {
      id_student = event.srcElement.parentElement.id;
    }


    const myArray = id_student.split("_");
    const studentId = myArray[3];

    // Показываем анимацию загрузки
    document.getElementById("ModalLabel").innerHTML = 'Loading student info...';
    
    // Загружаем полные данные студента через API
    loadStudentDetails(studentId);
  }
};

// Новая функция для загрузки полных данных студента
async function loadStudentDetails(studentId) {
  try {
    
    // Загружаем полные данные студента через API
    const response = await Auth.apiRequest(`/students/${studentId}`);
    
    if (response && response.ok) {
      const current_student_clickedOn = await response.json();
      
      //Информация в хедер модального окна студента
      document.getElementById("ModalLabel").innerHTML = 'Student ' + current_student_clickedOn.id + ' info';
      
      //Информация в тело модального окна студента 
      document.getElementById("id_of_the_student_modal").value = current_student_clickedOn.id;
      document.getElementById("name_of_the_student_modal").value = current_student_clickedOn.name || '';
      document.getElementById("quantity_of_the_student_modal").value = current_student_clickedOn.quantity_paid_lessons !== undefined && current_student_clickedOn.quantity_paid_lessons !== null ? current_student_clickedOn.quantity_paid_lessons : '';
      document.getElementById("cost_of_the_student_modal").value = current_student_clickedOn.current_cost || current_student_clickedOn.curent_cost || '';

      if (current_student_clickedOn.birthday == undefined || current_student_clickedOn.birthday == "" || current_student_clickedOn.birthday == null) {
        //Оставляем поле даты пустым
        document.getElementById("bday_of_the_student_modal").value = '';
      } else {
        try {
          // Обрабатываем разные форматы даты для текстового поля (просмотр)
          let birthday = current_student_clickedOn.birthday;
          let formattedDate = '';
          
          if (birthday.includes('T')) {
            // ISO формат: "2000-08-22T21:00:00.000Z"
            const dateOnly = birthday.split('T')[0]; // "2000-08-22"
            const dateParts = dateOnly.split('-'); // ["2000", "08", "22"]
            formattedDate = dateParts[2] + '.' + dateParts[1] + '.' + dateParts[0]; // "22.08.2000"
          } else if (birthday.includes('-') && !birthday.includes('.')) {
            // Простой формат: "2000-08-22"
            const dateParts = birthday.split('-'); // ["2000", "08", "22"]
            formattedDate = dateParts[2] + '.' + dateParts[1] + '.' + dateParts[0]; // "22.08.2000"
          } else if (birthday.includes('.')) {
            // Уже в нужном формате дд.мм.гггг
            formattedDate = birthday;
          } else {
            // Неизвестный формат, оставляем как есть
            formattedDate = birthday;
          }
          
          document.getElementById("bday_of_the_student_modal").value = formattedDate;
          
        } catch (error) {
          document.getElementById("bday_of_the_student_modal").value = '';
        }
      }

      // Установка состояния переключателя на основе значения из базы данных (архивный студент или нет)
      if (current_student_clickedOn.status_switch === undefined || current_student_clickedOn.status_switch === "" || current_student_clickedOn.status_switch === "false") {
        document.getElementById("status_switch_student_modal").checked = false;  // Отключаем переключатель
      } else {
        document.getElementById("status_switch_student_modal").checked = true;  // Включаем переключатель
      }

      document.getElementById("comment_of_the_student_modal").value = current_student_clickedOn.comment || '';
      
    } else {
      console.error('Failed to load student details');
      document.getElementById("ModalLabel").innerHTML = 'Error loading student';
      alert('Error loading student data');
    }
  } catch (error) {
    console.error('Error loading student details:', error);
    document.getElementById("ModalLabel").innerHTML = 'Error loading student';
    alert('Error loading student data: ' + error.message);
  }
}

function editModalUser() {

  document.getElementById("student_information").innerHTML = ''

  + '    <div class="input-group form-switch mb-3">'
  + '        <label for="status_switch_student_modal">Archive student for next months</label>'
  + '        <input id="status_switch_student_modal" type="checkbox" class="form-check-input"'
  + '    </div>'

    + '<form class="was-validated"> '
    + '    <div class="input-group mb-3">'
    + '        <label for="name_of_the_student_modal">Name of the student</label>'
    + '       <input id="name_of_the_student_modal" type="text" class="form-control is-invalid w-100" placeholder="Write a name of the student" required>'
    + '     </div>'

    + '    <div class="input-group mb-3">'
    + '        <label for="quantity_of_the_student_modal">Quantity of the student lessons</label>'
    + '       <input id="quantity_of_the_student_modal" type="text" class="form-control is-invalid w-100" placeholder="Write a quantity of the student lessons" required>'
    + '     </div>'

    + '    <div class="input-group mb-3">'
    + '        <label for="cost_of_the_student_modal">Cost for 1 student lesson</label>'
    + '       <input id="cost_of_the_student_modal" type="text" class="form-control is-invalid w-100" placeholder="Write a cost of the 1 student lesson" required>'
    + '     </div>'
    + '    </form>'

    + '    <div class="input-group mb-3">'
    + '        <label for="bday_of_the_student_modal">Birthday</label>'
    + '       <input id="bday_of_the_student_modal" type="text" class="form-control w-100" placeholder="дд.мм.гггг">'
    + '     </div>'

    + '    <div class="input-group mb-3">'
    + '        <label for="comment_of_the_student_modal">Comment of the current student</label>'
    + '       <textarea id="comment_of_the_student_modal" type="text" class="form-control w-100" placeholder="Write a comment of the student lesson"></textarea>'
    + '     </div>';

  document.getElementById("ModalFooter").innerHTML = ''
    + '    <input type="submit" value="Save changes" class="btn btn-success rounded-pill" onclick="saveData_modalUser_inputBtn()">'
    + '    <input type="button" value="Delete student from current month" class="btn btn-warning rounded-pill" onclick="deleteFromCurrentMonth_modalUser_inputBtn()">'

    + '    <input type="button" value="Delete student from calendar" class="btn btn-danger rounded-pill" onclick="deleteData_modalUser_inputBtn()">'
    + '    <input type="button" value="Close" class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">'


  const student_id = document.getElementById("id_of_the_student_modal").value;
  
  // Загружаем свежие данные студента для редактирования
  loadStudentDetailsForEdit(student_id);
};

// Новая функция для загрузки данных студента в режиме редактирования
async function loadStudentDetailsForEdit(studentId) {
  try {
    
    const response = await Auth.apiRequest(`/students/${studentId}`);
    
    if (response && response.ok) {
      const current_student_clickedOn = await response.json();
      
      document.getElementById("name_of_the_student_modal").value = current_student_clickedOn.name || '';
      document.getElementById("quantity_of_the_student_modal").value = current_student_clickedOn.quantity_paid_lessons !== undefined && current_student_clickedOn.quantity_paid_lessons !== null ? current_student_clickedOn.quantity_paid_lessons : '';
      document.getElementById("cost_of_the_student_modal").value = current_student_clickedOn.current_cost || current_student_clickedOn.curent_cost || '';
      
      // Обрабатываем дату рождения
      if (current_student_clickedOn.birthday == undefined || current_student_clickedOn.birthday == "" || current_student_clickedOn.birthday == null) {
        document.getElementById("bday_of_the_student_modal").value = '';
      } else {
        try {
          let birthday = current_student_clickedOn.birthday;
          let formattedDate = '';
          
          if (birthday.includes('T')) {
            // ISO формат: "2000-08-22T21:00:00.000Z"
            const dateOnly = birthday.split('T')[0]; // "2000-08-22"
            const dateParts = dateOnly.split('-'); // ["2000", "08", "22"]
            formattedDate = dateParts[2] + '.' + dateParts[1] + '.' + dateParts[0]; // "22.08.2000"
          } else if (birthday.includes('-') && !birthday.includes('.')) {
            // Простой формат: "2000-08-22"
            const dateParts = birthday.split('-'); // ["2000", "08", "22"]
            formattedDate = dateParts[2] + '.' + dateParts[1] + '.' + dateParts[0]; // "22.08.2000"
          } else if (birthday.includes('.')) {
            // Уже в нужном формате дд.мм.гггг
            formattedDate = birthday;
          } else {
            formattedDate = birthday;
          }
          
          document.getElementById("bday_of_the_student_modal").value = formattedDate;
          
        } catch (error) {
          document.getElementById("bday_of_the_student_modal").value = '';
        }
      }
      
      document.getElementById("comment_of_the_student_modal").value = current_student_clickedOn.comment || '';
      document.getElementById("status_switch_student_modal").checked = current_student_clickedOn.status_switch === "true";
      
    } else {
      console.error('Failed to load student details for edit');
      alert('Error loading student data for editing');
    }
  } catch (error) {
    console.error('Error loading student details for edit:', error);
    alert('Error loading student data: ' + error.message);
  }
}

async function saveData_modalUser_inputBtn() {
  //Собираются переменные с модального окна
  const id_of_the_student_modal = document.getElementById("id_of_the_student_modal").value;
  const name_of_the_student_modal = document.getElementById("name_of_the_student_modal").value;
  const quantity_of_the_student_modal = document.getElementById("quantity_of_the_student_modal").value;
  const cost_of_the_student_modal = document.getElementById("cost_of_the_student_modal").value;
  const bday_of_the_student_modal = document.getElementById("bday_of_the_student_modal").value;
  const comment_of_the_student_modal = document.getElementById("comment_of_the_student_modal").value;
  const status_switch_student_modal = document.getElementById("status_switch_student_modal").checked;


  if (name_of_the_student_modal == "" || quantity_of_the_student_modal == "" || cost_of_the_student_modal == "") {
    alert("Insert all required information about student");
  } else {
    
    // Валидация формата даты
    if (bday_of_the_student_modal && bday_of_the_student_modal.trim() !== '') {
      if (!isValidDateFormat(bday_of_the_student_modal)) {
        alert("Please enter the birth date in the correct format: dd.mm.yyyy\nExample: 22.08.2000");
        return; // Прерываем сохранение
      }
    }
    // Преобразуем дату из формата дд.мм.гггг в гггг-мм-дд для базы данных
    let birthday_for_db = null;
    if (bday_of_the_student_modal && bday_of_the_student_modal.trim() !== '') {
      if (bday_of_the_student_modal.includes('.')) {
        try {
          const dateParts = bday_of_the_student_modal.split('.'); // ["01", "02", "2020"]
          if (dateParts.length === 3 && dateParts[0] && dateParts[1] && dateParts[2]) {
            // Добавляем нули для обеспечения правильного формата
            const day = dateParts[0].padStart(2, '0');
            const month = dateParts[1].padStart(2, '0'); 
            const year = dateParts[2];
            birthday_for_db = `${year}-${month}-${day}`; // "2020-02-01"
          } else {
            birthday_for_db = null; // пустая дата
          }
        } catch (error) {
          birthday_for_db = null; // пустая дата при ошибке
        }
      } else {
        // Если формат не дд.мм.гггг, оставляем как есть
        birthday_for_db = bday_of_the_student_modal;
      }
    } else {
      // Пустое поле - отправляем null
      birthday_for_db = null;
    }

    const studentData = {
      "name": name_of_the_student_modal,
      "quantity_paid_lessons": quantity_of_the_student_modal,
      "current_cost": cost_of_the_student_modal,
      "birthday": birthday_for_db,
      "comment": comment_of_the_student_modal,
      "status_switch": status_switch_student_modal.toString()
    };

    try {
      // Включить анимацию загрузки
      modal_loading_animation();

      
      // Используем новую функцию обновления студента
      await updateStudentNew(id_of_the_student_modal, studentData);
      
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Error updating student: ' + error.message);
    }
  }

};//Ajax patch 
async function deleteData_modalUser_inputBtn() {
  const id_of_the_student_modal = document.getElementById("id_of_the_student_modal").value;

    // Подтверждение перед удалением
    if (!confirm("Are you sure you want to delete this student?\nThis action will also delete all lessons associated with this student.")) {
      return; // Отменить удаление, если пользователь не подтвердил
    }

  // Получаем все занятия, связанные с этим студентом
  try {
    const student_lessons = await fetchLessons('?student_id=' + id_of_the_student_modal);

      if (student_lessons.length > 0) {
        // Функция для удаления занятия с задержкой
        function deleteLessonWithDelay(lessonId, delay) {
          return new Promise((resolve, reject) => {
            setTimeout(async () => {
              try {
                // Включаем анимацию загрузки
                modal_loading_animation();
                await deleteLesson(lessonId);
                console.log('Занятие удалено с ID: ' + lessonId);
                resolve();
              } catch (error) {
                console.error("Ошибка при удалении занятия:", error);
                reject(error);
              }
            }, delay);
          });
        }

        // Массив с запросами для удаления всех занятий
        let deletionPromises = [];
        student_lessons.forEach((lesson, index) => {
          const delay = index * 1000;  // Задержка 1 секунда между запросами
          deletionPromises.push(deleteLessonWithDelay(lesson.id, delay));
        });

        // После завершения всех удалений, удаляем студента
        Promise.all(deletionPromises).then(async () => {
          // Теперь удаляем студента
          try {
            await deleteStudent(id_of_the_student_modal);
            Start_onload();
            $('#myModal').modal('toggle');
          } catch (error) {
            console.error("Ошибка при удалении студента:", error);
          }
        }).catch(err => {
          console.log("Ошибка при удалении одного из занятий", err);
        });
      } else {
        // Если занятий нет, сразу удаляем студента
        try {
          await deleteStudent(id_of_the_student_modal);
          Start_onload();
          $('#myModal').modal('toggle');
        } catch (error) {
          console.error("Ошибка при удалении студента:", error);
        }
      }
  } catch (error) {
    console.error("Ошибка при получении занятий:", error);
  }
};
async function deleteFromCurrentMonth_modalUser_inputBtn() {
  const id_of_the_student_modal = document.getElementById("id_of_the_student_modal").value;
  const index_of_student_in_array = json_data.findIndex(function (obj) { return obj.id == id_of_the_student_modal });

  let cost_date_array = json_data[index_of_student_in_array].cost_date;
  for (let i = 0; i < cost_date_array.length; i++) {

    // Поиск даты которую нужно удалить из студента чтобы он не выводился в текущий месяц
    if (cost_date_array[i].date == number_month_of_calendar + '_' + number_year_of_calendar) {
      cost_date_array.splice(i, 1);
    }
  }

  let array_to_post = [];
  array_to_post = JSON.stringify(
    {
      "cost_date": cost_date_array
    }
  );

  // Анимация загрузки
  modal_loading_animation();

  try {
    const response = await updateStudent(id_of_the_student_modal, JSON.parse(array_to_post));
    console.log('Student updated:', response);
    Start_onload();
    $('#myModal').modal('toggle');
  } catch (error) {
    console.error('Error updating student:', error);
    alert('Error updating student');
  }


  console.log(id_of_the_student_modal)
};//Fetch patch
function addNew_modalUser() {
  $('#myModal').modal('toggle')
  document.getElementById("ModalLabel").innerHTML = "Add new student";
  document.getElementById("ModalBody").innerHTML = ''
    + '<form class="was-validated"> '
    + ' <div class="mb-3">'
    + ' <label for="name_of_the_student_modal" class="form-label">Name of the student</label>'
    + '  <input type="text" class="form-control is-invalid" id="name_of_the_student_modal" placeholder="" required>'
    + ' </div>'

    + ' <div class="mb-3">'
    + ' <label for="quantity_of_the_student_modal" class="form-label">Quantity of the student lessons</label>'
    + '  <input type="number" class="form-control is-invalid" id="quantity_of_the_student_modal" placeholder="" required>'
    + ' </div>'

    + ' <div id="cost_container_new_student" class="mb-3">'

    + '  <div id="cost_container_new_student_number">'
    + '    <label for="cost_of_the_student_modal" class="form-label">Cost of the student lessons</label>'
    + '    <input type="number" class="form-control is-invalid" id="cost_of_the_student_modal" placeholder="" required>'
    + '  </div>'

    + '  <div id="cost_container_new_student_currency">'
    + '      <label for="cost_of_the_student_modal_currency" class="form-label">Currency</label>'
    + '      <select id="cost_of_the_student_modal_currency" class="form-control" required>'
    + '      <option value="₴" label="₴"></option>'
    + '      </select>'
    + '  </div>'
    + ' </form>'
    + ' </div>'


    + '  <div id="bday_container_new_student_number">'
    + '    <label for="bday_of_the_student_modal" class="form-label">Birthday</label>'
    + '    <input type="text" class="form-control" id="bday_of_the_student_modal" placeholder="дд.мм.гггг">'
    + '  </div>'


    + ' <div class="mb-3">'
    + ' <label for="comment_of_the_student_modal" class="form-label">Comment of the student lessons</label>'
    + '  <textarea type="text" class="form-control" id="comment_of_the_student_modal"></textarea>'
    + ' </div>'

  document.getElementById("ModalFooter").innerHTML = ''
    + '    <input class="btn btn-success rounded-pill" type="submit" value="Add new student"  onclick="saveNew_modalUser_inputBtn()" enabled>'
    + '    <input type="button" value="Close" class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">'


};
async function saveNew_modalUser_inputBtn() {
  //Собираются переменные с модального окна

  const name_of_the_student_modal = document.getElementById("name_of_the_student_modal").value;
  const quantity_of_the_student_modal = document.getElementById("quantity_of_the_student_modal").value;
  const cost_of_the_student_modal = document.getElementById("cost_of_the_student_modal").value;
  const cost_of_the_student_modal_currency = document.getElementById("cost_of_the_student_modal_currency").value;
  const bday_of_the_student_modal = document.getElementById("bday_of_the_student_modal").value;
  const comment_of_the_student_modal = document.getElementById("comment_of_the_student_modal").value;


  if (name_of_the_student_modal == "" || quantity_of_the_student_modal == "" || cost_of_the_student_modal == "") {
    alert("Insert all information");
  } else {
    
    // Валидация формата даты
    if (bday_of_the_student_modal && bday_of_the_student_modal.trim() !== '') {
      if (!isValidDateFormat(bday_of_the_student_modal)) {
        alert("Please enter the birth date in the correct format: dd.mm.yyyy\nExample: 22.08.2000");
        return; // Прерываем создание
      }
    }

    // Преобразуем дату из формата дд.мм.гггг в гггг-мм-дд для базы данных
    let birthday_for_db = null;
    if (bday_of_the_student_modal && bday_of_the_student_modal.trim() !== '') {
      if (bday_of_the_student_modal.includes('.')) {
        try {
          const dateParts = bday_of_the_student_modal.split('.'); // ["01", "02", "2020"]
          if (dateParts.length === 3 && dateParts[0] && dateParts[1] && dateParts[2]) {
            // Добавляем нули для обеспечения правильного формата
            const day = dateParts[0].padStart(2, '0');
            const month = dateParts[1].padStart(2, '0'); 
            const year = dateParts[2];
            birthday_for_db = `${year}-${month}-${day}`; // "2020-02-01"
          } else {
            birthday_for_db = null;
          }
        } catch (error) {
          birthday_for_db = null;
        }
      } else {
        birthday_for_db = bday_of_the_student_modal;
      }
    } else {
      // Пустое поле - отправляем null
      birthday_for_db = null;
    }

    const studentData = {
      "name": name_of_the_student_modal,
      "current_cost": cost_of_the_student_modal + " " + cost_of_the_student_modal_currency,
      "quantity_paid_lessons": quantity_of_the_student_modal,
      "birthday": birthday_for_db,
      "cost_date": [
        {
          "id": 1,
          "type": "NewStudent",
          "date": number_month_of_calendar + '_' + number_year_of_calendar
        }
      ],
      "comment": comment_of_the_student_modal
    };

    try {
      // Включить анимацию загрузки
      modal_loading_animation();

      
      // Используем новую функцию создания студента
      await createStudentNew(studentData);
      
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Error creating student: ' + error.message);
    }
  }
};//Fetch post
async function addFromPrevStudents_OpenModalUser(parameter) {
  let startparametr = parameter;
  let list_of_current_students = json_data;

  if (startparametr == undefined) {
    startparametr = {checked: "firsttime"}
  }

  if (startparametr.checked == "firsttime") {
    $('#myModal').modal('toggle')
      // Анимация загрузки модального окна
      modal_loading_animation();
  }
  
  document.getElementById("ModalLabel").innerHTML = "Select the student";

  try {
    // Получаем всех студентов через новый API
    const response = await fetchStudents();
    
    if (response) {
      if (startparametr.checked == "firsttime") {
        document.getElementById("ModalBody").innerHTML = ""

          + ' <div class="mb-3">'
          + '<form class="was-validated"> '
          + ' <label for="inputSelect_studentFromAnother_month" class="form-label">Select student who you want to add</label>'

          + '  <select class="form-control" multiple id="inputSelect_studentFromAnother_month" required>'
          + '  </select>'
          + '</div>'
          + '    </form>'

          + '<div id="statusTogglePrevMonthStudents" class="input-group form-switch mt-3">'
          + '<label class="form-check-label" for="statusToggle">Show archived students</label>'
          + '<input class="form-check-input" type="checkbox" id="statusToggle" onclick="addFromPrevStudents_OpenModalUser(this)">'
          + '</div>';
      }

      list_of_all_students = response
      
      
      if (startparametr.checked !== true) {
        // Фильтруем список студентов, исключая тех, у которых status_switch равен строке "true"
        list_of_all_students = list_of_all_students.filter(student => student.status_switch !== "true");
      } else {
        // Фильтруем список студентов, исключая тех, у которых status_switch равен строке "true"
        list_of_all_students = list_of_all_students.filter(student => student.status_switch == "true");
      }
    

      //Проход по массиву студентов на текущий месяц
      for (let i0 = 0; i0 < list_of_current_students.length; i0++) {
        let current_student_from_curent_students = list_of_current_students[i0];
        //Проход по массиву всех студентов
        for (let i = 0; i < list_of_all_students.length; i++) {
          let current_student_from_all_students = list_of_all_students[i];
          // Если айдишки совпадают удалить такой єлемент
          if (current_student_from_all_students.id == current_student_from_curent_students.id) {
            list_of_all_students.splice(i, 1);
          }
        }
      }

      // Переменная для записи вариантов для селекта
      let to_html_select_students_list = '<option style="display:none" value="" label="Выбрать"></option>';
      //Проход по массиву оставшихся студентов и построение вариантов для селекта
      for (let i = 0; i < list_of_all_students.length; i++) {
        to_html_select_students_list += '<option value="' + list_of_all_students[i].id + '">' + list_of_all_students[i].name + '</option>'
      }

      document.getElementById("inputSelect_studentFromAnother_month").innerHTML = to_html_select_students_list;

    }
  } catch (error) {
    console.error('Error fetching students:', error);
    alert('Error loading students');
  }

  document.getElementById("ModalFooter").innerHTML = ''
    + '    <input class="btn btn-success rounded-pill" type="submit" value="Add to this month" onclick="addFromPrevStudents_SaveModalUser()" enabled>'
    + '    <input type="button" value="Close" class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">'
};
async function addFromPrevStudents_SaveModalUser() {

  let student_id = document.getElementById("inputSelect_studentFromAnother_month").selectedOptions;
  let promises = [];

  // Анимация загрузки
  modal_loading_animation()

  
  for (let s = 0; s < student_id.length; s++) {
    // console.log(student_id[s].value)

    let index_of_student_in_array = list_of_all_students.findIndex(function (obj) { return obj.id == student_id[s].value });

    if (student_id[s].value == "") {
      alert("Insert all information")

    } else {
      let cost_date_array = list_of_all_students[index_of_student_in_array].cost_date;
      let last_id = "";

      //Выясняем последнее id cost
      for (let i = 0; i < cost_date_array.length; i++) {
        last_id = cost_date_array[i].id
      }

      cost_date_array.push({
        "id": last_id + 1,
        "date": number_month_of_calendar + '_' + number_year_of_calendar,
        "type": 'previous_added'
      })

      const studentUpdateData = {
        "cost_date": cost_date_array
      };

      console.log('Updating student:', student_id[s].value, 'with data:', studentUpdateData);
      
      // Используем новую функцию обновления студента
      promises.push(updateStudentNew(student_id[s].value, studentUpdateData));
    }

  }

  try {
    // Дождаться завершения всех обещаний
    await Promise.all(promises);
    console.log('All students updated successfully');
    Start_onload();
    $('#myModal').modal('toggle');
  } catch (error) { // Обработка ошибок
    console.error("Ошибка:", error); // Логирование ошибки
    alert('Error updating students: ' + error.message);
  }

};//Fetch patch



//Функции для модальных окон календаря
function openModalCalendar() {
  let id_element_clicked = event.srcElement.id

  let id_student = id_element_clicked.split("-")[4];

  if (id_element_clicked !== "button-CalendarSchedule-cancel-lesson-" + id_student) {
    $('#myModal').modal('toggle')
    id_student = event.srcElement.id;
  }
  if (id_student == "") {
    id_student = event.srcElement.parentElement.id;
  }

  //Переменная берет id ячейки на которую нажали и разделяет id знаком _ и создает массив со значениями 

  const myArray = id_student.split("_"); //myArray[0]день месяца, myArray[1] id студента
  let index_of_student_in_array = json_data.findIndex(function (obj) { return obj.id == myArray[1] });
  //Информация в хедер модального окна студента
  document.getElementById("ModalLabel").innerHTML = "Lessons info [" + name_of_month_en_full[Number(number_month_of_calendar) - 1] + " " + myArray[0] + "]";
  document.getElementById("ModalBody").innerHTML = ''

    + '<div id="ModalBody_inputs">'
    + '<input type="hidden" id="lesson_day_of_the_student_modal_calendar" placeholder="Lesson day" value="' + myArray[0] + '"/>'
    + '<input type="hidden" id="id_of_the_student_modal_calendar" placeholder="Student Id" value="' + myArray[1] + '"/>'
    + '<input type="hidden" id="number_array_of_the_student_modal_calendar" placeholder="Student Id" value="' + index_of_student_in_array + '"/>'
    + '</div>'
    + '<div id="ModalBody_information">'
    + '    <div class="input-group mb-3">'
    + '      <div class="input-group-prepend">'
    + '        <div id="list_of_lessons_in_modal" ></div>'
    + '      </div>'
    + '     </div>'

    + '</div>'
  document.getElementById("ModalFooter").innerHTML = ''
    + '    <input type="button" value="Schedule new" class="btn btn-success rounded-pill" onclick="openModal_schedule_new_Calendar()">'
    + '    <input type="button" value="Receive payment" class="btn btn-warning rounded-pill" onclick="openModal_schedule_new_Calendar_type_add_payment()">'
    + '    <input type="button" value="Close" class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">';
  let lessons_for_this_day = json_lessons.filter(x => x.student_id == myArray[1]);
  
  //Вывод занятий в шаблон
  if (lessons_for_this_day.length !== undefined) {
    for (let l1 = 0; l1 < lessons_for_this_day.length; l1++) {
      let lessons_in_modal = lessons_for_this_day[l1].date;
      let lessons_type_in_modal = lessons_for_this_day[l1].lesson_type;
      let array_lessons_in_modal = lessons_in_modal.split("_");
      let button_set_done = "";
      let input_type_open_lesson = "";
      let input_cost_for_one_lesson_open_lesson = "";

      lessons = id_student.split("_");
      if (array_lessons_in_modal[0] === myArray[0] && array_lessons_in_modal[1] == number_month_of_calendar && array_lessons_in_modal[2] == number_year_of_calendar && lessons_for_this_day[l1].lesson_type !== "NewStudent" && lessons_for_this_day[l1].lesson_type !== "Prev_Student_for_this_month") {
        // Если занятие не с типом Done поставить две кнопки иначе одну
        if (lessons_type_in_modal !== "3" && lessons_type_in_modal !== "9") {
          button_set_done = '<button id="button_CalendarSchedule_setDone_lesson_' + lessons_for_this_day[l1].id + '" class="btn btn-outline-success OpenCalendar_buttonsEdit" onclick="setLessonDone(' + lessons_for_this_day[l1].id + ',' + lessons_type_in_modal + ')">Set Done</button>'
            + button_set_done + '<button id="button_CalendarSchedule_edit_lesson_' + lessons_for_this_day[l1].id + '" class="btn btn-sm btn-outline-warning OpenCalendar_buttonsEdit" onclick="editModalCalendar(' + lessons_type_in_modal + ')">Edit</button><br>';
        } else {
          button_set_done = button_set_done + '<button id="button_CalendarSchedule_edit_lesson_' + lessons_for_this_day[l1].id + '" class="btn btn-sm btn-outline-warning OpenCalendar_buttonsEdit" onclick="editModalCalendar(' + lessons_type_in_modal + ')">Edit</button><br>';
        }
        // Если занятие не с типом Payment recieve показать поля тип и цена иначе скрыть
        if (lessons_type_in_modal !== "9") {
          input_type_open_lesson = '<input id="type_input_' + lessons_for_this_day[l1].id + '" value="' + types_of_lessons_names[parseInt(lessons_type_in_modal) - 1] + '" disabled/>';
          input_cost_for_one_lesson_open_lesson = '<input id="cost_input_' + lessons_for_this_day[l1].id + '" value="' + lessons_for_this_day[l1].cost + '" disabled/>';
        } else {
          input_type_open_lesson = '<input id="type_input_' + lessons_for_this_day[l1].id + '" value="' + types_of_lessons_names[parseInt(lessons_type_in_modal) - 1] + '" type="hidden"/>';
          input_cost_for_one_lesson_open_lesson = '<input id="cost_input_' + lessons_for_this_day[l1].id + '" value="' + lessons_for_this_day[l1].cost + '" type="hidden"/>';
        }

        document.getElementById("list_of_lessons_in_modal").innerHTML += ''
          + '<div id="current_div_lesson_unput_' + lessons_for_this_day[l1].id + '" class="list_of_lessons_in_modal">'
          + '<input id="date_input_' + lessons_for_this_day[l1].id + '" value="' + array_lessons_in_modal[0] + '.' + array_lessons_in_modal[1] + '.' + array_lessons_in_modal[2] + ' ' + array_lessons_in_modal[3] + '" disabled/>'
          + input_type_open_lesson
          + input_cost_for_one_lesson_open_lesson
          + '<textarea id="comment_input_' + lessons_for_this_day[l1].id + '" value="' + lessons_for_this_day[l1].note + '" disabled>' + lessons_for_this_day[l1].note + '</textarea><div id="OpenCalendar_buttonsEdit">' + button_set_done + '</div>';


      } else {
        // console.log("Not this day")
      }
    }
  } else {
    // console.log("Don't have lessons")
  }

};
async function setLessonDone(id_of_lesson, type_of_lesson) {

  let id_of_student = document.getElementById("id_of_the_student_modal_calendar").value;
  let edited_type = 3; // Тип "Done"

  await minus_1_lesson_from_quantity(id_of_student, edited_type, -1, type_of_lesson);

  try {
    // Включить анимацию загрузки
    modal_loading_animation();

    await updateLesson(id_of_lesson, { "lesson_type": "3" }); // Тип "Done"
    
    // Перезагрузить данные календаря
    Start_onload();
    $('#myModal').modal('toggle');
  } catch (error) {
    console.error("Ошибка при отметке урока как выполненного:", error);
    alert('Error marking lesson as completed');
  }
}
function editModalCalendar(prev_type_of_lesson) {

  let id_of_lesson_clicked_object = event.srcElement.id
  let id_of_student = document.getElementById("id_of_the_student_modal_calendar").value;

  const myArray = id_of_lesson_clicked_object.split("_");
  let lesson_idButton_edit_clicked = myArray[4];
  let element_id = "current_div_lesson_unput_" + lesson_idButton_edit_clicked;

  let edit_lesson_date_array = document.getElementById("date_input_" + lesson_idButton_edit_clicked).value;
  let edit_lesson_type = document.getElementById("type_input_" + lesson_idButton_edit_clicked).value;
  let edit_lesson_cost = document.getElementById("cost_input_" + lesson_idButton_edit_clicked).value;
  let edit_lesson_comment = document.getElementById("comment_input_" + lesson_idButton_edit_clicked).value;
  let edit_lesson_date = edit_lesson_date_array.split(".");
  let edit_lesson_year_time = edit_lesson_date[2].split(" ")
  let hide_type_if_recive_payment = "";
  let hide_cost_if_recive_payment = "";

  let select_options_type_lesson = '<option style="display:none" value="" label="Выбрать"></option>';
  for (let i = 1; i < types_of_lessons_names.length; i++) {
    if ([i] != "9") {
      select_options_type_lesson += '<option value="' + i + '" label="' + types_of_lessons_names[i - 1] + '"></option>'
    } else {
      // 9 тип не показываем
    }
  }

  if (edit_lesson_type != "Payment recieve") {
    hide_type_if_recive_payment = '<select id="edited_type_' + lesson_idButton_edit_clicked + '" value="' + edit_lesson_type + '"  class="form-control" placeholder="Type of the lessons" list="all_types_of_the_student_modal_calendar" required>'
      + select_options_type_lesson
      + '      </select>'
    hide_cost_if_recive_payment = '<input id="edited_cost_' + lesson_idButton_edit_clicked + '" value="' + edit_lesson_cost + '" class="form-control" placeholder="Cost 100 EUR" required/>';
  } else {
    hide_type_if_recive_payment = '<select id="edited_type_' + lesson_idButton_edit_clicked + '" value="' + edit_lesson_type + '"  class="form-control" placeholder="Type of the lessons" list="all_types_of_the_student_modal_calendar" required hidden>'
      + select_options_type_lesson
      + '      </select>'
    hide_cost_if_recive_payment = '<input id="edited_cost_' + lesson_idButton_edit_clicked + '" value="' + edit_lesson_cost + '" class="form-control" placeholder="Cost 100 EUR" required type="hidden"/>';
  }


  document.getElementById(element_id).innerHTML = '<form class="was-validated"><div id="edit_time_div">'

    + '<input id="edited_day_' + lesson_idButton_edit_clicked + '" value="' + edit_lesson_date[0] + '" class="form-control" placeholder="Day 00" required/>'
    + '<input id="edited_month_' + lesson_idButton_edit_clicked + '" value="' + edit_lesson_date[1] + '" class="form-control" placeholder="Month 00" required/>'
    + '<input id="edited_year_' + lesson_idButton_edit_clicked + '" value="' + edit_lesson_year_time[0] + '" class="form-control" placeholder="Year 0000" required/>'
    + '<input id="edited_time_' + lesson_idButton_edit_clicked + '" value="' + edit_lesson_year_time[1] + '" class="form-control" placeholder="Time 00:00" required/></div>'

    + hide_type_if_recive_payment

    + hide_cost_if_recive_payment
    + '</form>'
    + '<textarea id="edited_comment_' + lesson_idButton_edit_clicked + '" class="form-control" value="' + edit_lesson_comment + '" placeholder="Comment of the lessons">' + edit_lesson_comment + '</textarea>'



    + '<div id="buttons_for_item_edited_caledar">'
    + '<button id="button_CalendarSchedule_SaveEditChange_lesson_' + lesson_idButton_edit_clicked + '" class="btn btn-sm btn-outline-success" onclick="save_after_EditChangeCalendar(this.id, ' + prev_type_of_lesson + ')">Save change</button>'
    + '<button id="button-CalendarSchedule-cancel-lesson-' + edit_lesson_date[0] + '_' + id_of_student + '" class="btn btn-sm btn-outline-secondary" onclick="openModalCalendar(this.id)">Cancel</button><br>'
    + '<button id="button_CalendarSchedule_delete_lesson_' + lesson_idButton_edit_clicked + '" class="btn btn-sm btn-outline-danger" onclick="delete_scheduledCalendarLesson(this.id)">Delete</button><br>'

    + '</div>';


  //Поиск индекса типа занятия
  let index_of_type_edited_lesson = types_of_lessons_names.indexOf(edit_lesson_type)
  let value_of_type_edited_lesson = index_of_type_edited_lesson + 1; // Конвертируем индекс в значение типа
  //Добавляем в опции выбранный ранее тип
  document.getElementById("edited_type_" + lesson_idButton_edit_clicked).innerHTML += '<option style="display:none" value="' + value_of_type_edited_lesson + '" label="' + edit_lesson_type + '" selected></option>';



};
async function save_after_EditChangeCalendar(clicked_button_id, prev_type_of_lesson) {
  //Переменная берет id ячейки на которую нажали и разделяет id знаком _ и создает массив со значениями
  let id_student = document.getElementById("id_of_the_student_modal_calendar").value;

  let id_of_lesson_array = clicked_button_id
  const id_of_lesson = id_of_lesson_array.split("_")[4];

  let edited_day = document.getElementById("edited_day_" + id_of_lesson).value;
  if (edited_day < 10 && edited_day[0] != 0) {
    edited_day = "0" + edited_day
  }
  let edited_month = document.getElementById("edited_month_" + id_of_lesson).value;
  if (edited_month < 10 && edited_month[0] != 0) {
    edited_month = "0" + edited_month
  }
  let edited_year = document.getElementById("edited_year_" + id_of_lesson).value;
  let edited_time = document.getElementById("edited_time_" + id_of_lesson).value;
  let edited_type = document.getElementById("edited_type_" + id_of_lesson).value;
  let edited_cost = document.getElementById("edited_cost_" + id_of_lesson).value;
  let edited_comment = document.getElementById("edited_comment_" + id_of_lesson).value;





  if (edited_day == "" || edited_day == "0" || edited_month == "" || edited_month == "0" || edited_year == "" || edited_time == "" || edited_type == "" || edited_type == "0") {
    alert("Insert all required information");
  } else {

    let edited_date = edited_day + '_' + edited_month + '_' + edited_year + '_' + edited_time;

    // Логика изменения количества занятий: только для типа "3" (Done)
    if (Number(prev_type_of_lesson) == 3 && Number(edited_type) !== 3) {
      // Было Done, стало что-то другое - возвращаем занятие
      await minus_1_lesson_from_quantity(id_student, edited_type, 1, prev_type_of_lesson);
    }
    if (Number(prev_type_of_lesson) !== 3 && Number(edited_type) == 3) {
      // Было что-то другое, стало Done - отнимаем занятие
      await minus_1_lesson_from_quantity(id_student, edited_type, -1, prev_type_of_lesson);
    }

    try {
      // Включить анимацию загрузки для загрузки данных
      modal_loading_animation();

      const lessonData = {
        "student_id": id_student,
        "date": edited_date,
        "lesson_type": edited_type,
        "cost": edited_cost,
        "note": edited_comment
      };

      await updateLesson(id_of_lesson, lessonData);
      
      // Перезагрузить данные календаря
      Start_onload();
      $('#myModal').modal('toggle');
    } catch (error) {
      console.error("Ошибка при обновлении занятия:", error);
      alert('Error updating lesson');
    }
  };


};
function openModal_schedule_new_Calendar() {
  //Переменная берет id ячейки на которую нажали и разделяет id знаком _ и создает массив со значениями
  let id_student = event.srcElement.id;
  let index_student = document.getElementById("number_array_of_the_student_modal_calendar").value;
  const myArray = id_student.split("_");

  //Информация в тело модального окна студента 
  let select_options_type_lesson = '<option style="display:none" value="2" label="Scheduled" selected></option>';
  for (let i = 1; i < types_of_lessons_names.length; i++) {
    select_options_type_lesson += '<option value="' + i + '" label="' + types_of_lessons_names[i - 1] + '"></option>'

  }

  document.getElementById("ModalBody_information").innerHTML = ''
    + '<form class="was-validated"> '

    + '    <div class="input-group mb-3">'
    + '        <label for="time_of_the_student_modal_calendar_hours">Time of the lesson</label>'
    + '        <div id="container_of_time_scheduled_lesson_of_the_student_modal_calendar">'
    + '       <input id="time_of_the_student_modal_calendar_hours" type="text"  class="form-control" placeholder="Hours" required>'
    + '        <label for="time_of_the_student_modal_calendar_minute">:</label>'
    + '       <input id="time_of_the_student_modal_calendar_minute" type="text" value="00"  class="form-control" placeholder="Minutes" required>'
    + '        </div>'
    + '     </div>'

    + '    <div class="input-group mb-3">'
    + '      <label for="type_of_the_student_modal_calendar">Type of the lesson</label>'
    + '      <select id="type_of_the_student_modal_calendar" class="form-control w-100" required>'
    + select_options_type_lesson
    + '      </select>'
    + '     </div>'

    + '    <div class="input-group mb-3">'
    + '        <label for="cost_of_the_student_modal_calendar">Cost of the lesson</label>'
    + '       <input id="cost_of_the_student_modal_calendar" type="text" value="' + (json_data[index_student].current_cost || json_data[index_student].curent_cost || '') + '"  class="form-control w-100" placeholder="Set cost of the lesson like 100 EUR" required>'
    + '     </div>'
    + '    </form>'

    + '    <div class="input-group mb-3">'
    + '        <label for="comment_of_the_student_modal_calendar">Comment of the lesson</label>'
    + '    <textarea id="comment_of_the_student_modal_calendar" class="form-control w-100" placeholder="Comment of the lessons"></textarea>'
    + '     </div>'

  document.getElementById("ModalFooter").innerHTML = ''
    + '    <input type="submit" value="Save schedule" class="btn btn-success rounded-pill" onclick="saveData_schedule_new_Calendar()">'
    + '    <input type="button" value="Close" class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">'


};
function openModal_schedule_new_Calendar_type_add_payment() {
  //Переменная берет id ячейки на которую нажали и разделяет id знаком _ и создает массив со значениями
  let id_student = event.srcElement.id;
  let index_student = document.getElementById("number_array_of_the_student_modal_calendar").value;
  const myArray = id_student.split("_");

  //Информация в тело модального окна студента 
  let select_options_type_lesson = '<option style="display:none" value="10" label="Payment recieve" selected></option>';
  for (let i = 1; i < types_of_lessons_names.length; i++) {
    select_options_type_lesson += '<option value="' + i + '" label="' + types_of_lessons_names[i - 1] + '"></option>'

  }

  document.getElementById("ModalBody_information").innerHTML = ''
    + '<form class="was-validated"> '

    + '    <div class="input-group mb-3">'
    + '        <label for="time_of_the_student_modal_calendar_hours">Time of the lesson</label>'
    + '        <div id="container_of_time_scheduled_lesson_of_the_student_modal_calendar">'
    + '       <input id="time_of_the_student_modal_calendar_hours" type="text"  class="form-control" placeholder="Hours" required>'
    + '        <label for="time_of_the_student_modal_calendar_minute">:</label>'
    + '       <input id="time_of_the_student_modal_calendar_minute" type="text" value="00"  class="form-control" placeholder="Minutes" required>'
    + '        </div>'
    + '     </div>'


    + '      <select id="type_of_the_student_modal_calendar" class="form-control" value="" hidden>'
    + select_options_type_lesson
    + '      </select>'

    + '       <input id="cost_of_the_student_modal_calendar" type="hidden" value="' + (json_data[index_student].current_cost || json_data[index_student].curent_cost || '') + '"  class="form-control" placeholder="Set cost of the lesson like 100 EUR" required>'


    + '    <div class="input-group mb-3">'
    + '        <label for="qty_lessons_of_the_student_modal_calendar">Quantity paid lesson</label>'
    + '       <input id="qty_lessons_of_the_student_modal_calendar" type="text" value=""  class="form-control w-100" placeholder="Set quantity paid lesson" required>'
    + '     </div>'
    + '    </form>'

    + '    <div class="input-group mb-3">'
    + '        <label for="comment_of_the_student_modal_calendar">Comment of the lesson</label>'
    + '    <textarea id="comment_of_the_student_modal_calendar" class="form-control w-100" placeholder="Comment of the lessons"></textarea>'
    + '     </div>'

  document.getElementById("ModalFooter").innerHTML = ''
    + '    <input type="submit" value="Save payment" class="btn btn-success rounded-pill" onclick="saveData_schedule_new_Calendar()">'
    + '    <input type="button" value="Close" class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">'
}
async function saveData_schedule_new_Calendar() {

  let student_id = document.getElementById("id_of_the_student_modal_calendar").value;
  let lesson_time_hours = document.getElementById("time_of_the_student_modal_calendar_hours").value;
  let lesson_time_minutes = document.getElementById("time_of_the_student_modal_calendar_minute").value;
  let lesson_type = document.getElementById("type_of_the_student_modal_calendar").value;
  let lesson_cost = document.getElementById("cost_of_the_student_modal_calendar").value;
  let lesson_comment = document.getElementById("comment_of_the_student_modal_calendar").value;
  let lesson_paid_qty = '';

  if (document.getElementById("qty_lessons_of_the_student_modal_calendar") != null) {
    lesson_paid_qty = document.getElementById("qty_lessons_of_the_student_modal_calendar").value;
    await minus_1_lesson_from_quantity(student_id, lesson_type, "plus", "2", lesson_paid_qty);

    lesson_paid_qty = 'Added [' + document.getElementById("qty_lessons_of_the_student_modal_calendar").value + '] lessons / Description: ';

  } else {
    lesson_paid_qty = '';
  }

  let lesson_day_of_the_student_modal_calendar = document.getElementById("lesson_day_of_the_student_modal_calendar").value;

  // Отладка убрана - функция работает корректно
  
  // Если тип не выбран, устанавливаем Scheduled по умолчанию
  if (lesson_type == "" || lesson_type == "0") {
    lesson_type = "2"; // Scheduled
  }
  
  if (lesson_time_hours == "" || lesson_time_minutes == "") {
    alert("Insert all information");
  } else {

    const lessonData = {
      "student_id": student_id,
      "date": lesson_day_of_the_student_modal_calendar + '_' + number_month_of_calendar + '_' + number_year_of_calendar + '_' + lesson_time_hours + ':' + lesson_time_minutes,
      "lesson_type": lesson_type,
      "cost": lesson_cost,
      "note": lesson_paid_qty + lesson_comment
    };

    // Отнимаем количество занятий только если тип "3" (Done)
    if (lesson_type == "3") {
      await minus_1_lesson_from_quantity(student_id, lesson_type, -1);
    }

    try {
      // Анимация загрузки
      modal_loading_animation();

      await createLesson(lessonData);
      
      Start_onload();
      $('#myModal').modal('toggle');
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert('Error creating lesson');
    }

  }
};
async function delete_scheduledCalendarLesson(data) {
  const array_of_id_button_clicked = data.split("_"); // [4] is id of lesson
  const id_lesson = array_of_id_button_clicked[4];
  const current_lesson_clickedOn = json_lessons.find(obj => obj.id == id_lesson);
  const lesson_type = current_lesson_clickedOn.lesson_type;
  const id_student = current_lesson_clickedOn.student_id;

  // Для payment record (тип 10) нужно отнять количество занятий из комментария
  if (lesson_type == "10") {
    // Извлекаем количество занятий из комментария: "Added [5] lessons / Description: ..."
    const comment = current_lesson_clickedOn.note || '';
    const match = comment.match(/Added \[(\d+)\] lessons/);
    if (match) {
      const addedLessons = parseInt(match[1]);
      await minus_1_lesson_from_quantity(id_student, lesson_type, "minus", "", addedLessons);
    }
  } else {
    // Для обычных занятий - возвращаем 1 при удалении Done
    if (lesson_type == "3") {
      await minus_1_lesson_from_quantity(id_student, lesson_type, 1);
    }
  }

  try {
    // Анимация загрузки
    modal_loading_animation();

    await deleteLesson(id_lesson);
    
    // Перезагрузка данных календаря
    Start_onload();
    $('#myModal').modal('toggle');
  } catch (error) {
    console.error("Ошибка при удалении занятия:", error);
    alert('Error deleting lesson');
  }

};
async function minus_1_lesson_from_quantity(student_id, lesson_type, minus_or_plus, prev_type_of_lesson, qty_lessons) {

  const current_student_clickedOn = json_data.find(obj => obj.id == student_id);

  let edited_quantity = 0;
  if (minus_or_plus == 1) {
    edited_quantity = Number(current_student_clickedOn.quantity_paid_lessons) + 1
  };
  if (minus_or_plus == -1) {
    edited_quantity = Number(current_student_clickedOn.quantity_paid_lessons) - 1
  };
  if (minus_or_plus == "plus") {
    edited_quantity = Number(current_student_clickedOn.quantity_paid_lessons) + Number(qty_lessons)
  };
  if (minus_or_plus == "minus") {
    edited_quantity = Number(current_student_clickedOn.quantity_paid_lessons) - Number(qty_lessons)
  };


  if (lesson_type == "3" || prev_type_of_lesson == "3" || lesson_type == "10") { // Для типа "Done" и "Payment recieve"
    try {
      await updateStudent(current_student_clickedOn.id, {
        "quantity_paid_lessons": edited_quantity
      });
    } catch (error) {
      console.error("Error updating student quantity:", error);
    }
  }



}
async function CopyLessonOnNextWeek(rowId) {
  // Проверка не нужна, используем новые API функции

  try {
    // console.log("Разбираем rowId:", rowId);
    let [day, month, year] = rowId.split("_");
    let lastDayDate = new Date(Date.UTC(year, month - 1, day));

    // Получаем даты текущей недели
    let weekDates = [];
    let weekMonths = new Set(); // Храним месяцы недели
    let currentWeekDates = [];
    let nextWeekDates = [];
    
    for (let i = 0; i < 7; i++) {
      let dd = lastDayDate.getUTCDate().toString().padStart(2, "0");
      let mm = (lastDayDate.getUTCMonth() + 1).toString().padStart(2, "0");
      let yyyy = lastDayDate.getUTCFullYear();

      weekDates.push(`${dd}_${mm}_${yyyy}`);
      weekMonths.add(`${mm}_${yyyy}`); // Добавляем уникальные месяцы
      currentWeekDates.push(`${dd}.${mm}.${yyyy}`);
      
      // Добавляем даты следующей недели для сообщения
      let nextWeekDate = new Date(lastDayDate);
      nextWeekDate.setUTCDate(nextWeekDate.getUTCDate() + 7);
      let nextDd = nextWeekDate.getUTCDate().toString().padStart(2, "0");
      let nextMm = (nextWeekDate.getUTCMonth() + 1).toString().padStart(2, "0");
      let nextYyyy = nextWeekDate.getUTCFullYear();
      nextWeekDates.push(`${nextDd}.${nextMm}.${nextYyyy}`);
      
      lastDayDate.setUTCDate(lastDayDate.getUTCDate() - 1);
    }

    // Сортируем даты по порядку (от понедельника к воскресенью)
    currentWeekDates.reverse();
    nextWeekDates.reverse();
    
    const fromRange = `${currentWeekDates[0]} - ${currentWeekDates[6]}`;
    const toRange = `${nextWeekDates[0]} - ${nextWeekDates[6]}`;
    
    const confirmLoad = confirm(`Copy lessons from ${fromRange} to ${toRange}?`);
    if (!confirmLoad) {
      console.log("Download cancelled.");
      return;
    }

    // Получаем все занятия за месяцы недели и фильтруем нужные даты
    let allLessons = [];
    for (let monthYear of weekMonths) {
      const monthData = await fetchLessons(`?date_like=${monthYear}`);
      allLessons = allLessons.concat(monthData);
    }

    // Фильтруем занятия только на даты текущей недели
    const data = allLessons.filter(lesson => {
      const lessonDatePart = lesson.date.split('_').slice(0, 3).join('_');
      return weekDates.includes(lessonDatePart);
    });

    // console.log("Данные с сервера о занятиях:", data);

    let studentIds = [...new Set(data.map(lesson => lesson.student_id))];

    if (studentIds.length === 0) {
      // console.log("Нет студентов для копирования.");
      return;
    }

    const studentsData = await fetchStudents(`?id=${studentIds.join("&id=")}`);

    // console.log("Данные студентов:", studentsData);

    // Создаем объект соответствия student_id -> cost_date
    let studentCostDates = {};
    studentsData.forEach(student => {
      studentCostDates[student.id] = student.cost_date.map(cost => cost.date);
    });

    // Фильтруем занятия перед копированием
    let lessonPromises = data.map(async (lesson) => {
      // console.log("Обрабатываем урок:", lesson);

      delete lesson.id;

      let [lessonDay, lessonMonth, lessonYear, lessonTime] = lesson.date.split("_");
      let [hours, minutes] = lessonTime.split(":");

      let lessonDate = new Date(lessonYear, lessonMonth - 1, lessonDay, hours, minutes);
      lessonDate.setDate(lessonDate.getDate() + 7);

      let newMonthYear = `${(lessonDate.getMonth() + 1).toString().padStart(2, "0")}_${lessonDate.getFullYear()}`;
      let newDate = `${lessonDate.getDate().toString().padStart(2, "0")}_${newMonthYear}_${lessonDate.getHours().toString().padStart(2, "0")}:${lessonDate.getMinutes().toString().padStart(2, "0")}`;

      let studentId = lesson.student_id;

      // Проверяем, есть ли у студента оплаченные месяцы
      if (!studentCostDates[studentId].includes(newMonthYear)) {
        // console.log(`Пропускаем занятие, т.к. студент ${studentId} не оплатил ${newMonthYear}`);
        return;
      }

      let updatedLesson = {
        ...lesson,
        date: newDate,
        lesson_type: "2", // Устанавливаем тип урока как строку "2" (Scheduled)
      };

      try {
        await createLesson(updatedLesson);
        // console.log("Урок перемещен на следующую неделю:", updatedLesson);
      } catch (error) {
        console.error("Error while copying:", error);
      }
    });

    await Promise.all(lessonPromises);

    // console.log("Все занятия обработаны, перезагружаем страницу...");
    Start_onload();

  } catch (error) {
    console.error("Error while work with lessons:", error);
  }
}


// popover со списком занятий на выбранный день день
function openModaltodayLessons() {
  // Берем айди клетки
  let id_element_clicked = event.srcElement.id
  // Если айди нету ищем в родительском элементе
  if (id_element_clicked == "") {
    id_element_clicked = event.srcElement.offsetParent.id
  }
  // Берем из айди день на который мы нажали
  let number_of_day = id_element_clicked.split("_")[0];
  let array_sorted_lessons;
  let sorted_lessons_dates = "";
  let names_of_students = "";
  // Фильтруем только те дни которые совпадают с тем что мы нажали
  let all_lessons_filtered_to_current_day = json_lessons.filter(x => x.date.split("_")[0] == number_of_day);
  // Сортируем занятия по времени
  array_sorted_lessons = all_lessons_filtered_to_current_day.sort((firstItem, secondItem) => firstItem.date.split("_")[3].split(":")[0] - secondItem.date.split("_")[3].split(":")[0]);

  for (let i = 0; i < array_sorted_lessons.length; i++) {
    // Ищем студента с нашего занятия
    names_of_students = json_data.find(element => element.id === Number(array_sorted_lessons[i].student_id));
    if (names_of_students == undefined) {
      // Ничего не делаем
    } else {
      // Рисуем таблицу если тип Запланированный или Заметка
      if (array_sorted_lessons[i].lesson_type === "1" || array_sorted_lessons[i].lesson_type === "2" || array_sorted_lessons[i].lesson_type == "3" || array_sorted_lessons[i].lesson_type == "5" || array_sorted_lessons[i].lesson_type == "6" || array_sorted_lessons[i].lesson_type == "7") {
        if (array_sorted_lessons[i].lesson_type !== "1") {
          sorted_lessons_dates += "<p>"
            + "<span>" + array_sorted_lessons[i].date.split("_")[3] + "</span>"
            + "<span>  " + names_of_students.name + "   </span>"
            + types_of_lessons_symbols[parseInt(array_sorted_lessons[i].lesson_type) - 1]
            + "</p>";
        } else {
          sorted_lessons_dates += "<p>"
            + "<span>" + array_sorted_lessons[i].date.split("_")[3] + "</span>"
            + "<span>  " + names_of_students.name + "   </span>"
            + "</p>";
        }
      }
    }

  }

  //Условие если поповер не открыл пустить по первому условию и открыть новый
  if (document.getElementById(number_of_day + '_new_day_row').getAttribute('aria-describedby') === null) {
    $('#' + number_of_day + '_new_day_row').popover({
      placement: 'right',
      html: true,
      title: "Lessons <br>" + name_of_month_en_full[number_month_of_calendar - 1] + ", " + number_of_day,
      content: ''
        + '<div id="clicked_day_lessons">'
        + sorted_lessons_dates
        + '</div>'
    })
    $('#' + number_of_day + '_new_day_row').popover('toggle')
    // Иначе очистить
  } else {
    document.getElementById(number_of_day + '_new_day_row').removeAttribute('aria-describedby')
    $('#' + number_of_day + '_new_day_row').popover('dispose')


  }


}

//Функции по дешборду подсчета заработанного за период
function insert_dashboard_inputs(info) {
  $('#myModal').modal('toggle')


  document.getElementById("ModalLabel").innerHTML = "Lessons dashboard";
  document.getElementById("ModalBody").innerHTML = ''
    + '<form class="was-validated">'
    + '    <div id="inputs_of_dashboards">'
    + '      <input id="day_input_start"  class="form-control" type="number" placeholder="Day start" required>'
    + '      <input id="day_input_end" class="form-control" type="number" placeholder="Day end" required>'
    + '    </div>'
    + '     <div id="dashboard">'
    + '     </div>';
  +'</form>'

  document.getElementById("ModalFooter").innerHTML = ''
    + '      <button class="btn btn-outline-success rounded-pill" onclick="dashboard_set_information()">Get information</button>'
    + '      <button class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">Close</button>';


  if (info = "0") {
    dashboard_set_information(0);
  }

}
function clearDashboard() {

  document.getElementById("ModalLabel").innerHTML = "Lessons dashboard";
  document.getElementById("dashboard").innerHTML = ''
  document.getElementById("inputs_of_dashboards").innerHTML = ''
    + '      <input id="day_input_start"  class="form-control" type="number" placeholder="Day start" required>'
    + '      <input id="day_input_end" class="form-control" type="number" placeholder="Day end" required>';

  document.getElementById("ModalFooter").innerHTML = ''
    + '      <button class="btn btn-outline-success rounded-pill" onclick="dashboard_set_information(1)">Get information</button>'
    + '      <button class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">Close</button>';


};
function dashboard_set_information(info) {

  let thead_tr_th_list = '';
  let empty_td_with_id = ''
  let day_input_start_number = 1;
  let day_input_end_number = 31;
  document.getElementById("ModalLabel").innerHTML = "Lessons dashboard all month";


  if (info !== 0) {
    day_input_start_number = document.getElementById("day_input_start").value;
    day_input_end_number = document.getElementById("day_input_end").value;
    document.getElementById("ModalLabel").innerHTML = "Lessons dashboard " + day_input_start_number + "-" + day_input_end_number;

  }


  if (day_input_start_number !== "" && day_input_end_number !== "" && day_input_start_number > "0" && Number(day_input_start_number) <= Number(day_input_end_number)) {

    //Записываем информацию об именах студентов в переменную в html формате для thead
    for (let i = 0; i < json_data.length; i++) {
      thead_tr_th_list += '<th scope="col">' + json_data[i].name + '</th>';
    }

    //Создаем пустые ячейки для будующих данных
    for (let i = 0; i < json_data.length; i++) {
      empty_td_with_id += ''
        + '<td id="dashboard_td_' + json_data[i].id + '">'
        + ' <span id="done_span_' + json_data[i].id + '"></span>'
        + '<span id="dashboard_quantity_' + json_data[i].id + '"></span><br>'

        + ' <span id="cost_span_' + json_data[i].id + '"></span>'
        + '<span id="dashboard_cost_' + json_data[i].id + '"></span>'
        + ' <span id="currency_span_' + json_data[i].id + '"></span><br>'
        + ' </td>';
    }
    // Рисуем таблицу с именами но без данных, чтобы получить столбики таблицы с их id
    let tableTitle = (info === 0) ? "Month's earnings:" : "";
    let dashboardHTML = ""
      + (tableTitle ? '<h5>' + tableTitle + '</h5>' : '')
      + '<table class="table table-bordered table-responsive-xl align-middle">'

      + '<thead>'
      + '  <tr>'
      + '  <th>About all</th>'
      + thead_tr_th_list
      + '  </tr>'
      + '</thead>'

      + ' <tr>'
      + ' <td id="dashboard_td_all_students"></td>'
      + empty_td_with_id

      + ' </tr>'

      + '</tbody>'
      + '</table>';

    // Если это первое открытие модального окна (info === 0), добавляем таблицу за сегодня
    if (info === 0) {
      // Создаем пустые ячейки для таблицы за сегодня
      let empty_td_today = '';
      for (let i = 0; i < json_data.length; i++) {
        empty_td_today += ''
          + '<td id="dashboard_today_td_' + json_data[i].id + '">'
          + ' <span id="done_today_span_' + json_data[i].id + '"></span>'
          + '<span id="dashboard_today_quantity_' + json_data[i].id + '"></span><br>'
          + ' <span id="cost_today_span_' + json_data[i].id + '"></span>'
          + '<span id="dashboard_today_cost_' + json_data[i].id + '"></span>'
          + ' <span id="currency_today_span_' + json_data[i].id + '"></span><br>'
          + ' </td>';
      }

      dashboardHTML += '<br><h5>Today\'s earnings:</h5>'
        + '<table class="table table-bordered table-responsive-xl align-middle">'
        + '<thead>'
        + '  <tr>'
        + '  <th>Today</th>'
        + thead_tr_th_list
        + '  </tr>'
        + '</thead>'
        + ' <tr>'
        + ' <td id="dashboard_today_td_all_students"></td>'
        + empty_td_today
        + ' </tr>'
        + '</tbody>'
        + '</table>';
    }

    document.getElementById("dashboard").innerHTML = dashboardHTML;
    //Создаем отдельное вложение в td общего
    document.getElementById("dashboard_td_all_students").innerHTML = ''
      + ' <span id="done_span_all"></span>'
      + '<span id="dashboard_quantity_all_students"></span><br>'

      + ' <span id="cost_span_all"></span>'
      + '<span id="dashboard_cost_all_students"></span>'
      + ' <span id="currency_span_all"></span><br>'

    // Создаем содержимое для общей ячейки таблицы за сегодня (если таблица существует)
    if (info === 0 && document.getElementById("dashboard_today_td_all_students")) {
      document.getElementById("dashboard_today_td_all_students").innerHTML = ''
        + ' <span id="done_today_span_all"></span>'
        + '<span id="dashboard_today_quantity_all_students"></span><br>'
        + ' <span id="cost_today_span_all"></span>'
        + '<span id="dashboard_today_cost_all_students"></span>'
        + ' <span id="currency_today_span_all"></span><br>'
    }
    // Добавляем кнопку очищения вместо инпутов и кнопки которая была
    document.getElementById("inputs_of_dashboards").innerHTML = '';
    document.getElementById("ModalFooter").innerHTML = ''
      + '      <button class="btn btn-outline-secondary rounded-pill" onclick="clearDashboard()">Clear</button>'
      + '      <button class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">Close</button>';
    let cost_for_1_lesson;

    for (let i = 0; i < json_lessons.length; i++) {

      let date_for_current_lesson = json_lessons[i].date.split("_");


      if (Number(date_for_current_lesson[0]) >= Number(day_input_start_number) && Number(date_for_current_lesson[0]) <= Number(day_input_end_number)) {

        if (json_lessons[i].lesson_type == 3) {
          document.getElementById("done_span_" + json_lessons[i].student_id + "").innerHTML = 'Done - ';
          document.getElementById("done_span_all").innerHTML = 'Done - ';
          document.getElementById("dashboard_quantity_" + json_lessons[i].student_id).innerHTML = document.getElementById("dashboard_quantity_" + json_lessons[i].student_id).innerHTML++ + 1;
          document.getElementById("dashboard_quantity_all_students").innerHTML = document.getElementById("dashboard_quantity_all_students").innerHTML++ + 1;



          cost_for_1_lesson = json_lessons[i].cost.match(/\d+/)[0]
          document.getElementById("cost_span_" + json_lessons[i].student_id + "").innerHTML = 'Got - ';
          document.getElementById('cost_span_all').innerHTML = 'Got - '
          document.getElementById("dashboard_cost_" + json_lessons[i].student_id).innerHTML = document.getElementById("dashboard_cost_" + json_lessons[i].student_id).innerHTML++ + Number(cost_for_1_lesson);
          document.getElementById("dashboard_cost_all_students").innerHTML = document.getElementById("dashboard_cost_all_students").innerHTML++ + Number(cost_for_1_lesson);

          document.getElementById("currency_span_" + json_lessons[i].student_id + "").innerHTML = "₴";
          document.getElementById("currency_span_all").innerHTML = "₴";

        }
      }
    }

    // Добавляем обработку данных за сегодня (только при первом открытии модального окна)
    if (info === 0) {
      const today = new Date();
      const todayDay = today.getDate();
      const todayMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
      const todayYear = today.getFullYear();

      // Проверяем, соответствует ли текущий месяц календаря сегодняшней дате
      if (Number(number_month_of_calendar) === todayMonth && Number(number_year_of_calendar) === todayYear) {
        
        for (let i = 0; i < json_lessons.length; i++) {
          let date_for_current_lesson = json_lessons[i].date.split("_");
          
          // Проверяем, является ли урок сегодняшним
          if (Number(date_for_current_lesson[0]) === todayDay) {
            
            if (json_lessons[i].lesson_type == 3) {
              // Обновляем элементы для отдельных студентов
              if (document.getElementById("done_today_span_" + json_lessons[i].student_id)) {
                document.getElementById("done_today_span_" + json_lessons[i].student_id).innerHTML = 'Done - ';
                document.getElementById("dashboard_today_quantity_" + json_lessons[i].student_id).innerHTML = document.getElementById("dashboard_today_quantity_" + json_lessons[i].student_id).innerHTML++ + 1;
                
                cost_for_1_lesson = json_lessons[i].cost.match(/\d+/)[0];
                document.getElementById("cost_today_span_" + json_lessons[i].student_id).innerHTML = 'Got - ';
                document.getElementById("dashboard_today_cost_" + json_lessons[i].student_id).innerHTML = document.getElementById("dashboard_today_cost_" + json_lessons[i].student_id).innerHTML++ + Number(cost_for_1_lesson);
                document.getElementById("currency_today_span_" + json_lessons[i].student_id).innerHTML = "₴";
              }
              
              // Обновляем общие элементы для всех студентов
              if (document.getElementById("done_today_span_all")) {
                document.getElementById("done_today_span_all").innerHTML = 'Done - ';
                document.getElementById("dashboard_today_quantity_all_students").innerHTML = document.getElementById("dashboard_today_quantity_all_students").innerHTML++ + 1;
                document.getElementById("cost_today_span_all").innerHTML = 'Got - ';
                document.getElementById("dashboard_today_cost_all_students").innerHTML = document.getElementById("dashboard_today_cost_all_students").innerHTML++ + Number(cost_for_1_lesson);
                document.getElementById("currency_today_span_all").innerHTML = "₴";
              }
            }
          }
        }
      }
    }
  } else {
    alert("Something wrong, check what is set in day fields")
  }


}
function open_modal_chart() {
  // Открываем модульное окно
  $('#myModal-big').modal('toggle')

  //Записываем данные в модальное окно 
  document.getElementById("ModalLabel-big").innerHTML = "Chart dashboard";
  document.getElementById("ModalBody-big").innerHTML = ''
    + '<div id="chart_content">'
    + '    <div id="chart_block_1">'
    + '      <div class="line_chart";">'
    + '              <p>Quantity of lessons per day</p>'
    + '              <canvas id="myChart"></canvas>'
    + '      </div>'
    + '    </div>'
    + '    <div id="chart_block_2">'
    + '          <div class="pie_chart";">'
    + '              <p>Quantity of all lessons per types</p>'
    + '              <canvas id="myChart2"></canvas>'
    + '          </div>'
    + '          <div class="pie_chart";">'
    + '              <p>Quantity of Done lessons per students</p>'
    + '              <canvas id="myChart3"></canvas>'
    + '          </div>'
    + '    </div>'
    + '  </div>'
  document.getElementById("ModalFooter-big").innerHTML = ''
    + '      <button class="btn btn-secondary rounded-pill" data-bs-dismiss="modal">Close</button>';

  // 1 ДЕШБОРД
  // Создаем переменную в которой будет функция вычисления дней на текущий месяц
  const getAllDaysInMonth_function = (month, year) =>
    Array.from(
      // Считаем разницу между первым днем следующего месяца и первым днем текущего
      { length: new Date(year, month, 0).getDate() }, // получаем следующий месяц, (нулевой индекс)
      (_, i) => new Date(year, month - 1, i + 1)    // получаем текущий месяц (нулевой индекс)
    );

  // Собираем массив дней для открытого месяца для первого дешборда
  const allDatesIncurrentMonth_UTC = getAllDaysInMonth_function(today_date.getMonth() + 1, today_date.getFullYear())

  // Оставляем только нужную информацию в нужно языке для первого дешборда
  const AllDaysToCurrentMonth = allDatesIncurrentMonth_UTC.map(x => x.toLocaleDateString(['en-US'], { day: "numeric", weekday: "short" }))

  // Создаем массив по количеству дней в месяце для первого дешборда
  let quantity_of_lessons_ctx = new Array(AllDaysToCurrentMonth.length);
  // Заполняем каждый день нулем
  quantity_of_lessons_ctx.fill(0)

  for (let i = 0; i < json_lessons.length; i++) {
    // Проверяем 2-Проведенные 5-вводные 6-подарок
    if (json_lessons[i].lesson_type === '3' || json_lessons[i].lesson_type === '5' || json_lessons[i].lesson_type === '6') {
      quantity_of_lessons_ctx[Number(json_lessons[i].date.split("_")[0]) - 1] += Number(1)
    } else {
      // console.log('тип не тот')
    }
  }

  // 2 ДЕШБОРД
  let quantity_of_lessons_ctx2 = new Array(types_of_lessons_names.length);
  quantity_of_lessons_ctx2.fill(0)
  for (let i = 0; i < json_lessons.length; i++) {
    if (json_lessons[i].lesson_type === '7' || json_lessons[i].lesson_type === '8' || json_lessons[i].lesson_type === '9' || json_lessons[i].lesson_type === '10') {
      // console.log("не Подходит")
    } else {
      // lesson_type начинается с 1, но массив с 0, поэтому вычитаем 1
      const typeIndex = Number(json_lessons[i].lesson_type) - 1;
      if (typeIndex >= 0 && typeIndex < quantity_of_lessons_ctx2.length) {
        quantity_of_lessons_ctx2[typeIndex] += Number(1);
      }
    }
  }

  // 3 ДЕШБОРД
  let students_array_ctx3 = [];
  let lessons_by_students_ctx3_object;

  let lessons_by_students_ctx3_array = new Array(json_data.length);
  lessons_by_students_ctx3_array.fill(0)
  for (let i = 0; i < json_data.length; i++) {
    if (json_data === undefined) {
      // console.log("undefind")
    } else {
      lessons_by_students_ctx3_object = json_lessons.filter(x => Number(x.student_id) === json_data[i].id);
      for (let i2 = 0; i2 < lessons_by_students_ctx3_object.length; i2++) {
        if (lessons_by_students_ctx3_object[i2].lesson_type === '3') {
          lessons_by_students_ctx3_array[i] += Number(1)
          // console.log("Подходит")
        } else {
          // console.log("Не Подходит")
        }

      }

      students_array_ctx3.push(json_data[i].name)
    }
  }


  // Переменные дешбордов
  const ctx = document.getElementById('myChart');
  const ctx2 = document.getElementById('myChart2');
  const ctx3 = document.getElementById('myChart3');


  //1 дешборд 
  new Chart(ctx,
    {
      type: 'line',
      data: {
        labels: AllDaysToCurrentMonth,
        datasets: [{
          label: 'lessons',
          data: quantity_of_lessons_ctx,
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false
          },
        },
        interaction: {
          intersect: false,
          axis: 'x'
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    }
  );

  //2 дешборд 
  new Chart(ctx2,
    {
      type: 'pie',
      data: {
        labels: types_of_lessons_names,
        datasets: [{
          label: 'lessons',
          data: quantity_of_lessons_ctx2,
          borderWidth: 1,
          backgroundColor: [
            '#FED6BC',
            '#FFFADD',
            '#DEF7FE',
            '#E7ECFF',
            '#C3FBD8',
            '#FDEED9',
            '#F6FFF8',
            '#B5F2EA',
            '#C6D8FF'
          ],
          borderColor: [
            '#02315E',
          ],
        }]
      },
      options: {
        layout: {
          padding: {
            left: 0,
            right: 0
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          labels: {
            render: (args) => {
              if (args.percentage > 0) {
                return `${args.percentage}%`
              }
            },
            position: "inside"
          }
        }
      }
    }
  );

  //3 дешборд 
  new Chart(ctx3,
    {
      type: 'pie',
      data: {
        labels: students_array_ctx3,
        datasets: [{
          label: 'lessons',
          data: lessons_by_students_ctx3_array,
          borderWidth: 1,
          backgroundColor: [
            '#FED6BC',
            '#FFFADD',
            '#DEF7FE',
            '#E7ECFF',
            '#C3FBD8',
            '#FDEED9',
            '#F6FFF8',
            '#B5F2EA',
            '#C6D8FF'
          ],
          borderColor: [
            '#02315E',
          ],
          datalabels: {
            color: '#FFCE56'
          }
        }]
      },
      options: {
        layout: {
          padding: {
            left: 0,
            right: 0
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          labels: {
            render: (args) => {
              if (args.percentage > 0) {
                return `${args.percentage}%`
              }
            },
            position: "inside"
          }
        }
      }
    }
  );

}

//Функция для скрытия столбика пользователя
function hide_row_of_student(id) {

  let student_id = id;

  document.getElementById('style_from_js').innerHTML += ''
    + '#calendar #student_top_th_' + student_id + '{'
    + '  display: none;'
    + '}'
    + '.student_td_' + student_id + '{'
    + '  display: none;'
    + '}'
}
//Функция для показа дней рождений учеников
function show_bday_of_students() {

  let date_of_birthday;
  let cell_of_birthday;
  let turn_years;

  for (let i = 0; i < json_data.length; i++) {
    if (!json_data[i].birthday || json_data[i].birthday === "" || json_data[i].birthday === undefined || json_data[i].birthday === null) {
      //не подходят - birthday пустое, null или undefined
    } else {
      try {
        date_of_birthday = json_data[i].birthday.split("-");
        if (date_of_birthday[1] == number_month_of_calendar) {
          cell_of_birthday = json_data[i].birthday.split("-")[2] + '_' + json_data[i].id;

          const element = document.getElementById(cell_of_birthday);
          if (element) {
            element.setAttribute('style', 'background-image: url("https://cdn-icons-png.flaticon.com/512/3728/3728957.png"); background-size: 25px; background-repeat: no-repeat; background-position-y: top; background-position-x: right;');
            turn_years = number_year_of_calendar - Number(json_data[i].birthday.split("-")[0]);
            element.setAttribute('title', 'turns ' + turn_years);
          }
        }
      } catch (error) {
        console.warn('Error processing birthday for student', json_data[i].id, ':', error);
      }
    }
  }
}

// Функции по редактору стилей в календаре
async function set_style_calendar(curent_day_color) {
  try {
    // Используем новую функцию для получения стилей
    const data = await funct_get_style();
    json_color_style = data;

    //Очистка стиля выделения дня
    document.getElementById('style_from_js').innerHTML = '';

    // Установка цветов для календаря из bd если на єтот месяц есть
    if (data.length > 0) {
      // Получаем стили из поля styles
      const styles = data[0].styles || {};
      
      //Проверка если месяц текущий выделять цветом текущий день
      if (curent_day_color !== "nofull" && curent_day_color == "full") {
        document.getElementById('style_from_js').innerHTML = '#calendar tbody tr .m_d_' + number_day_of_calendar + '{background: ' + styles.curent_day_light_color + '; border: 1px solid ' + styles.curent_day_dark_color + ';}'
          + '#calendar tbody tr .m_d_' + number_day_of_calendar + '{'
          + 'color: ' + styles.curent_day_text_color + ';'
          + '}';
      }

      document.getElementById("color_of_month").innerHTML = ''
        + '#calendar tbody tr .day_of_month,'
        + '.month_day_td:hover,'
        + 'thead tr .student_top_th,'
        + 'thead tr .student_top_th_add_new{'
        + '  background: ' + styles.calendar_light_color + ';'
        + '}'
        + '#calendar .student_top_th_month,'
        + '#calendar .table-color,'
        + 'thead tr .student_top_th:hover,'
        + 'thead tr .student_top_th_month,'
        + '#calendar tbody tr .m_d_' + number_day_of_calendar + ':hover,'
        + '#calendar tbody tr .day_of_month:hover,'
        + '.popover-header'
        + '{'
        + '  background: ' + styles.calendar_dark_color + ';'
        + '}'
        + '#backup_link:hover,'
        + '.fa-chevron-left:hover,'
        + '.fa-chevron-right:hover,'
        + '.fa-chevron-up:hover,'
        + '.fa-chevron-down:hover,'
        + '#today_day_of_week_anchor:hover,'
        + '.top_sign .fa-2xl:hover,'
        + '#information_about_calendar h2 span:hover{'
        + '  color: ' + styles.calendar_dark_color + ';'
        + '}'
        + '#i_hide_row_student:hover{'
        + '  color: ' + styles.calendar_light_color + ';'
        + '}'
        + '#btn_add_from_all:hover, #btn_add_add_new:hover{'
        + '  color: #000000;'
        + '  background-color: ' + styles.calendar_dark_color + ';'
        + '}'
        + 'body{'
        + 'background-color: ' + styles.behind_table_color_background + ';'
        + 'background-image: linear-gradient(rgba(255,255,255,' + (1 - (styles.background_picture_opacity || 1)) + '), rgba(255,255,255,' + (1 - (styles.background_picture_opacity || 1)) + ')), url("' + styles.background_picture_link + '");'
        + 'background-size: ' + styles.background_picture_size + ';'
        + 'background-position: ' + styles.background_picture_position + ';'
        + 'background-repeat: ' + styles.background_picture_repeat + ';'
        + '}'
        + '#calendar table{'
        + '  background-color: ' + styles.table_color_background + ';'
        + '}'
        + '#calendar .student_top_th_month {'
        + 'background-image: linear-gradient(rgba(255,255,255,' + (1 - (styles.background_month_picture_opacity || 1)) + '), rgba(255,255,255,' + (1 - (styles.background_month_picture_opacity || 1)) + ')), url("' + styles.background_month_picture_link + '");'
        + 'background-size: ' + styles.background_month_picture_size + ';'
        + 'background-position: ' + styles.background_month_picture_position + ';'
        + 'background-repeat: ' + styles.background_month_picture_repeat + ';'
        + '}'
        + '#calendar .student_top_th_month span{'
        + 'color: ' + styles.color_name_of_month + ';'
        + (styles.month_stroke_enable == '1' ? 
           'text-shadow: -' + (styles.month_stroke_size || '1px') + ' -' + (styles.month_stroke_size || '1px') + ' 0 ' + (styles.month_stroke_color || '#000000') + ', ' +
           (styles.month_stroke_size || '1px') + ' -' + (styles.month_stroke_size || '1px') + ' 0 ' + (styles.month_stroke_color || '#000000') + ', ' +
           '-' + (styles.month_stroke_size || '1px') + ' ' + (styles.month_stroke_size || '1px') + ' 0 ' + (styles.month_stroke_color || '#000000') + ', ' +
           (styles.month_stroke_size || '1px') + ' ' + (styles.month_stroke_size || '1px') + ' 0 ' + (styles.month_stroke_color || '#000000') + ';' 
           : '')
        + '}'
        + '#calendar thead,'
        + '#calendar .day_of_month{'
        + 'color: ' + styles.text_color_head_of_table + ';'
        + '}'
        + '#calendar tbody{'
        + 'color: ' + styles.text_color_body_of_table + ';'
        + '}'
        + '#information_about_calendar h2 span,'
        + '#information_about_calendar h2 button,'
        + '#menu_container_right button,'
        + '#menu_container_left button,'
        + '#information_about_calendar h3 a,'
        + '#return_to_top_div a,'
        + '#return_to_bottom_div a{'
        + 'color: ' + styles.top_panel_text_color + ';'
        + '}';

    } else {

      //Проверка если месяц текущий выделять цветом текущий день
      if (curent_day_color !== "nofull" && curent_day_color == "full") {
        document.getElementById('style_from_js').innerHTML = '#calendar tbody tr .m_d_' + number_day_of_calendar + '{background: #ffffff; border: 1px solid #616161;}'
          + '#calendar tbody tr .m_d_' + number_day_of_calendar + '{'
          + 'color: #000000;'
          + '}';
      }

      document.getElementById("color_of_month").innerHTML = ''
        + '#calendar tbody tr .day_of_month,'
        + '.month_day_td:hover,'
        + 'thead tr .student_top_th,'
        + 'thead tr .student_top_th_add_new{'
        + '  background: #FFFFFF;'
        + '}'
        + '#calendar .student_top_th_month,'
        + '#calendar .table-color,'
        + 'thead tr .student_top_th:hover,'
        + 'thead tr .student_top_th_month,'
        + '#calendar tbody tr .day_of_month:hover,'
        + '.popover-header'
        + '{'
        + '  background: #B0B0B0;'
        + '}'
        + '#backup_link:hover,'
        + '.fa-chevron-left:hover,'
        + '.fa-chevron-right:hover,'
        + '.fa-chevron-up:hover,'
        + '.fa-chevron-down:hover{'
        + '  color: #B0B0B0;'
        + '}'
        + 'body{'
        + 'background-color: #FFFFFF;'
        + 'background-image: none;'
        + 'background-size: none;'
        + 'background-position: none;'
        + 'background-repeat: no-repeat;'
        + '}'
        + '#calendar table{'
        + '  background-color: #FFFFFF;'
        + '}'
        + '#calendar .student_top_th_month {'
        + 'background-image: none;'
        + 'background-size: none;'
        + 'background-position: none;'
        + 'background-repeat: no-repeat;'
        + '}'
        + '#calendar .student_top_th_month span{'
        + 'color: #000000;'
        + '}'
        + '#calendar thead{'
        + 'color: #000000;'
        + '}'
        + '#calendar tbody{'
        + 'color: #000000;'
        + '}'
        + '#information_about_calendar h2 span,'
        + '#information_about_calendar h2 button,'
        + '#menu_container_right button,'
        + '#menu_container_left button,'
        + '#information_about_calendar h3 a,'
        + '#return_to_top_div a,'
        + '#return_to_bottom_div a{'
        + 'color: #000000;'
        + '}';
    }
  } catch (error) {
    console.error('Error loading styles:', error);
    // Применить стили по умолчанию при ошибке
    document.getElementById('style_from_js').innerHTML = '';
    document.getElementById("color_of_month").innerHTML = '';
  }
}
function open_modal_style() {
  $('#myModal').modal('toggle')

  // Получаем стили из поля styles или используем значения по умолчанию
  const styles = (json_color_style.length > 0 && json_color_style[0].styles) ? json_color_style[0].styles : {};
  
  document.getElementById('ModalLabel').innerHTML = 'Style settings';
  document.getElementById('ModalBody').innerHTML = ''

      + '<h6 class="text-center">Main background</h6>'
      + '<div class="list-group-item">'
      + '<div class="d-flex flex-row justify-content-between">'
      + '<label class="form-label" style="width: 80%">Main background color </label>'
      + '<input id="back_b_t_c" class="w-10" type="color" value="' + (styles.behind_table_color_background || '#FFFFFF') + '"></div>'

      + '<div class="d-flex flex-row justify-content-between">'
      + '<label class="form-label" style="width: 80%">Top panel text color </label>'
      + '<input id="top_p_t_c" class="w-10" type="color" value="' + (styles.top_panel_text_color || '#000000') + '"></div>'

      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width:70%">Main background picture link </label>'
      + '<input id="back_p_l" style="width: 30%" type="url" placeholder="link to image..." value="' + (styles.background_picture_link || '') + '"></div>'
      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width: 70%">Main background opacity</label>'
      + '<select id="back_p_opacity" class="form-control-sm" style="width: 30%">'
      + '<option value="0" ' + (styles.background_picture_opacity == '0' ? 'selected' : '') + '>0%</option>'
      + '<option value="0.1" ' + (styles.background_picture_opacity == '0.1' ? 'selected' : '') + '>10%</option>'
      + '<option value="0.2" ' + (styles.background_picture_opacity == '0.2' ? 'selected' : '') + '>20%</option>'
      + '<option value="0.3" ' + (styles.background_picture_opacity == '0.3' ? 'selected' : '') + '>30%</option>'
      + '<option value="0.4" ' + (styles.background_picture_opacity == '0.4' ? 'selected' : '') + '>40%</option>'
      + '<option value="0.5" ' + (styles.background_picture_opacity == '0.5' ? 'selected' : '') + '>50%</option>'
      + '<option value="0.6" ' + (styles.background_picture_opacity == '0.6' ? 'selected' : '') + '>60%</option>'
      + '<option value="0.7" ' + (styles.background_picture_opacity == '0.7' ? 'selected' : '') + '>70%</option>'
      + '<option value="0.8" ' + (styles.background_picture_opacity == '0.8' ? 'selected' : '') + '>80%</option>'
      + '<option value="0.9" ' + (styles.background_picture_opacity == '0.9' ? 'selected' : '') + '>90%</option>'
      + '<option value="1" ' + ((styles.background_picture_opacity || '1') == '1' ? 'selected' : '') + '>100%</option>'
      + '</select></div>'

      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width:70%">Main background picture size </label>'
      + '<select id="back_p_s" class="form-control-sm" style="width: 30%">'
      + '<option value="none" ' + ((styles.background_picture_size || 'cover') == 'none' ? 'selected' : '') + '>none</option>'
      + '<option value="auto" ' + ((styles.background_picture_size || 'cover') == 'auto' ? 'selected' : '') + '>auto</option>'
      + '<option value="contain" ' + ((styles.background_picture_size || 'cover') == 'contain' ? 'selected' : '') + '>contain</option>'
      + '<option value="cover" ' + ((styles.background_picture_size || 'cover') == 'cover' ? 'selected' : '') + '>cover</option>'
      + '<option value="10px" ' + ((styles.background_picture_size || 'cover') == '10px' ? 'selected' : '') + '>10px</option>'
      + '<option value="50px" ' + ((styles.background_picture_size || 'cover') == '50px' ? 'selected' : '') + '>50px</option>'
      + '<option value="100px" ' + ((styles.background_picture_size || 'cover') == '100px' ? 'selected' : '') + '>100px</option>'
      + '<option value="200px" ' + ((styles.background_picture_size || 'cover') == '200px' ? 'selected' : '') + '>200px</option>'
      + '<option value="400px" ' + ((styles.background_picture_size || 'cover') == '400px' ? 'selected' : '') + '>400px</option>'
      + '<option value="600px" ' + ((styles.background_picture_size || 'cover') == '600px' ? 'selected' : '') + '>600px</option>'
      + '<option value="800px" ' + ((styles.background_picture_size || 'cover') == '800px' ? 'selected' : '') + '>800px</option>'
      + '<option value="1000px" ' + ((styles.background_picture_size || 'cover') == '1000px' ? 'selected' : '') + '>1000px</option>'
      + '</select>'
      + '</div>'

      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width:70%">Main background picture position</label>'
      + '<select id="back_p_p" class="form-control-sm" style="width: 30%">'
      + '<option value="none" ' + ((styles.background_picture_position || 'center') == 'none' ? 'selected' : '') + '>none</option>'
      + '<option value="bottom" ' + ((styles.background_picture_position || 'center') == 'bottom' ? 'selected' : '') + '>bottom</option>'
      + '<option value="center" ' + ((styles.background_picture_position || 'center') == 'center' ? 'selected' : '') + '>center</option>'
      + '<option value="left" ' + ((styles.background_picture_position || 'center') == 'left' ? 'selected' : '') + '>left</option>'
      + '<option value="right" ' + ((styles.background_picture_position || 'center') == 'right' ? 'selected' : '') + '>right</option>'
      + '<option value="top" ' + ((styles.background_picture_position || 'center') == 'top' ? 'selected' : '') + '>top</option>'
      + '</select>'
      + '</div>'

      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width:70%">Main background picture repeat </label>'
      + '<select id="back_p_r" class="form-control-sm" style="width: 30%">'
      + '<option value="no-repeat" ' + ((styles.background_picture_repeat || 'no-repeat') == 'no-repeat' ? 'selected' : '') + '>no-repeat</option>'
      + '<option value="repeat" ' + ((styles.background_picture_repeat || 'no-repeat') == 'repeat' ? 'selected' : '') + '>repeat</option>'
      + '<option value="repeat-x" ' + ((styles.background_picture_repeat || 'no-repeat') == 'repeat-x' ? 'selected' : '') + '>repeat-x</option>'
      + '<option value="repeat-y" ' + ((styles.background_picture_repeat || 'no-repeat') == 'repeat-y' ? 'selected' : '') + '>repeat-y</option>'
      + '<option value="round" ' + ((styles.background_picture_repeat || 'no-repeat') == 'round' ? 'selected' : '') + '>round</option>'
      + '<option value="space" ' + ((styles.background_picture_repeat || 'no-repeat') == 'space' ? 'selected' : '') + '>space</option>'
      + '</select>'
      + '</div>'
      + '</div>'


      + '<h6 class="text-center pt-3">Calendar general colors</h6>'
      + '<div class="list-group-item">'
      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width: 80%" data-toggle="tooltip" data-placement="top" title="Color only for background of calendar">Color only for background of calendar</label>'
      + '<input id="table_c_b" class="w-10" type="color" value="' + (styles.table_color_background || '#FFFFFF') + '"></div>'
      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width: 80%" data-toggle="tooltip" data-placement="top" title="Color for background students and days of calendar">Calendar light color</label>'
      + '<input id="cal_l_c" class="w-10" type="color" value="' + (styles.calendar_light_color || '#F8F9FA') + '"></div>'
      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width: 80%" data-toggle="tooltip" data-placement="top" title="Calendar color of hover days, students and top panel">Calendar dark color</label>'
      + '<input id="cal_d_c" class="w-10" type="color" value="' + (styles.calendar_dark_color || '#E9ECEF') + '"></div>'
      + '</div>'

      + '<h6 class="text-center pt-3">Calendar text colors</h6>'
      + '<div class="list-group-item">'
      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width:90%">Color name of month</label>'
      + '<input id="col_n_o_m" class="w-10" type="color" value="' + (styles.color_name_of_month || '#000000') + '"></div>'
      
      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width: 70%">Month text stroke enable</label>'
      + '<select id="month_stroke_enable" class="form-control-sm" style="width: 30%">'
      + '<option value="0" ' + ((styles.month_stroke_enable || '0') == '0' ? 'selected' : '') + '>Disabled</option>'
      + '<option value="1" ' + (styles.month_stroke_enable == '1' ? 'selected' : '') + '>Enabled</option>'
      + '</select></div>'
      
      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width: 70%">Month text stroke size</label>'
      + '<select id="month_stroke_size" class="form-control-sm" style="width: 30%">'
      + '<option value="1px" ' + ((styles.month_stroke_size || '1px') == '1px' ? 'selected' : '') + '>1px</option>'
      + '<option value="2px" ' + (styles.month_stroke_size == '2px' ? 'selected' : '') + '>2px</option>'
      + '<option value="3px" ' + (styles.month_stroke_size == '3px' ? 'selected' : '') + '>3px</option>'
      + '<option value="4px" ' + (styles.month_stroke_size == '4px' ? 'selected' : '') + '>4px</option>'
      + '<option value="5px" ' + (styles.month_stroke_size == '5px' ? 'selected' : '') + '>5px</option>'
      + '</select></div>'
      
      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width: 80%">Month text stroke color</label>'
      + '<input id="month_stroke_color" class="w-10" type="color" value="' + (styles.month_stroke_color || '#000000') + '"></div>'
      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width:90%">Text color head of table</label>'
      + '<input id="tex_c_h_o_t" class="w-10" type="color" value="' + (styles.text_color_head_of_table || '#000000') + '"></div>'
      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width:90%">Text color body of table</label>'
      + '<input id="tex_c_b_o_t" class="w-10" type="color" value="' + (styles.text_color_body_of_table || '#000000') + '"></div>'
      + '</div>'

      + '<h6 class="text-center pt-3">Calendar current day colors</h6>'
      + '<div class="list-group-item">'
      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width: 80%">Curent day border </label>'
      + '<input id="cur_d_d_c" class="w-10" type="color" value="' + (styles.curent_day_dark_color || '#007BFF') + '"></div>'
      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width: 80%">Curent day background </label>'
      + '<input id="cur_d_l_c" class="w-10" type="color" value="' + (styles.curent_day_light_color || '#E3F2FD') + '"></div>'
      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width: 80%">Curent day text color</label>'
      + '<input id="cur_d_t_c" class="w-10" type="color" value="' + (styles.curent_day_text_color || '#000000') + '"></div>'
      + '</div>'

      + '<h6 class="text-center pt-3">Calendar background month icon</h6>'
      + '<div class="list-group-item">'
      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width: 70%">Background month picture link </label>'
      + '<input id="back_m_p_l" style="width: 30%;" type="url" placeholder="link to image..." value="' + (styles.background_month_picture_link || '') + '"></div>'
      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width: 70%">Month background opacity</label>'
      + '<select id="back_m_p_opacity" class="form-control-sm" style="width: 30%">'
      + '<option value="0" ' + (styles.background_month_picture_opacity == '0' ? 'selected' : '') + '>0%</option>'
      + '<option value="0.1" ' + (styles.background_month_picture_opacity == '0.1' ? 'selected' : '') + '>10%</option>'
      + '<option value="0.2" ' + (styles.background_month_picture_opacity == '0.2' ? 'selected' : '') + '>20%</option>'
      + '<option value="0.3" ' + (styles.background_month_picture_opacity == '0.3' ? 'selected' : '') + '>30%</option>'
      + '<option value="0.4" ' + (styles.background_month_picture_opacity == '0.4' ? 'selected' : '') + '>40%</option>'
      + '<option value="0.5" ' + (styles.background_month_picture_opacity == '0.5' ? 'selected' : '') + '>50%</option>'
      + '<option value="0.6" ' + (styles.background_month_picture_opacity == '0.6' ? 'selected' : '') + '>60%</option>'
      + '<option value="0.7" ' + (styles.background_month_picture_opacity == '0.7' ? 'selected' : '') + '>70%</option>'
      + '<option value="0.8" ' + (styles.background_month_picture_opacity == '0.8' ? 'selected' : '') + '>80%</option>'
      + '<option value="0.9" ' + (styles.background_month_picture_opacity == '0.9' ? 'selected' : '') + '>90%</option>'
      + '<option value="1" ' + ((styles.background_month_picture_opacity || '1') == '1' ? 'selected' : '') + '>100%</option>'
      + '</select></div>'

      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width: 70%">Background month picture size </label>'
      + '<select id="back_m_p_s" class="form-control-sm" style="width: 30%;">'
      + '<option value="none" ' + ((styles.background_month_picture_size || 'cover') == 'none' ? 'selected' : '') + '>none</option>'
      + '<option value="auto" ' + ((styles.background_month_picture_size || 'cover') == 'auto' ? 'selected' : '') + '>auto</option>'
      + '<option value="contain" ' + ((styles.background_month_picture_size || 'cover') == 'contain' ? 'selected' : '') + '>contain</option>'
      + '<option value="cover" ' + ((styles.background_month_picture_size || 'cover') == 'cover' ? 'selected' : '') + '>cover</option>'
      + '<option value="10px" ' + ((styles.background_month_picture_size || 'cover') == '10px' ? 'selected' : '') + '>10px</option>'
      + '<option value="50px" ' + ((styles.background_month_picture_size || 'cover') == '50px' ? 'selected' : '') + '>50px</option>'
      + '<option value="100px" ' + ((styles.background_month_picture_size || 'cover') == '100px' ? 'selected' : '') + '>100px</option>'
      + '<option value="200px" ' + ((styles.background_month_picture_size || 'cover') == '200px' ? 'selected' : '') + '>200px</option>'
      + '<option value="400px" ' + ((styles.background_month_picture_size || 'cover') == '400px' ? 'selected' : '') + '>400px</option>'
      + '<option value="600px" ' + ((styles.background_month_picture_size || 'cover') == '600px' ? 'selected' : '') + '>600px</option>'
      + '<option value="800px" ' + ((styles.background_month_picture_size || 'cover') == '800px' ? 'selected' : '') + '>800px</option>'
      + '<option value="1000px" ' + ((styles.background_month_picture_size || 'cover') == '1000px' ? 'selected' : '') + '>1000px</option>'
      + '</select>'
      + '</div>'

      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width:70%">Background month picture position</label>'
      + '<select id="back_m_p_p" class="form-control-sm" style="width: 30%">'
      + '<option value="none" ' + ((styles.background_month_picture_position || 'center') == 'none' ? 'selected' : '') + '>none</option>'
      + '<option value="bottom" ' + ((styles.background_month_picture_position || 'center') == 'bottom' ? 'selected' : '') + '>bottom</option>'
      + '<option value="center" ' + ((styles.background_month_picture_position || 'center') == 'center' ? 'selected' : '') + '>center</option>'
      + '<option value="left" ' + ((styles.background_month_picture_position || 'center') == 'left' ? 'selected' : '') + '>left</option>'
      + '<option value="right" ' + ((styles.background_month_picture_position || 'center') == 'right' ? 'selected' : '') + '>right</option>'
      + '<option value="top" ' + ((styles.background_month_picture_position || 'center') == 'top' ? 'selected' : '') + '>top</option>'
      + '</select>'
      + '</div>'

      + '<div class="d-flex flex-row justify-content-between align-items-center">'
      + '<label class="form-label" style="width:70%">Background month picture repeat</label>'
      + '<select id="back_m_p_r" class="form-control-sm" style="width: 30%">'
      + '<option value="no-repeat" ' + ((styles.background_month_picture_repeat || 'no-repeat') == 'no-repeat' ? 'selected' : '') + '>no-repeat</option>'
      + '<option value="repeat" ' + ((styles.background_month_picture_repeat || 'no-repeat') == 'repeat' ? 'selected' : '') + '>repeat</option>'
      + '<option value="repeat-x" ' + ((styles.background_month_picture_repeat || 'no-repeat') == 'repeat-x' ? 'selected' : '') + '>repeat-x</option>'
      + '<option value="repeat-y" ' + ((styles.background_month_picture_repeat || 'no-repeat') == 'repeat-y' ? 'selected' : '') + '>repeat-y</option>'
      + '<option value="round" ' + ((styles.background_month_picture_repeat || 'no-repeat') == 'round' ? 'selected' : '') + '>round</option>'
      + '<option value="space" ' + ((styles.background_month_picture_repeat || 'no-repeat') == 'space' ? 'selected' : '') + '>space</option>'
      + '</select>'
      + '</div>'

      + '</div>'


      + '</div>'



      + '<div class="list-group-item">'
      + '<div class="d-flex justify-content-center">'
      + '<button type="button" class="btn btn-outline-primary w-45 me-2" onclick="showProfile()">Profile</button>'
      + '<button type="button" class="btn btn-outline-danger w-45" onclick="logout()">Logout</button>'
      + '</div>'
      + '</div>';





    document.getElementById('ModalFooter').innerHTML = ''
      + (json_color_style.length > 0 ? 
          '    <input type="button" value="Change" class="btn btn-success rounded-pill" onclick="save_modal_style(' + json_color_style[0].id + ')">' +
          '    <input type="button" value="Delete Style" class="btn btn-danger rounded-pill" onclick="delete_modal_style(' + json_color_style[0].id + ')">' :
          '    <input type="button" value="Add new style" class="btn btn-success rounded-pill" onclick="save_modal_style(0)">')
      + '    <input type="button" value="Close" class="btn btn-secondary rounded-pill" data-bs-dismiss="modal"';
  // Добавляем обработчики для color input элементов, чтобы скрывать модальное при использовании пипетки
  setTimeout(() => {
    setupColorPickerEyedropperSupport();
  }, 100);
}

// Функция для настройки поддержки пипетки в color picker
function setupColorPickerEyedropperSupport() {
  const colorInputs = document.querySelectorAll('#myModal input[type="color"]');
  
  // Проверяем поддержку EyeDropper API
  if (!('EyeDropper' in window)) {
    return; // Если API не поддерживается, ничего не делаем
  }
  
  colorInputs.forEach(input => {
    // Создаем кнопку-пипетку
    const eyedropperBtn = document.createElement('button');
    eyedropperBtn.innerHTML = '<i class="fa-solid fa-eye-dropper"></i>'; // Иконка пипетки FontAwesome
    eyedropperBtn.className = 'btn btn-sm btn-outline-secondary ms-1';
    eyedropperBtn.style.padding = '2px 6px';
    eyedropperBtn.style.fontSize = '12px';
    eyedropperBtn.title = 'Pick color from screen';
    eyedropperBtn.type = 'button';
    
    // Вставляем кнопку после input
    input.parentNode.insertBefore(eyedropperBtn, input.nextSibling);
    
    // Обработчик клика по кнопке-пипетке
    eyedropperBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        const modal = document.getElementById('myModal');
        const backdrop = document.querySelector('.modal-backdrop');
        
        // Скрываем модальное окно и затемнение
        if (modal && modal.classList.contains('show')) {
          modal.style.visibility = 'hidden';
          modal.style.opacity = '0';
        }
        
        if (backdrop) {
          backdrop.style.visibility = 'hidden';
          backdrop.style.opacity = '0';
        }
        
        // Создаем экземпляр EyeDropper
        const eyeDropper = new EyeDropper();
        
        // Открываем пипетку
        const result = await eyeDropper.open();
        
        // Устанавливаем выбранный цвет
        input.value = result.sRGBHex;
        
        // Восстанавливаем модальное окно и затемнение
        if (modal) {
          modal.style.visibility = '';
          modal.style.opacity = '';
        }
        
        if (backdrop) {
          backdrop.style.visibility = '';
          backdrop.style.opacity = '';
        }
        
        // Запускаем событие change для input
        input.dispatchEvent(new Event('change', { bubbles: true }));
        
      } catch (err) {
        // Пользователь отменил выбор или произошла ошибка
        const modal = document.getElementById('myModal');
        const backdrop = document.querySelector('.modal-backdrop');
        
        if (modal) {
          modal.style.visibility = '';
          modal.style.opacity = '';
        }
        
        if (backdrop) {
          backdrop.style.visibility = '';
          backdrop.style.opacity = '';
        }
      }
    });
  });
}

async function save_modal_style(id_of_style) {
  let calendar_light_color = document.getElementById("cal_l_c").value;
  let calendar_dark_color = document.getElementById("cal_d_c").value;
  let curent_day_dark_color = document.getElementById("cur_d_d_c").value;
  let curent_day_light_color = document.getElementById("cur_d_l_c").value;
  let curent_day_text_color = document.getElementById("cur_d_t_c").value;
  let behind_table_color_background = document.getElementById("back_b_t_c").value;
  let table_color_background = document.getElementById("table_c_b").value;
  let top_panel_text_color = document.getElementById("top_p_t_c").value;

  let background_month_picture_link = document.getElementById("back_m_p_l").value;
  let background_month_picture_opacity = document.getElementById("back_m_p_opacity").value;
  let background_month_picture_size = document.getElementById("back_m_p_s").value;
  let background_month_picture_position = document.getElementById("back_m_p_p").value;
  let background_month_picture_repeat = document.getElementById("back_m_p_r").value;

  let color_name_of_month = document.getElementById("col_n_o_m").value;
  let month_stroke_enable = document.getElementById("month_stroke_enable").value;
  let month_stroke_size = document.getElementById("month_stroke_size").value;
  let month_stroke_color = document.getElementById("month_stroke_color").value;
  let text_color_head_of_table = document.getElementById("tex_c_h_o_t").value;
  let text_color_body_of_table = document.getElementById("tex_c_b_o_t").value;

  let background_picture_link = document.getElementById("back_p_l").value;
  let background_picture_opacity = document.getElementById("back_p_opacity").value;
  let background_picture_size = document.getElementById("back_p_s").value;
  let background_picture_position = document.getElementById("back_p_p").value;
  let background_picture_repeat = document.getElementById("back_p_r").value;

  // Создаем объект с данными стиля для API
  const styles = {
    "calendar_light_color": calendar_light_color,
    "calendar_dark_color": calendar_dark_color,
    "curent_day_dark_color": curent_day_dark_color,
    "curent_day_light_color": curent_day_light_color,
    "curent_day_text_color": curent_day_text_color,
    "behind_table_color_background": behind_table_color_background,
    "top_panel_text_color": top_panel_text_color,
    "table_color_background": table_color_background,
    "background_month_picture_link": background_month_picture_link,
    "background_month_picture_opacity": background_month_picture_opacity,
    "background_month_picture_size": background_month_picture_size,
    "background_month_picture_position": background_month_picture_position,
    "background_month_picture_repeat": background_month_picture_repeat,
    "color_name_of_month": color_name_of_month,
    "month_stroke_enable": month_stroke_enable,
    "month_stroke_size": month_stroke_size,
    "month_stroke_color": month_stroke_color,
    "text_color_head_of_table": text_color_head_of_table,
    "text_color_body_of_table": text_color_body_of_table,
    "background_picture_link": background_picture_link,
    "background_picture_opacity": background_picture_opacity,
    "background_picture_size": background_picture_size,
    "background_picture_position": background_picture_position,
    "background_picture_repeat": background_picture_repeat,
  };

  try {
    // Анимация загрузки
    modal_loading_animation();

    if (id_of_style == 0) {
      // Создание нового стиля - используем правильную структуру
      const dataToSend = {
        date: number_month_of_calendar + "_" + number_year_of_calendar,
        styles: styles
      };
      const result = await createStyle(dataToSend);
    } else {
      // Обновление существующего стиля - используем правильную структуру
      const dataToSend = {
        date: number_month_of_calendar + "_" + number_year_of_calendar,
        styles: styles
      };
      console.log('Updating style with data:', dataToSend);
      const result = await updateStyle(id_of_style, dataToSend);
      console.log('Style updated successfully:', result);
    }

    // Закрыть модальное окно и обновить страницу
    $('#myModal').modal('toggle');
    Start_onload();

  } catch (error) {
    console.error('Error saving style:', error);
    // Можете добавить уведомление об ошибке для пользователя
    alert('Error saving style: ' + error.message);
  }
}

async function delete_modal_style(id_of_style) {
  const confirmDelete = confirm(`Delete style for month ${number_month_of_calendar}_${number_year_of_calendar}? This action cannot be undone.`);
  if (!confirmDelete) {
    return;
  }

  try {
    // Анимация загрузки
    modal_loading_animation();

    // Удаляем стиль
    await deleteStyle(id_of_style);
    console.log('Style deleted successfully');

    // Закрыть модальное окно и обновить страницу
    $('#myModal').modal('toggle');
    Start_onload();

  } catch (error) {
    console.error('Error deleting style:', error);
    alert('Error deleting style: ' + error.message);
  }
}

//Функция скрывания бокового меню
function show_buttons_add_students() {
  let added_item_button = document.getElementById('student_top_th_add_new');
  let actualDisplay = getComputedStyle(added_item_button).display;
  if (actualDisplay == 'none') {
    added_item_button.style.display = 'table-cell';
  } else {
    added_item_button.style.display = 'none';
  }
}
// //Функция скрывания кнопки логин
// function toggleButtonVisibility() {
//   var input = document.getElementById("password_input");
//   var button = document.getElementById("password_button");

//   // Показывать кнопку, если в инпуте есть текст
//   if (input.value.trim() !== "") {
//     button.style.display = "inline-block";
//   } else {
//     button.style.display = "none";
//   }
// }

//Функция поддержания календаря онлайн
function funct_check_status() {


  let i = 0;
  function Check_Loop() {
    setTimeout(function () {
      i++;
      if (i > -1) {
        return new Promise(function (resolve, reject) {
          $.ajax({
            url: link_status + '/1',
            method: 'get',
            dataType: 'json',
            success: function (data) {
              resolve(data) // Разрешает промис и запускает then()
              Check_Loop();
            },
            error: function (err) {
              reject(err) // Запрещает промис и запускает catch()
            }
          });
        });

      }
    }, 240000) //4 минуты
  }

  Check_Loop();
}



