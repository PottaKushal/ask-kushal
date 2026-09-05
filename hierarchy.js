// Interactive recreation of the parent-child ownership-hierarchy visualizer
// described on the resume: edit a leaf investment value and watch it cascade
// up through every parent automatically. Pure vanilla JS + SVG, no deps.

(function () {
  const root = document.getElementById("hierarchy-root");
  if (!root) return;

  // Tree: a PE sponsor owning stakes in portfolio companies, which in turn
  // hold sub-entities. Values are illustrative ($M), editable at the leaves.
  const tree = {
    name: "Meridian Capital Partners",
    value: 0,
    children: [
      {
        name: "Northwind Logistics Holdco",
        value: 0,
        children: [
          { name: "Northwind Freight US", value: 140, editable: true },
          { name: "Northwind Freight EU", value: 95, editable: true },
        ],
      },
      {
        name: "Beacon Health Group",
        value: 0,
        children: [
          { name: "Beacon Clinical Labs", value: 210, editable: true },
          { name: "Beacon Diagnostics", value: 130, editable: true },
          { name: "Beacon Home Care", value: 60, editable: true },
        ],
      },
      {
        name: "Solstice Retail Holdco",
        value: 0,
        children: [{ name: "Solstice Direct-to-Consumer", value: 175, editable: true }],
      },
    ],
  };

  function recompute(node) {
    if (!node.children) return node.value;
    node.value = node.children.reduce((sum, c) => sum + recompute(c), 0);
    return node.value;
  }
  recompute(tree);

  // Layout: simple level-based columns, vertically distributed.
  const NODE_W = 190;
  const NODE_H = 64;
  const COL_GAP = 90;
  const ROW_GAP = 18;

  function flattenLevels(node, depth, levels) {
    levels[depth] = levels[depth] || [];
    levels[depth].push(node);
    if (node.children) node.children.forEach((c) => flattenLevels(c, depth + 1, levels));
    return levels;
  }
  const levels = flattenLevels(tree, 0, []);
  const maxRows = Math.max(...levels.map((l) => l.length));
  const width = levels.length * (NODE_W + COL_GAP) - COL_GAP + 40;
  const height = maxRows * (NODE_H + ROW_GAP) - ROW_GAP + 40;

  // Assign positions.
  const positions = new Map();
  levels.forEach((nodesInLevel, depth) => {
    const colHeight = nodesInLevel.length * (NODE_H + ROW_GAP) - ROW_GAP;
    const yOffset = (height - colHeight) / 2;
    nodesInLevel.forEach((node, i) => {
      positions.set(node, {
        x: 20 + depth * (NODE_W + COL_GAP),
        y: yOffset + i * (NODE_H + ROW_GAP),
      });
    });
  });

  function buildParentMap(node, parent, map) {
    map.set(node, parent);
    if (node.children) node.children.forEach((c) => buildParentMap(c, node, map));
    return map;
  }
  const parentMap = buildParentMap(tree, null, new Map());

  function fmt(v) {
    return "$" + Math.round(v).toLocaleString() + "M";
  }

  const svgNS = "http://www.w3.org/2000/svg";
  let svg, nodeEls;

  function render() {
    root.innerHTML = "";
    svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", "100%");
    svg.style.minWidth = width + "px";
    svg.style.display = "block";
    nodeEls = new Map();

    // Edges first (so nodes draw on top).
    function drawEdges(node) {
      if (!node.children) return;
      const p = positions.get(node);
      node.children.forEach((c) => {
        const cp = positions.get(c);
        const path = document.createElementNS(svgNS, "path");
        const x1 = p.x + NODE_W;
        const y1 = p.y + NODE_H / 2;
        const x2 = cp.x;
        const y2 = cp.y + NODE_H / 2;
        const midX = (x1 + x2) / 2;
        path.setAttribute(
          "d",
          `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`
        );
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#2a3040");
        path.setAttribute("stroke-width", "1.5");
        path.dataset.edgeFor = c.name;
        svg.appendChild(path);
        drawEdges(c);
      });
    }
    drawEdges(tree);

    function drawNode(node) {
      const pos = positions.get(node);
      const g = document.createElementNS(svgNS, "g");
      g.setAttribute("transform", `translate(${pos.x}, ${pos.y})`);

      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("width", NODE_W);
      rect.setAttribute("height", NODE_H);
      rect.setAttribute("rx", 10);
      rect.setAttribute("fill", "#0e1119");
      rect.setAttribute("stroke", node.editable ? "#38bdf8" : "#2a3040");
      rect.setAttribute("stroke-width", node.editable ? 1.5 : 1);
      g.appendChild(rect);

      const name = document.createElementNS(svgNS, "text");
      name.textContent = node.name;
      name.setAttribute("x", 12);
      name.setAttribute("y", 24);
      name.setAttribute("fill", "#e8eaf0");
      name.setAttribute("font-size", "12.5");
      name.setAttribute("font-family", "inherit");
      // simple truncation
      if (node.name.length > 26) name.textContent = node.name.slice(0, 24) + "...";
      g.appendChild(name);

      const val = document.createElementNS(svgNS, "text");
      val.textContent = fmt(node.value);
      val.setAttribute("x", 12);
      val.setAttribute("y", 46);
      val.setAttribute("fill", node.editable ? "#7dd3fc" : "#9aa1b2");
      val.setAttribute("font-size", "15");
      val.setAttribute("font-weight", "700");
      val.setAttribute("font-family", "inherit");
      g.appendChild(val);

      if (node.editable) {
        const hintTxt = document.createElementNS(svgNS, "text");
        hintTxt.textContent = "click to edit";
        hintTxt.setAttribute("x", NODE_W - 10);
        hintTxt.setAttribute("y", 46);
        hintTxt.setAttribute("text-anchor", "end");
        hintTxt.setAttribute("fill", "#656d80");
        hintTxt.setAttribute("font-size", "9.5");
        hintTxt.setAttribute("font-family", "inherit");
        g.appendChild(hintTxt);
        g.style.cursor = "pointer";
        g.addEventListener("click", () => editNode(node));
      }

      svg.appendChild(g);
      nodeEls.set(node, { g, rect, val });
    }

    function drawAll(node) {
      drawNode(node);
      if (node.children) node.children.forEach(drawAll);
    }
    drawAll(tree);

    root.appendChild(svg);

    const caption = document.createElement("p");
    caption.style.cssText = "color:#656d80;font-size:0.78rem;margin:14px 0 0;";
    caption.textContent =
      "Blue-bordered boxes are editable leaf investments. Change one and every parent total recalculates instantly.";
    root.appendChild(caption);
  }

  function editNode(node) {
    const current = node.value;
    const input = prompt(`New value for "${node.name}" (in $M):`, current);
    if (input === null) return;
    const num = parseFloat(input);
    if (isNaN(num) || num < 0) return;
    node.value = num;
    recompute(tree);
    animateUpdate(node);
  }

  function animateUpdate(changedNode) {
    // Re-render values with a brief highlight cascading up the tree.
    let cur = changedNode;
    const chain = [];
    while (cur) {
      chain.push(cur);
      cur = parentMap.get(cur);
    }
    chain.forEach((node, i) => {
      const els = nodeEls.get(node);
      if (!els) return;
      setTimeout(() => {
        els.val.textContent = fmt(node.value);
        els.rect.setAttribute("stroke", "#4ade80");
        els.rect.setAttribute("stroke-width", "2");
        setTimeout(() => {
          els.rect.setAttribute("stroke", node.editable ? "#38bdf8" : "#2a3040");
          els.rect.setAttribute("stroke-width", node.editable ? "1.5" : "1");
        }, 500);
      }, i * 160);
    });
  }

  render();
})();
