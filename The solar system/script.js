$(document).ready(function() {
  
  var years = 0;
  var hours = 0;
  var days = 0;
  
 setInterval(function(){
   years++;
  $("p").text(years + " years passed");
 
 }, 2000);
 
 setInterval(function(){
   hours += 8760/200;
  $("span").text(Math.round(hours) + " hours passed");
 
 }, 10)
 
  setInterval(function(){
   days += 365/20;
  $("seconds").text(Math.round(days) + " days passed");
 
 }, 100)
 
});