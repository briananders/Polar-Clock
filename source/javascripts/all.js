//= require_tree .

if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

$(document).ready(function(){

  var buildPath = function(rad, boxSize) {
    var buildPath = String.format('M {2}, {2}  m 0, -{0}  a {0},{0} 0 0,1 0,{1}  a {0},{0} 0 0,1 0,-{1}', rad, rad * 2, boxSize);
    return buildPath;
  };

  var doc = $(document),
      boxSize,
      rings = ['second','minute','hour','day','day-of-the-week','month','year'],
      paths = {},
      container = $('#polar-clock'),
      svgns = "http://www.w3.org/2000/svg",
      svg = document.createElementNS(svgns, 'svg');

  if(doc.width() < doc.height()) {
    boxSize = doc.width();
  } else {
    boxSize = doc.height();
  }

  var viewBox = String.format("0 0 {0} {0}", boxSize);
  svg.setAttributeNS(null, "width", boxSize.toString());
  svg.setAttributeNS(null, "height", boxSize.toString());
  svg.setAttributeNS(null, "viewBox", viewBox.toString());
  $(svg).attr("xmlns", "http://www.w3.org/2000/svg");
  $(svg).attr("version", "1.1");
  container.append(svg);

  rings.forEach(function(ring){

    var path = document.createElementNS(svgns, 'path'),
        otherPath = document.createElementNS(svgns, 'path'),
        label = document.createElement('div'),
        index = rings.indexOf(ring),
        bs = 2 * boxSize / 3,
        slices = bs / rings.length,
        diameter = bs - (slices * index);

    path.id = ring;
    label.innerText = ring;
    label.classList.add('path-label');

    $(path).on('mouseover', function() {
      label.classList.add('visible');
    }).on('mouseout', function(){
      label.classList.remove('visible');
    });

    svg.appendChild(path);
    svg.appendChild(otherPath);
    container.append(label);

    paths[ring] = path;
    paths[ring].label = label;

    path.classList.add('moves');

    path.setAttributeNS(null, 'd', buildPath(diameter/2, boxSize/2));
    path.setAttributeNS(null, 'stroke-width', slices/3);
    path.setAttributeNS(null, 'fill', 'none');
    path.setAttributeNS(null, 'stroke','red');
    path.setAttributeNS(null, 'stroke-dasharray', '');

    otherPath.setAttributeNS(null, 'd', buildPath(diameter/2, boxSize/2));
    otherPath.setAttributeNS(null, 'stroke-width', 2);
    otherPath.setAttributeNS(null, 'fill', 'none');
    otherPath.setAttributeNS(null, 'stroke','red');
    otherPath.setAttributeNS(null, 'stroke-dasharray', '');
    otherPath.style.opacity = 0.1;
  });

  $('svg path.moves').each(function(){
    var length = this.getTotalLength();
    paths[this.id].length = length;
    // Clear any previous transition
    this.style.transition = this.style.WebkitTransition =
      'none';
    // Set up the starting positions
    this.style.strokeDasharray = length + ' ' + length;
    this.style.strokeDashoffset = length; //this is what will change with time
    // Trigger a layout so styles are calculated & the browser
    // picks up the starting position before animating
    this.getBoundingClientRect();
    // Define our transition

    this.style.transition = this.style.WebkitTransition =
      'stroke-dashoffset .2s ease';
  });

  var sec = 50,
      min = 50,
      hr = 10,
      d = 25,
      dotw = 0,
      mon = 9,
      yr = 1995;

  var daysInMonth = function(month,year) {
    return new Date(year, month + 1, 0).getDate();
  }
  var updateTime = function() {
    var date = new Date();

    if(sec !== date.getSeconds()) { // 0 - 59
      sec = date.getSeconds();
      sec = sec === 0 ? 60 : sec;
      paths['second'].style.strokeDashoffset = paths['second'].length - (sec * (paths['second'].length / 60));
      paths['second'].label.innerText = date.getSeconds();
    }
    if(min !== date.getMinutes()) { // 0 - 59
      min = date.getMinutes();
      min = min === 0 ? 60 : min;
      paths['minute'].style.strokeDashoffset = paths['minute'].length - (min * (paths['minute'].length / 60));
      paths['minute'].label.innerText = date.getMinutes();
    }
    if(hr !== (date.getHours() % 12)) { // 0 - 23
      hr = (date.getHours() % 12);
      hr = hr % 12;
      hr = hr === 0 ? 12 : hr;
      paths['hour'].style.strokeDashoffset = paths['hour'].length - (hr * (paths['hour'].length / 12));
      paths['hour'].label.innerText = date.getHours() % 12;
    }
    if(dotw !== date.getDay()) { // 0 - 6
      dotw = date.getDay();
      dotw = dotw === 0 ? 7 : dotw;
      paths['day-of-the-week'].style.strokeDashoffset = paths['day-of-the-week'].length - (dotw * (paths['day-of-the-week'].length / 7));
      paths['day-of-the-week'].label.innerText = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()];
    }
    if(d !== date.getDate()) { // 1 - 31
      d = date.getDate();
      paths['day'].style.strokeDashoffset = paths['day'].length - (d * (paths['day'].length / daysInMonth(date.getMonth(), date.getFullYear())));
      paths['day'].label.innerText = date.getDate();
    }
    if(mon !== date.getMonth()) { // 0 - 11
      mon = date.getMonth();
      mon = mon === 0 ? 12 : mon;
      paths['month'].style.strokeDashoffset = paths['month'].length - (mon * (paths['month'].length / 12));
      paths['month'].label.innerText = date.getMonth();
    }
    if(yr !== date.getFullYear()) { // 4digit
      yr = date.getFullYear();
      yr = yr === 0 ? 100 : yr;
      paths['year'].style.strokeDashoffset = paths['year'].length - ((yr % 100) * (paths['year'].length / 100));
      paths['year'].label.innerText = date.getFullYear();
    }
  };

  setInterval(updateTime, 1000);
});