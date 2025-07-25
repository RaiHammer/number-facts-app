document.addEventListener("DOMContentLoaded", function () {
  const numberInput = document.getElementById("numberInput");
  const factType = document.getElementById("factType");
  const getFactBtn = document.getElementById("getFactBtn");
  const loading = document.getElementById("loading");
  const resultContainer = document.getElementById("resultContainer");
  const userInputInfo = document.getElementById("userInputInfo");
  const factsList = document.getElementById("factsList");
  const numberError = document.getElementById("numberError");

  getFactBtn.addEventListener("click", async function () {
    // Сброс предыдущих ошибок
    numberError.textContent = "";
    numberError.classList.add("hidden");

    // Проверка ввода
    const number = numberInput.value.trim();
    const type = factType.value;

    if (number && isNaN(number)) {
      numberError.textContent = "Число должно быть в виде цифры";
      numberError.classList.remove("hidden");
      return;
    }

    // Показать загрузку
    loading.classList.remove("hidden");
    resultContainer.classList.add("hidden");

    try {
      // Получение фактов
      const facts = await getNumberFacts(number, type);

      // Отображение результатов
      displayResults(number, type, facts);

      // Скрыть загрузку, показать результаты
      loading.classList.add("hidden");
      resultContainer.classList.remove("hidden");
    } catch (error) {
      console.error("Ошибка:", error);
      loading.classList.add("hidden");
      numberError.textContent =
        "Произошла ошибка при получении данных. Пожалуйста, попробуйте еще раз.";
      numberError.classList.remove("hidden");
    }
  });

  async function getNumberFacts(number, type) {
    const baseUrl = "http://numbersapi.com";
    let urls = [];

    if (type === 'date') {
        if (!number.includes('/')) {
            throw new Error('Для фактов о дате используйте формат: месяц/день (например, 12/31)');
        }
        
        const [month, day] = number.split('/');
        if (isNaN(month) || isNaN(day)) {
            throw new Error('Месяц и день должны быть числами (например, 2/14)');
        }
        
        if (month < 1 || month > 12) {
            throw new Error('Месяц должен быть от 1 до 12');
        }
        
        if (day < 1 || day > 31) {
            throw new Error('День должен быть от 1 до 31');
        }
    }

    // Если число не указано, получаем случайное
    if (!number) {
      urls.push(`${baseUrl}/random/${type}?json`);
    } else {
      // Для даты проверяем формат (месяц/день)
      if (type === "date") {
        const parts = number.split("/");
        if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
          throw new Error(
            'Для фактов о дате введите число в формате "месяц/день", например "12/31"'
          );
        }
      }

      urls.push(`${baseUrl}/${number}/${type}?json`);

      // Для не-даты получаем также тривиальный факт
      if (type !== "date" && type !== "year") {
        urls.push(`${baseUrl}/${number}/trivia?json`);
      }
    }

    // Получаем все запрошенные факты
    const responses = await Promise.all(urls.map((url) => fetch(url)));
    const data = await Promise.all(responses.map((res) => res.json()));

    return data;
  }

  function displayResults(number, type, facts) {
    // Отображаем введенные пользователем данные
    let typeName = "";
    switch (type) {
      case "trivia":
        typeName = "Интересный факт";
        break;
      case "math":
        typeName = "Математический факт";
        break;
      case "date":
        typeName = "Факт о дате";
        break;
      case "year":
        typeName = "Факт о годе";
        break;
    }

    const numberDisplay = number || "случайное число";
    userInputInfo.innerHTML = `
                    <p><strong>Вы запросили:</strong> ${typeName} для ${numberDisplay}</p>
                `;

    // Отображаем полученные факты
    factsList.innerHTML = "";

    facts.forEach((fact) => {
      const factType = fact.type || "trivia";
      let factTypeName = "";

      switch (factType) {
        case "trivia":
          factTypeName = "Интересный факт";
          break;
        case "math":
          factTypeName = "Математический факт";
          break;
        case "date":
          factTypeName = "Факт о дате";
          break;
        case "year":
          factTypeName = "Факт о годе";
          break;
      }

      const factItem = document.createElement("div");
      factItem.className = "fact-item";
      factItem.innerHTML = `
                        <h3>${factTypeName}</h3>
                        <p>${fact.text || fact.number || fact.date}</p>
                    `;

      factsList.appendChild(factItem);
    });
  }
});
