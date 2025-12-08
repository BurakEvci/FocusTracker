// src/utils/helpers.js

/**
 * Saniyeyi MM:SS formatına çevirir.
 * Örn: 1500 -> 25:00
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
};

/**
 * Dakikayı "Xsa Ydk" veya "Ydk" formatına çevirir.
 * Örn: 75 -> 1sa 15dk
 */
export const formatHourMin = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}sa ${m}dk`;
  return `${m}dk`;
};

/**
 * ISO Tarihini okunabilir formata çevirir.
 * Örn: 2025-11-29T15:30:00 -> 15:30 (29/11)
 */
export const formatDate = (isoString) => {
  const d = new Date(isoString);
  const time = `${d.getHours() < 10 ? '0' + d.getHours() : d.getHours()}:${d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()}`;
  const date = `${d.getDate()}/${d.getMonth() + 1}`;
  return `${time} (${date})`;
};