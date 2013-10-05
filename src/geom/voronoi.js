import "../core/functor";
import "../svg/line";
import "voronoi/";
import "geom";

d3.geom.voronoi = function(points) {
  var x = d3_svg_lineX,
      y = d3_svg_lineY,
      fx = x,
      fy = y,
      clipExtent = d3_geom_voronoiClipExtent;

  // @deprecated; use voronoi(data) instead.
  if (points) return voronoi(points);

  function voronoi(data) {
    var polygons = [];

    d3_geom_voronoi(sites(data), clipExtent).cells.forEach(function(cell, i) {
      (polygons[i] = cell.edges.length ? cell.edges.map(function(edge) {
        var start = edge.start();
        return [start.x, start.y];
      }).reverse() : [
        [clipExtent[0][0], clipExtent[0][1]],
        [clipExtent[1][0], clipExtent[0][1]],
        [clipExtent[1][0], clipExtent[1][1]],
        [clipExtent[0][0], clipExtent[1][1]]
      ]).point = data[i];
    });

    return polygons;
  }

  function sites(data) {
    return data.map(function(d, i) { return {x: fx(d, i), y: fy(d, i), i: i}; });
  }

  voronoi.links = function(data) {
    return d3_geom_voronoi(sites(data)).edges.filter(function(edge) {
      return edge.l && edge.r;
    }).map(function(edge) {
      return {
        source: data[edge.l.i],
        target: data[edge.r.i]
      };
    });
  };

  voronoi.triangles = function(data) {
    var triangles = [];

    d3_geom_voronoi(sites(data)).cells.forEach(function(cell, i) {
      var site = cell.site,
          edges = cell.edges.sort(d3_geom_voronoiHalfEdgeOrder),
          j = -1,
          m = edges.length,
          e0,
          s0,
          e1 = edges[m - 1].edge,
          s1 = e1.l === site ? e1.r : e1.l;

      while (++j < m) {
        e0 = e1;
        s0 = s1;
        e1 = edges[j].edge;
        s1 = e1.l === site ? e1.r : e1.l;
        if (d3_geom_voronoiTriangleArea(site, s0, s1) < 0 && i < s0.i && i < s1.i) {
          triangles.push([data[i], data[s0.i], data[s1.i]]);
        }
      }
    });

    return triangles;
  };

  voronoi.x = function(_) {
    return arguments.length ? (fx = d3_functor(x = _), voronoi) : x;
  };

  voronoi.y = function(_) {
    return arguments.length ? (fy = d3_functor(y = _), voronoi) : y;
  };

  voronoi.clipExtent = function(_) {
    if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent;
    clipExtent = _ == null ? d3_geom_voronoiClipExtent : _;
    return voronoi;
  };

  // @deprecated; use clipExtent instead.
  voronoi.size = function(_) {
    if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent && clipExtent[1];
    return voronoi.clipExtent(_ && [[0, 0], _]);
  };

  return voronoi;
};

var d3_geom_voronoiClipExtent = [[-1e6, -1e6], [1e6, 1e6]];

function d3_geom_voronoiTriangleArea(a, b, c) {
  return (a.x - c.x) * (b.y - a.y) - (a.x - b.x) * (c.y - a.y);
}
