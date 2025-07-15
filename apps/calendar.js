const cal = document.getElementById('calendar');
let date = new Date();
function renderCalendar() {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  let html = `<div class='header'><button id='prev'>&lt;</button><span>${date.toLocaleString('default', {month:'long'})} ${year}</span><button id='next'>&gt;</button></div><table><tr>`;
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  for (let d of days) html += `<th>${d}</th>`;
  html += '</tr><tr>';
  for (let i=0; i<firstDay; i++) html += '<td></td>';
  for (let d=1; d<=daysInMonth; d++) {
    const isToday = d===today.getDate() && month===today.getMonth() && year===today.getFullYear();
    html += `<td class='${isToday?'today':''}'>${d}</td>`;
    if ((firstDay+d)%7===0) html += '</tr><tr>';
  }
  html += '</tr></table>';
  cal.innerHTML = html;
  document.getElementById('prev').onclick = ()=>{date.setMonth(date.getMonth()-1);renderCalendar();};
  document.getElementById('next').onclick = ()=>{date.setMonth(date.getMonth()+1);renderCalendar();};
}
renderCalendar();