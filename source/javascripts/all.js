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

  var Hand = function(obj, svg, container, length, boxSize) {
    this.maxWidth = (2/3) * boxSize,
    this.slice = this.maxWidth/(length + 1),
    this.diameter = this.maxWidth - (this.slice * obj.index);

    this.buildPath = function(rad, boxSize) {
      return String.format('M {2}, {2}  m 0, -{0}  a {0},{0} 0 0,1 0,{1}  a {0},{0} 0 0,1 0,-{1}', rad, rad * 2, boxSize);
    };

    this.addAttributes = function() {
      this.path.setAttributeNS(null, 'd', this.buildPath(this.diameter/2, boxSize/2));
      this.path.setAttributeNS(null, 'stroke-width', this.slice/3);
      this.path.setAttributeNS(null, 'fill', 'none');
      // this.path.setAttributeNS(null, 'stroke','red');
      this.path.setAttributeNS(null, 'stroke-dasharray', '');

      this.length = this.path.getTotalLength();
      this.path.style.strokeDasharray = this.length + ' ' + this.length;
      this.path.style.strokeDashoffset = 0;//this.length;
      this.path.getBoundingClientRect();
    };

    this.addBindings = function() {
      var self = this;
      $(this.path).on('mouseover', function() {
        self.label.classList.add('visible');
      });
      $(this.path).on('mouseout', function(){
        self.label.classList.remove('visible');
      });
    };

    this.updateLength = function(fraction, string) {
      if(string) {
        this.span.innerText = string;
      }
      this.path.style.strokeDashoffset = this.length - (fraction * this.length);
      this.updateColor(fraction);
    };

    this.updateColor = function(fraction){
      var col = obj.color;
      var sat = fraction;
      var gray = col.r * 0.3086 + col.g * 0.6094 + col.b * 0.0820;

      col.r = Math.round(col.r * sat + gray * (1 - sat));
      col.g = Math.round(col.g * sat + gray * (1 - sat));
      col.b = Math.round(col.b * sat + gray * (1 - sat));

      this.path.style.stroke = String.format('rgb({0}, {1}, {2})', col.r, col.g, col.b);
      console.log(this.path.style.stroke);
    }

    this.componentToHex = function(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

    this.rgbToHex = function(r, g, b) {
      return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    this.hexToRgb = function(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
      } : null;
    }

    this.init = function() {
      this.path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
      this.span = document.createElement('span');
      this.label = document.createElement('div');

      this.path.id = obj.id;
      this.label.innerText = obj.string;
      this.label.classList.add('path-label');

      svg.appendChild(this.path);
      this.addAttributes(this.path);
      this.addBindings();

      container.appendChild(this.label);
      this.label.appendChild(this.span);
    };

    this.init();
  };

  var container = document.getElementById('polar-clock'),
      svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg'),
      clock = {},
      boxSize,
      hands = [{
          'id': 'second',
          'index': '0',
          'string': 'Second: ',
          'color': {
            'r': 255,
            'g': 0,
            'b': 0
          },
        },{
          'id': 'minute',
          'index': '1',
          'string': 'Minute: ',
          'color': {
            'r': 255,
            'g': 0,
            'b': 0
          },
        },{
          'id': 'hour',
          'index': '2',
          'string': 'Hour: ',
          'color': {
            'r': 255,
            'g': 0,
            'b': 0
          },
        },{
          'id': 'day',
          'index': '4',
          'string': 'Day: ',
          'color': {
            'r': 255,
            'g': 0,
            'b': 0
          },
        },{
          'id': 'week_day',
          'index': '3',
          'string': '',
          'color': {
            'r': 255,
            'g': 0,
            'b': 0
          },
        },{
          'id': 'month',
          'index': '5',
          'string': '',
          'color': {
            'r': 255,
            'g': 0,
            'b': 0
          },
        },{
          'id': 'year',
          'index': '6',
          'string': 'Year: ',
          'color': {
            'r': 255,
            'g': 0,
            'b': 0
          },
        }];

  if($(document).width() < $(document).height()) {
    boxSize = $(document).width();
  } else {
    boxSize = $(document).height();
  }

  hands.forEach(function(hand){
    clock[hand.id] = new Hand(hand, svg, container, hands.length, boxSize);
  });

  var viewBox = String.format("0 0 {0} {0}", boxSize);
  svg.setAttributeNS(null, "width", boxSize.toString());
  svg.setAttributeNS(null, "height", boxSize.toString());
  svg.setAttributeNS(null, "viewBox", viewBox.toString());
  $(svg).attr("xmlns", "http://www.w3.org/2000/svg");
  $(svg).attr("version", "1.1");
  container.appendChild(svg);

  var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttributeNS(null, "cx", (boxSize/2).toString());
  circle.setAttributeNS(null, "cy", (boxSize/2).toString());
  circle.setAttributeNS(null, "r", (boxSize/18).toString());
  circle.setAttributeNS(null, "fill", "red");
  svg.appendChild(circle);

  var circleLabel = document.createElement('div');
  circleLabel.classList.add('path-label','full-time');
  container.appendChild(circleLabel);

  $(circle).on('mouseover', function() {
    circleLabel.classList.add('visible');
  });
  $(circle).on('mouseout', function(){
    circleLabel.classList.remove('visible');
  });

  var second,
      minute,
      hour,
      day,
      week_day,
      mon,
      year;

  var daysInMonth = function(month,year) {
    return new Date(year, month + 1, 0).getDate();
  };
  var updateTime = function() {
    var date = new Date();

    if(second !== date.getSeconds()) { // 0 - 59
      second = date.getSeconds();
      clock['second'].updateLength((second === 0 ? 60 : second) / 60, (second === 0 ? 60 : second));
    }
    if(minute !== date.getMinutes()) { // 0 - 59
      minute = date.getMinutes();
      clock['minute'].updateLength(((minute === 0 && second === 0) ? 60 : minute) / 60, (minute === 0 ? 60 : minute));
    }
    if(hour !== (date.getHours() % 12)) { // 0 - 23
      hour = (date.getHours() % 12);
      clock['hour'].updateLength((hour === 0 ? 12 : hour % 12) / 12, (hour === 0 ? 12 : hour % 12));
    }
    if(week_day !== date.getDay()) { // 0 - 6
      week_day = date.getDay();
      clock['week_day'].updateLength((week_day + 1) / 7, ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][week_day]);
    }
    if(month !== date.getMonth()) { // 0 - 11
      month = date.getMonth();
      clock['month'].updateLength((month + 1) / 12, ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month]);
    }
    if(year !== date.getFullYear()) { // 4digit
      year = date.getFullYear();
      clock['year'].updateLength((year === 0 ? 100 : year % 100) / 100, year);
    }
    if(day !== date.getDate()) { // 1 - 31
      day = date.getDate();
      clock['day'].updateLength(day / daysInMonth(month, year), day);
    }
    circleLabel.innerText = String.format('{0}:{1}:{2} {3} {4} {5}, {6}',
                                          hour,
                                          minute,
                                          second,
                                          ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][week_day],
                                          ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month],
                                          day,
                                          year);
  };

  setInterval(updateTime, 500);
});