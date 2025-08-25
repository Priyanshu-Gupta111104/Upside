// // Updated profile.js with admin-based activity tracking, download options, and two-column layout support

// document.addEventListener('DOMContentLoaded', () => {
//   const params = new URLSearchParams(window.location.search);
//   const enquiryId = params.get('id');
//   const enquiries = JSON.parse(localStorage.getItem('enquiries')) || [];
//   const lead = enquiries.find(l => l.id === enquiryId);
//   if (!lead) return alert("Profile not found");

//   document.getElementById('profileName').textContent = lead.name || '';
//   document.getElementById('profilePhone').textContent = lead.phone || '';
//   document.getElementById('profileEmail').value = lead.email || '';
//   document.getElementById('profileGender').value = lead.gender || '';
//   document.getElementById('profileDob').value = lead.dob || '';
//   document.getElementById('profileAddress').value = lead.address || '';
//   document.getElementById('guardianName').value = lead.guardianName || '';
//   document.getElementById('guardianPhone').value = lead.guardianPhone || '';
//   document.getElementById('guardianEmail').value = lead.guardianEmail || '';

//   document.getElementById('saveProfile').onclick = () => {
//     lead.name = document.getElementById('profileName').textContent.trim();
//     lead.phone = document.getElementById('profilePhone').textContent.trim();
//     lead.email = document.getElementById('profileEmail').value;
//     lead.gender = document.getElementById('profileGender').value;
//     lead.dob = document.getElementById('profileDob').value;
//     lead.address = document.getElementById('profileAddress').value;
//     lead.guardianName = document.getElementById('guardianName').value;
//     lead.guardianPhone = document.getElementById('guardianPhone').value;
//     lead.guardianEmail = document.getElementById('guardianEmail').value;
//     pushActivity('Updated profile details', 'Admin');
//     syncAndRender();
//     alert("Profile updated!");
//   };

//   function pushActivity(actionText, admin) {
//     const log = `${admin} - ${actionText} - ${new Date().toLocaleString()}`;
//     lead.activityLog = lead.activityLog || [];
//     lead.activityLog.unshift(log);
//   }


//   document.getElementById('saveNote').onclick = () => {
//   const note = document.getElementById('newNote').value.trim();
//   const admin = document.getElementById('noteAdmin').value;
//   if (!note || !admin) return;
//   lead.notes = lead.notes || [];
//   lead.notes.push({ text: note, admin, time: new Date().toLocaleString() });
//   pushActivity(`Added note: "${note}"`, admin);
//   localStorage.setItem('enquiries', JSON.stringify(enquiries));
//   syncAndRender();
//   };

  
//  document.getElementById('saveTask').onclick = () => {
//   const task = document.getElementById('newTask').value.trim();
//   const time = document.getElementById('taskDateTime').value;
//   const admin = document.getElementById('taskAdmin').value;
//   if (!task || !time || !admin) return;
//   lead.tasks = lead.tasks || [];
//   lead.tasks.push({ text: task, time, admin });
//   pushActivity(`Assigned task: "${task}"`, admin);
//   localStorage.setItem('enquiries', JSON.stringify(enquiries));
//   syncAndRender();
//   };

//   function renderNotes() {
//   const list = document.getElementById('notesList');
//   list.innerHTML = (lead.notes || []).map((n, i) => `
//     <li>
//       <b>${n.text}</b> <br/>
//       <small>${n.admin} - ${n.time}</small>
//       <button onclick="editNote(${i})">✏️</button>
//       <button onclick="deleteNote(${i})">🗑️</button>
//     </li>
//   `).join('');
// }
  
// function renderTasks() {
//   const list = document.getElementById('tasksList');
//   list.innerHTML = (lead.tasks || []).map((t, i) => `
//     <li>
//       <b>${t.text}</b> <br/>
//       <small>${t.admin} @ ${new Date(t.time).toLocaleString()}</small>
//       <button onclick="editTask(${i})">✏️</button>
//       <button onclick="deleteTask(${i})">🗑️</button>
//     </li>
//   `).join('');
// }

  
//   function sendNotification(message) {
//     const notifs = JSON.parse(localStorage.getItem("notifications")) || [];
//     notifs.unshift({ message, time: new Date().toLocaleTimeString() });
//     localStorage.setItem("notifications", JSON.stringify(notifs));
//   }

//   function syncAndRender() {
//     localStorage.setItem('enquiries', JSON.stringify(enquiries));
//     renderNotes();
//     renderTasks();
//     renderActivity();
//   }



//   function renderActivity() {
//     const list = document.getElementById('activityLog');
//     list.innerHTML = (lead.activityLog || []).map(a => `<li>${a}</li>`).join('');
//   }
// window.editNote = function(i) {
//   const updated = prompt("Edit note:", lead.notes[i].text);
//   if (updated) {
//     lead.notes[i].text = updated;
//     pushActivity("Edited a note", lead.notes[i].admin);
//     syncAndRender();
//   }
// };

// window.deleteNote = function(i) {
//   if (confirm("Delete this note?")) {
//     const admin = lead.notes[i].admin;
//     lead.notes.splice(i, 1);
//     pushActivity("Deleted a note", admin);
//     syncAndRender();
//   }
// };

// window.editTask = function(i) {
//   const updated = prompt("Edit task:", lead.tasks[i].text);
//   if (updated) {
//     lead.tasks[i].text = updated;
//     pushActivity("Edited a task", lead.tasks[i].admin);
//     syncAndRender();
//   }
// };

// window.deleteTask = function(i) {
//   if (confirm("Delete this task?")) {
//     const admin = lead.tasks[i].admin;
//     lead.tasks.splice(i, 1);
//     pushActivity("Deleted a task", admin);
//     syncAndRender();
//   }
// };


//   document.getElementById("downloadNotes").onclick = () => {
//     const csv = ["Note,Admin,Time"].concat((lead.notes || []).map(n => `"${n.text}","${n.by}","${n.time}"`)).join("\n");
//     downloadCSV(csv, `${lead.name.replace(/ /g, '_')}_notes.csv`);
//   };

//   document.getElementById("downloadTasks").onclick = () => {
//     const csv = ["Task,Time,Assigned To"].concat((lead.tasks || []).map(t => `"${t.text}","${t.time}","${t.assignedTo}"`)).join("\n");
//     downloadCSV(csv, `${lead.name.replace(/ /g, '_')}_tasks.csv`);
//   };

//   function downloadCSV(content, filename) {
//     const blob = new Blob([content], { type: "text/csv" });
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(blob);
//     a.download = filename;
//     a.click();
//   }

//   syncAndRender();
// });
