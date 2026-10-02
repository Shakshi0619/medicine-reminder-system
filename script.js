let medicines = [];
let reminded = {};

// Load medicines from backend
async function loadMedicines() {
  try {
    const response = await fetch("/api/medicines");
    medicines = await response.json();
    displayMedicines();
  } catch (error) {
    console.error("Error loading medicines:", error);
  }
}

// Add medicine
async function addMedicine() {

  const name = document.getElementById("medicineName").value.trim();
  const dosage = document.getElementById("dosage").value.trim();
  const time = document.getElementById("time").value.trim();

  if (name === "" || dosage === "" || time === "") {
    alert("⚠️ Please fill all medicine details.");
    return;
  }

  // AM / PM time format
  const timePattern =
    /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;

  if (!timePattern.test(time)) {
    alert("⏰ Please enter time like 08:30 AM or 08:30 PM");
    return;
  }

  try {

    await fetch("/api/medicines", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        dosage: dosage,
        time: time.toUpperCase()
      })
    });

    document.getElementById("medicineName").value = "";
    document.getElementById("dosage").value = "";
    document.getElementById("time").value = "";

    await loadMedicines();

    alert("✅ Medicine added successfully!");

  } catch (error) {
    alert("❌ Unable to add medicine.");
    console.error(error);
  }
}


// Display medicines
function displayMedicines() {

  const list = document.getElementById("medicineList");
  const empty = document.getElementById("empty");

  list.innerHTML = "";

  document.getElementById("count").innerText =
    medicines.length;

  if (medicines.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  medicines.forEach((medicine) => {

    const card = document.createElement("div");

    card.className = "medicine-card";

    card.innerHTML = `
      <div class="med-left">

        <div class="med-icon">💊</div>

        <div>
          <h3>${medicine.name}</h3>
          <p>
            ${medicine.dosage} •
            ⏰ ${medicine.time}
          </p>
        </div>

      </div>

      <div>

        <span class="med-time">
          🔔 Reminder
        </span>

        <button
          class="delete-btn"
          onclick="deleteMedicine(${medicine.id})">
          🗑️
        </button>

      </div>
    `;

    list.appendChild(card);
  });
}


// Delete medicine
async function deleteMedicine(id) {

  if (confirm("Delete this medicine?")) {

    try {

      await fetch(`/api/medicines/${id}`, {
        method: "DELETE"
      });

      await loadMedicines();

    } catch (error) {
      console.error("Delete error:", error);
    }
  }
}


// Convert AM/PM to 24-hour format
function convertTo24Hour(timeString) {

  const parts =
    timeString.trim().toUpperCase().split(/\s+/);

  const time = parts[0];
  const period = parts[1];

  let [hour, minute] =
    time.split(":").map(Number);

  // PM
  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  // 12 AM = 00
  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return {
    hour: hour,
    minute: minute
  };
}


// Reminder sound
function playReminderSound() {

  const audio = new Audio(
    "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
  );

  audio.volume = 1.0;

  audio.play().catch(error => {
    console.log("Sound blocked:", error);
  });
}


// Check reminders
function checkReminders() {

  const now = new Date();

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  medicines.forEach((medicine) => {

    const reminderTime =
      convertTo24Hour(medicine.time);

    if (
      reminderTime.hour === currentHour &&
      reminderTime.minute === currentMinute
    ) {

      const reminderKey =
        medicine.id + "-" +
        now.getFullYear() + "-" +
        now.getMonth() + "-" +
        now.getDate() + "-" +
        currentHour + "-" +
        currentMinute;

      // Same minute me baar-baar reminder nahi
      if (reminded[reminderKey]) {
        return;
      }

      reminded[reminderKey] = true;

      // Sound
      playReminderSound();

      // Alert
      alert(
        "💊 Medicine Reminder!\n\n" +
        medicine.name +
        "\n" +
        medicine.dosage +
        "\n\n" +
        "⏰ It's time to take your medicine."
      );
    }
  });
}


// Load medicines when page opens
loadMedicines();


// Check every 10 seconds
setInterval(checkReminders, 10000);
