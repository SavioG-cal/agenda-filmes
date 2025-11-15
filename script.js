const apiKey = "f18414e2"; // sua OMDb API KEY

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDay = null;

// Carregar dados
let savedPosters = JSON.parse(localStorage.getItem("moviePosters")) || {};

function savePosters() {
  localStorage.setItem("moviePosters", JSON.stringify(savedPosters));
}

function renderWeekdays() {
  const weekdays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const container = document.getElementById("weekdays");
  container.innerHTML = "";
  weekdays.forEach(d => container.innerHTML += `<div>${d}</div>`);
}

function renderCalendar() {
  const monthNameEl = document.getElementById("monthName");
  const calendarGrid = document.getElementById("calendarGrid");

  const date = new Date(currentYear, currentMonth, 1);
  const firstDay = date.getDay(); // domingo = 0
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Mês com inicial maiúscula
  let monthFormatted = date.toLocaleString("pt-BR", { month: "long", year: "numeric" });
  monthFormatted = monthFormatted.charAt(0).toUpperCase() + monthFormatted.slice(1);
  monthNameEl.textContent = monthFormatted;

  calendarGrid.innerHTML = "";

  for (let i = 0; i < firstDay; i++) {
    calendarGrid.innerHTML += `<div class="day empty"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${currentYear}-${currentMonth}-${day}`;
    const bg = savedPosters[key]
      ? `style="background-image:url('${savedPosters[key]}')"`
      : "";

    calendarGrid.innerHTML += `
      <div class="day" data-day="${day}" ${bg}>
        <span>${day}</span>
      </div>`;
  }

  document.querySelectorAll(".day:not(.empty)").forEach(dayDiv => {
    dayDiv.addEventListener("click", () => openPopup(dayDiv.dataset.day));
  });
}

function openPopup(day) {
  selectedDay = day;
  document.getElementById("moviePopup").classList.remove("hidden");
  document.getElementById("omdbResult").classList.add("hidden");
  document.getElementById("movieTitleInput").value = "";
}

document.getElementById("cancelBtn").addEventListener("click", () => {
  document.getElementById("moviePopup").classList.add("hidden");
});

// BUSCAR NO OMDb
document.getElementById("searchMovieBtn").addEventListener("click", async () => {
  const title = document.getElementById("movieTitleInput").value;
  if (!title) return;

  const res = await fetch(
    `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`
  );
  const data = await res.json();

  if (data.Poster && data.Poster !== "N/A") {
    document.getElementById("omdbPoster").src = data.Poster;
    document.getElementById("omdbResult").classList.remove("hidden");
  } else {
    alert("Filme não encontrado.");
  }
});

document.getElementById("useOmdbPosterBtn").addEventListener("click", () => {
  const posterUrl = document.getElementById("omdbPoster").src;
  setPoster(posterUrl);
});

// UPLOAD MANUAL
document.getElementById("manualImageInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => setPoster(reader.result);
  reader.readAsDataURL(file);
});

// REMOVER POSTER
document.getElementById("removePosterBtn").addEventListener("click", () => {
  const key = `${currentYear}-${currentMonth}-${selectedDay}`;
  delete savedPosters[key];
  savePosters();
  document.getElementById("moviePopup").classList.add("hidden");
  renderCalendar();
});

function setPoster(url) {
  const key = `${currentYear}-${currentMonth}-${selectedDay}`;
  savedPosters[key] = url;
  savePosters();

  document.getElementById("moviePopup").classList.add("hidden");
  renderCalendar();
}

// Navegação
document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

// inicializar
renderWeekdays();
renderCalendar();

