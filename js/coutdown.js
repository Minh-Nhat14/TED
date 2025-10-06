function createCountdown(targetTime, elements, onEndText = "⛔ ĐÃ ĐÓNG BÁN") {
  function update() {
    const now = new Date().getTime();
    const distance = targetTime.getTime() - now;

    if (distance <= 0) {
      elements.days.innerText = "00";
      elements.hours.innerText = "00";
      elements.minutes.innerText = "00";
      elements.seconds.innerText = "00";
      if (elements.message) elements.message.innerText = onEndText;
      clearInterval(interval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    elements.days.innerText = String(days).padStart(2, "0");
    elements.hours.innerText = String(hours).padStart(2, "0");
    elements.minutes.innerText = String(minutes).padStart(2, "0");
    elements.seconds.innerText = String(seconds).padStart(2, "0");
  }

  update();
  const interval = setInterval(update, 1000);
}

// 🎯 Thời gian đóng bán
const ticketCloseTime = new Date("2025-07-19T21:00:00"); // vé đóng 21h 19/7
const merchCloseTime  = new Date("2025-07-03T21:00:00"); // merch đóng 21h 11/7

// 🧩 DOM phần tử tương ứng
const ticketElements = {
  days: document.getElementById("days-ticket"),
  hours: document.getElementById("hours-ticket"),
  minutes: document.getElementById("minutes-ticket"),
  seconds: document.getElementById("seconds-ticket"),
  message: document.getElementById("message-ticket") // nếu bạn muốn hiện dòng trạng thái
};

const merchElements = {
  days: document.getElementById("days-merch"),
  hours: document.getElementById("hours-merch"),
  minutes: document.getElementById("minutes-merch"),
  seconds: document.getElementById("seconds-merch"),
  message: document.getElementById("message-merch")
  // không cần message nếu không có dòng trạng thái riêng
};

// ▶️ Khởi chạy
createCountdown(ticketCloseTime, ticketElements, "⛔ ĐÃ ĐÓNG BÁN VÉ!");
createCountdown(merchCloseTime, merchElements, "⛔ ĐÃ ĐÓNG BÁN MERCH!");
