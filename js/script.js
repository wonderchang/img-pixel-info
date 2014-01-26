//View responsive
$('#picture').css('width', window.innerWidth * 0.65 + 'px');
$('#picture').css('height', window.innerHeight * 0.98 + 'px');
$('#info').css('width', window.innerWidth * 0.26 + 'px');
$('#info').css('height', window.innerHeight * 0.98 + 'px');

//Data
var save_color = { r: 255, g: 255, b: 255, a: 255 };
var color_box_width = window.innerWidth * 0.26;
var color_box_height = 25;
var tolerance = 25;
var filter_mode = 0;
var flood_mode = 0;


//DOM element
var img = document.createElement('img');
var src_pic = document.getElementById('src_pic');
var src_pic_ctx = src_pic.getContext("2d");
var move_color = document.getElementById('move_color');
var move_color_ctx = move_color.getContext("2d");
var click_color = document.getElementById('click_color');
var click_color_ctx = click_color.getContext("2d");

document.getElementById('click_color').setAttribute('width', color_box_width);
document.getElementById('click_color').setAttribute('height', color_box_height);
document.getElementById('move_color').setAttribute('width', color_box_width);
document.getElementById('move_color').setAttribute('height', color_box_height);
document.getElementById('tolerance_adjust').style.width = color_box_width + 'px';

//The source of picture
//img.src = './img/color_wheel_730.png';
//img.src = './img/girl.jpg';
img.src = './img/mouse.jpg';

//Load the picture and convert to canvas
img.onload = function() {
  src_pic.width = img.width;
  src_pic.height = img.height;
  src_pic_ctx.drawImage(img, 0, 0);
  $('#original_width').html(img.width);
  $('#original_height').html(img.height);

}

//Move color
src_pic.addEventListener('mousemove', function(evt) {
  var pixel = get_pixel_info(evt.offsetX, evt.offsetY);
  var color_code = rgb_to_hex(pixel.r, pixel.g, pixel.b);
  $('#move_x').html(evt.offsetX);
  $('#move_y').html(evt.offsetY);
  $('#move_rgb_color').html(pixel.r + ', ' + pixel.g + ', ' + pixel.b);
  $('#move_hex_color').html(color_code);
  move_color_ctx.fillStyle = color_code;
  move_color_ctx.fillRect(0, 0, color_box_width, color_box_height);
  calculate_distance(save_color, pixel);
});

//Select color
src_pic.addEventListener('click', function(evt) {
  var pixel = get_pixel_info(evt.offsetX, evt.offsetY);
  var color_code = rgb_to_hex(pixel.r, pixel.g, pixel.b);
  save_color.r = pixel.r;
  save_color.g = pixel.g;
  save_color.b = pixel.b;
  save_color.a = pixel.a;
  $('#click_rgb_color').html(pixel.r + ', ' + pixel.g + ', ' + pixel.b);
  $('#click_hex_color').html(color_code);
  click_color_ctx.fillStyle = color_code;
  click_color_ctx.fillRect(0, 0, color_box_width, color_box_height);
  calculate_distance(save_color, save_color);
  if(flood_mode) {
    floodfill(evt.offsetX, evt.offsetY, {r: 0, g: 0, b: 0, a: 255}, src_pic_ctx, img.width, img.height, tolerance);
  }
});

document.querySelector('#tolerance_adjust').addEventListener('change', function(evt) {
  $("#tolerance").html(evt.target.value);
  tolerance = parseInt(evt.target.value);
  if(filter_mode) {
    threshold(tolerance);
  }
});

document.querySelector('#filter').addEventListener('click', function(evt) {
  if(filter_mode) {
    init_image(src_pic_ctx, img);
    filter_mode = 0;
    $('#filter').html('On');
  }
  else {
    threshold(tolerance);
    filter_mode = 1;
    $('#filter').html('Off');
  }
});

document.querySelector('#flood_fill').addEventListener('click', function(evt) {
  if(flood_mode) {
    flood_mode = 0;
    $('#flood_fill').html('On');
  }
  else {
    flood_mode = 1;
    $('#flood_fill').html('Off');
  }
});

document.querySelector('#reset').addEventListener('click', function(evt) {
  init_image(src_pic_ctx, img);
  filter_mode = 0;
  $('#filter').html('On');
});

function init_image(context, img_src) {
  context.drawImage(img_src, 0, 0);
}

function calculate_distance(fixed_color, change_color) {
  var expression = Math.pow(fixed_color.r - change_color.r, 2) + Math.pow(fixed_color.g - change_color.g, 2) + Math.pow(fixed_color.b - change_color.b, 2);
  var distance = Math.sqrt(expression);
  $('#color_dis').html(parseInt(distance));
}

function get_pixel_info(x, y) {
  var data = src_pic_ctx.getImageData(x, y, 1, 1);
  return {
    r: data.data[0],
      g: data.data[1],
      b: data.data[2],
      a: data.data[3]
  };
}

function rgb_to_hex(r, g, b) {
  return "#" + component_to_hex(r) + component_to_hex(g) + component_to_hex(b);
}

function component_to_hex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function threshold(tolerance) {
  init_image(src_pic_ctx, img);
  var data = src_pic_ctx.getImageData(0, 0, img.width, img.height);
  for(var i = 0; i < data.data.length; i+=4) {
    if(Math.abs(save_color.r - data.data[i]) < tolerance && Math.abs(save_color.g - data.data[i+1]) < tolerance && Math.abs(save_color.b - data.data[i+2]) < tolerance) {
      data.data[i] = data.data[i];
      data.data[i+1] = data.data[i+1];
      data.data[i+2] = data.data[i+2];
    }
    else {
      data.data[i] = 0;
      data.data[i+1] = 0;
      data.data[i+2] = 0;
    }
  }
  src_pic_ctx.putImageData(data, 0, 0);
  src_pic_ctx.restore();
}

