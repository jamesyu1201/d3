d3["svg"]["line"] = function() {
  var x = null,
      y = null,
      interpolate = "linear",
      interpolator = d3_svg_lineInterpolators[interpolate],
      interpargs = [null];

  function line(d) {
	if (d.length < 1) return null;
	interpargs[0] = x==null ? d : d3_svg_linePoints(this, d, x, y);
    return "M" + interpolator.apply(null, interpargs);
  }

  line["x"] = function(v) {
    if (!arguments.length) return x;
    x = v;
    return line;
  };

  line["y"] = function(v) {
    if (!arguments.length) return y;
    y = v;
    return line;
  };

  line["interpolate"] = function(v) {
    if (!arguments.length) return interpolate;
    interpolator = d3_svg_lineInterpolators[interpolate = v];
    interpargs = arguments.length > 1 ? arguments : [null];
    return line;
  };

  return line;
};

/**
 * @private Converts the specified array of data into an array of points
 * (x-y tuples), by evaluating the specified `x` and `y` functions on each
 * data point. The `this` context of the evaluated functions is the specified
 * "self" object; each function is passed the current datum and index.
 */
function d3_svg_linePoints(self, d, x, y) {
  var points = [],
      i = -1,
      n = d.length,
      fx = typeof x == "function",
      fy = typeof y == "function",
      value;
  if (fx && fy) {
    while (++i < n) points.push([
      x.call(self, value = d[i], i),
      y.call(self, value, i)
    ]);
  } else if (fx) {
    while (++i < n) points.push([x.call(self, d[i], i), y]);
  } else if (fy) {
    while (++i < n) points.push([x, y.call(self, d[i], i)]);
  } else {
    while (++i < n) points.push([x, y]);
  }
  return points;
}

/**
 * @private The default `x` property, which references d[0]
 */
function d3_svg_lineX(d) {
  return d[0];
}

/**
 * @private The default `y` property, which references d[1]
 */
function d3_svg_lineY(d) {
  return d[1];
}

/**
 * @private The various interpolators supported by the `line` class.
 */
var d3_svg_lineInterpolators = {
  "linear": d3_svg_lineLinear,
  "basis": d3_svg_lineBasis,
  "cardinal" : d3_svg_lineCardinal
};

/**
 * @private Linear interpolation; generates "L" commands.
 */
function d3_svg_lineLinear(points) {
  if (points.length < 1) return null;
  var path = [],
      i = 0,
      n = points.length,
      p = points[0];
  path.push(p[0], ",", p[1]);
  while (++i < n) path.push("L", (p = points[i])[0], ",", p[1]);
  return path.join("");
}

/**
 * @private Cardinal spline interpolation; generates "C" commands.
 */
function d3_svg_lineCardinal(points, tension, closed) {
  if (points.length <= 2) return null;
  if (tension == undefined) tension = 0.8;
  return points[0] + d3_svg_lineHermite(points,
    d3_svg_lineCardinalTangents(points, tension, closed));
}

/**
 * @private Hermite spline construction
 */
function d3_svg_lineHermite(points, tangents) {
  if (tangents.length < 1
      || (points.length != tangents.length
      && points.length != tangents.length + 2)) return "";
  var quad = points.length != tangents.length,
      path = "",
      p0 = points[0],
      p = points[1],
      t0 = tangents[0],
      t = t0,
      pi = 1;

  if (quad) {
    path += "Q" + (p[0] - t0[0] * 2 / 3) + ","  + (p[1] - t0[1] * 2 / 3)
        + "," + p[0] + "," + p[1];
    p0 = points[1];
    pi = 2;
  }

  if (tangents.length > 1) {
    t = tangents[1];
    p = points[pi];
    pi++;
    path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1])
        + "," + (p[0] - t[0]) + "," + (p[1] - t[1])
        + "," + p[0] + "," + p[1];
    for (var i = 2; i < tangents.length; i++, pi++) {
      p = points[pi];
      t = tangents[i];
      path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1])
          + "," + p[0] + "," + p[1];
    }
  }

  if (quad) {
    var lp = points[pi];
    path += "Q" + (p[0] + t[0] * 2 / 3) + ","  + (p[1] + t[1] * 2 / 3) + ","
        + lp[0] + "," + lp[1];
  }

  return path;
}

/**
 * @private Generates tangents for a cardinal spline
 */
function d3_svg_lineCardinalTangents(points, tension, closed) {
  var pts = points,
      N = pts.length-1;

  // if closed shape, adjust endpoints to get all tangents
  if (closed) {
    pts = [points[N-1]].concat(points);
    pts.push(points[1]);
  }

  var tangents = [],
      a = (1 - tension) / 2,
      p0 = pts[0],
      p1 = pts[1],
      p2 = pts[2];

  for (var i = 3; i < pts.length; i++) {
    tangents.push([a * (p2[0] - p0[0]), a * (p2[1] - p0[1])]);
    p0 = p1;
    p1 = p2;
    p2 = pts[i];
  }

  tangents.push([a * (p2[0] - p0[0]), a * (p2[1] - p0[1])]);
  return tangents;
}

/**
 * @private B-spline interpolation; generates "C" commands.
 */
function d3_svg_lineBasis(points) {
  if (points.length < 3) return d3_svg_lineLinear(points);
  var path = [],
      i = 1,
      n = points.length,
      pi = points[0],
      x0 = pi[0],
      y0 = pi[1],
      px = [x0, x0, x0, (pi = points[1])[0]],
      py = [y0, y0, y0, pi[1]];
  path.push(x0, ",", y0);
  d3_svg_lineBasisBezier(path, px, py);
  while (++i < n) {
    pi = points[i];
    px.shift(); px.push(pi[0]);
    py.shift(); py.push(pi[1]);
    d3_svg_lineBasisBezier(path, px, py);
  }
  i = -1;
  while (++i < 2) {
    px.shift(); px.push(pi[0]);
    py.shift(); py.push(pi[1]);
    d3_svg_lineBasisBezier(path, px, py);
  }
  return path.join("");
}

/**
 * @private Returns the dot product of the given four-element vectors.
 */
function d3_svg_lineDot4(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

/*
 * @private Matrix to transform basis (b-spline) control points to bezier
 * control points. Derived from FvD 11.2.8.
 */
var d3_svg_lineBasisBezier1 = [0, 2/3, 1/3, 0],
    d3_svg_lineBasisBezier2 = [0, 1/3, 2/3, 0],
    d3_svg_lineBasisBezier3 = [0, 1/6, 2/3, 1/6];

/**
 * @private Pushes a "C" Bézier curve onto the specified path array, given the
 * two specified four-element arrays which define the control points.
 */
function d3_svg_lineBasisBezier(path, x, y) {
  path.push(
      "C", d3_svg_lineDot4(d3_svg_lineBasisBezier1, x),
      ",", d3_svg_lineDot4(d3_svg_lineBasisBezier1, y),
      ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, x),
      ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, y),
      ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, x),
      ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, y));
}
