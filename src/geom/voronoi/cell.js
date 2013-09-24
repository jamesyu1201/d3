function d3_geom_voronoiCell(site) {
  this.site = site;
  this.edges = [];
}

d3_geom_voronoiCell.prototype.prepare = function() {
  var halfEdges = this.edges,
      iHalfEdge = halfEdges.length,
      edge;

  while (iHalfEdge--) {
    edge = halfEdges[iHalfEdge].edge;
    if (!edge[1] || !edge[0]) halfEdges.splice(iHalfEdge, 1);
  }

  halfEdges.sort(d3_geom_voronoiHalfEdgeOrder);
  return halfEdges.length;
};

function d3_geom_voronoiCloseCells(extent) {
  var x0 = extent[0][0],
      x1 = extent[1][0],
      y0 = extent[0][1],
      y1 = extent[1][1],
      x2,
      y2,
      x3,
      y3,
      cells = d3_geom_voronoiCells,
      iCell = cells.length,
      cell,
      iHalfEdge,
      halfEdges,
      nHalfEdges,
      edge,
      start,
      end;

  while (iCell--) {
    cell = cells[iCell];
    if (!cell || !cell.prepare()) continue;
    halfEdges = cell.edges;
    nHalfEdges = halfEdges.length;
    iHalfEdge = 0;
    while (iHalfEdge < nHalfEdges) {
      end = halfEdges[iHalfEdge].end(), x3 = end[0], y3 = end[1];
      start = halfEdges[++iHalfEdge % nHalfEdges].start(), x2 = start[0], y2 = start[1];
      if (abs(x3 - x2) > ε || abs(y3 - y2) > ε) {
        edge = d3_geom_voronoiCreateBorderEdge(cell.site, end,
            abs(x3 - x0) < ε && y1 - y3 > ε ? [x0, abs(x2 - x0) < ε ? y2 : y1]
            : abs(y3 - y1) < ε && x1 - x3 > ε ? [abs(y2 - y1) < ε ? x2 : x1, y1]
            : abs(x3 - x1) < ε && y3 - y0 > ε ? [x1, abs(x2 - x1) < ε ? y2 : y0]
            : abs(y3 - y0) < ε && x3 - x0 > ε ? [abs(y2 - y0) < ε ? x2 : x0, y0]
            : null);
        halfEdges.splice(iHalfEdge, 0, new d3_geom_voronoiHalfEdge(edge, cell.site, null));
        ++nHalfEdges;
      }
    }
  }
}

function d3_geom_voronoiHalfEdgeOrder(a, b) {
  return b.angle - a.angle;
}
