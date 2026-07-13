function updateTime(){
let now = new Date();

let options = {
day:"numeric",
month:"long",
year:"numeric",
hour:"2-digit",
minute:"2-digit"
};

document.getElementById("dateTime").innerHTML =
now.toLocaleString("en-IN", options);
}

updateTime();
setInterval(updateTime,1000);