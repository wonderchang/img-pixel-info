var CANVAS_WIDTH = 1280;

var img = document.createElement('img');
var src_pic = document.getElementById('src_pic');
var src_pic_ctx = src_pic.getContext("2d");
var clip_part = document.getElementById('clip_part');
var clip_part_ctx = clip_part.getContext("2d");
var tmp_color = document.getElementById('tmp_color');
var tmp_color_ctx = tmp_color.getContext("2d");
var ratio = 1;
var tmp_pixel = { r: 0, g: 0, b: 0 };
var tolerance = 50;

img.src = './img/girl.jpg';
img.onload = function() {

  src_pic.width = img.width;
  src_pic.height = img.height;
  resized_width = (img.width > CANVAS_WIDTH) ? (CANVAS_WIDTH) : (img.width);
  resized_height = (img.width > CANVAS_WIDTH) ? ((CANVAS_WIDTH * img.height / img.width)) : (img.height);
  src_pic.style.width =  resized_width + 'px';
  src_pic.style.height = resized_height + 'px';
  ratio = src_pic.width / resized_width;

  src_pic_ctx.drawImage(img, 0, 0);

  $('#original_width').html(img.width);
  $('#original_height').html(img.height);
  $('#resized_width').html(src_pic.style.width);
  $('#resized_height').html(src_pic.style.height);
  $('#ratio_num').html(ratio);

}

document.querySelector('#reset').addEventListener('click', function() {
  init_image(src_pic_ctx, img);
});

function init_image(context, img_src) {
  context.drawImage(img_src, 0, 0);
}

src_pic.addEventListener('mousemove', function(evt) {
  $('#move_x').html(evt.offsetX);
  $('#move_y').html(evt.offsetY);
  var pixel = get_pixel_info(evt.offsetX, evt.offsetY);
  var color_code = rgb_to_hex(pixel.r, pixel.g, pixel.b);
  $('#move_rgb_color').html(pixel.r + ', ' + pixel.g + ', ' + pixel.b);
  $('#move_hex_color').html(color_code);
  clip_part_ctx.fillStyle = color_code;
  clip_part_ctx.fillRect(0, 0, 72, 72);
  calculate_distance(tmp_pixel, pixel);
});

src_pic.addEventListener('click', function(evt) {
  var pixel = get_pixel_info(evt.offsetX, evt.offsetY);
  var color_code = rgb_to_hex(pixel.r, pixel.g, pixel.b);
  tmp_pixel.r = pixel.r;
  tmp_pixel.g = pixel.g;
  tmp_pixel.b = pixel.b;
  $('#click_rgb_color').html(pixel.r + ', ' + pixel.g + ', ' + pixel.b);
  $('#click_hex_color').html(color_code);
  tmp_color_ctx.fillStyle = color_code;
  tmp_color_ctx.fillRect(0, 0, 72, 72);
  calculate_distance(tmp_pixel, tmp_pixel);
});

document.querySelector('#threshold_adjust').addEventListener('change', function(evt) {
  $("#tolerance").html(evt.target.value);
  tolerance = parseInt(evt.target.value);
});

document.querySelector('#new_threshold').addEventListener('click', function(evt) {
  threshold(tolerance);
});

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
  var data = src_pic_ctx.getImageData(0, 0, 450, 385);
  for(var i = 0; i < data.data.length; i+=4) {
    if(Math.abs(tmp_pixel.r - data.data[i]) < tolerance && Math.abs(tmp_pixel.g - data.data[i+1]) < tolerance && Math.abs(tmp_pixel.b - data.data[i+2]) < tolerance) {
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

