// https://observablehq.com/@ilogre/force-directed-graph@475
function _1(md){return(
md`# Force-Directed Graph
## of relationship between visualization widgets and visual insights

### [Principle]
This *Force-directed Gra// ... existing code ...
  main.variable(observer("data")).define("data", ["d3"], _data);
// ... existing code ...
// ... existing code ...
function _data(d3){return(
d3.csv("rights.csv").then(function(data) {
  const nodes = [];
  const links = [];
  const nodeMap = new Map(); // To store unique nodes and assign them an ID/index

  data.forEach(d => {
    const sourceCompany = d.company;
    const targetRights = d.Rights;

    // Add source company as a node if not already present
    if (sourceCompany && !nodeMap.has(sourceCompany)) {
      nodeMap.set(sourceCompany, { id: sourceCompany, group: "company", radius: 10 });
    }

    // Process targetRights to create links
    if (targetRights) {
      const targets = targetRights.split(',').map(s => s.trim());
      targets.forEach(target => {
        if (target) {
          // Add target company as a node if not already present
          if (!nodeMap.has(target)) {
            nodeMap.set(target, { id: target, group: "company", radius: 10 });
          }
          links.push({ source: sourceCompany, target: target, value: 1 }); // Value can be adjusted if needed
        }
      });
    }
  });

  // Convert nodeMap values to an array for the nodes
  nodeMap.forEach(node => nodes.push(node));

  return { nodes: nodes, links: links };
})
)}
// ... existing code ...
ph* represents the associations between visualization widgets (blue nodes) and visual capabilities called insights (orange nodes).

### [Interaction]
Pass the cursor hover a node to display only it's first order connections:
- if it's a widget, it displays the insights satisfied by it
- if it's an insight, it displays the widgets satisfying it.

Click on the node or its label to lock the selection. You can then jump to a neighbor to explore the catalog.
Click again on the selected node to cancel the selection.

Drag and drop the circles to reorganize the elements and avoid occlusions.

### [Possible usage]
- to visualize the most and less satisfied insights to identify the lack of contributions in the data visualization spectrum.
- to estimate visually the proximity between two widgets in terms of visual capabilities (here insight satisfaction).

### [To do]
Try to add insight and widget images inside the circles instead of a plain color filling.

### [Sources]
This variant of [Mike Bostock's D3 force directed graph](https://observablehq.com/@d3/disjoint-force-directed-graph) is based on center and collide forces instead of charge, x and y.

**Data extracted from the Kaizen Solutions Showcase :
https://kzslabshowcase.kaizen-solutions.net/#/pages/visualizations**
`
)}

function _chart(data,d3,width,height,link_width,color,drag,invalidation)
{
  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map(d => Object.create(d));

  var connected = [];

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id(d => d.id)
        .distance(100)
    )
    .force(
      "collide",
      d3
        .forceCollide()
        .strength(0.5)
        .radius(50)
        .iterations(90)
    )
    .force(
      "center",
      d3
        .forceCenter()
        .x(0.5)
        .y(0.5)
    );

  const svg = d3
    .create("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height]);

  ////////////////////////////////////////////////////////////////////////////////
  // GRAPH
  ////////////////////////////////////////////////////////////////////////////////
  // Rendering functions
  var reset_node_opacity = function(d) {
    return 1;
  };
  var reset_link_opacity = function(d) {
    return 0.4;
  };

  const link = svg
    .append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("value", d => d.value)
    .attr("target", d => d.target.id)
    .attr("source", d => d.source.id)
    .attr("stroke", '#000')
    .attr("stroke-width", d => link_width(d.value))
    .attr("stroke-opacity", d => reset_link_opacity(d));

  const node = svg
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .style("cursor", "pointer")
    .attr("id", d => d.id)
    .attr("r", d => d.radius)
    .attr("fill", color)
    .call(drag(simulation));

  const texts_widgets = svg
    .selectAll(".id")
    .data(nodes)
    .enter()
    .filter(d => d.group == 'widget')
    .append("text")
    .attr("class", "labels")
    .attr("font-family", "bebas neue")
    .attr("font-size", 14)
    .attr("dx", 15)
    .attr("dy", "0.35em")
    .style('fill', '#1f77b4')
    .style("cursor", "pointer")
    .attr("id", d => d.id)
    .text(d => d.id)
    .call(drag(simulation));

  const texts_insights = svg
    .selectAll(".id")
    .data(nodes)
    .enter()
    .filter(d => d.group == 'insight')
    .append("text")
    .attr("class", "labels")
    .attr("font-family", "bebas neue")
    .attr("font-size", 18)
    .attr("dx", 23)
    .attr("dy", "0.35em")
    .style('fill', '#ff7f0e')
    .style("cursor", "pointer")
    .attr("id", d => d.id)
    .text(d => d.id)
    .call(drag(simulation));

  /////////////////////////////////////////////////////////////////////////////////////
  ///// UX FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////////////

  const reset_all_opacity = function() {
    d3.selectAll('circle').attr('opacity', d => reset_node_opacity(d));
    d3.selectAll('line').attr('stroke-opacity', d => reset_link_opacity(d));
    d3.selectAll('.labels').style('opacity', 1);
  };

  const hide_all_light = function() {
    d3.selectAll('circle').attr('opacity', 0.08);
    d3.selectAll('line').attr('stroke-opacity', 0.03);
    d3.selectAll('.labels').style('opacity', 0.03);
  };

  var restore_default_display = function() {
    d3.selectAll('.legend_session').attr('active', 'no');
    d3.selectAll('.legend_channel').attr('active', 'no');
    reset_all_opacity();
  };

  /////////////////////////////////////////////////////////////////////////////////////
  ///// INTERACTIONS
  /////////////////////////////////////////////////////////////////////////////////////

  var selection = null;
  const selected = d => selection === d;
  var neighbors_nodes_id = [];

  texts_insights.on('click', (e, d) => {
    onClickHandler(e, "#de700d");
  });

  texts_widgets.on('click', (e, d) => {
    onClickHandler(e, "#185e8f");
  });

  node.on('click', (e, d) => {
    var nodecolor;
    if (e.group === "insight") nodecolor = "#de700d";
    else nodecolor = "#185e8f";
    onClickHandler(e, nodecolor);
  });

  function onClickHandler(e, nodecolor) {
    if (selection == null) {
      selection = e.id;
      d3.selectAll('circle[id="' + e.id + '"]')
        .attr("stroke", nodecolor)
        .attr("stroke-width", 5);
      onMouseOver(e);
    } else if (selection == e.id) {
      d3.selectAll('circle[id="' + selection + '"]').attr("stroke-width", 0);
      selection = null;
      onMouseOut(e);
    } else if (neighbors_nodes_id.includes(e.id)) {
      d3.selectAll('circle[id="' + selection + '"]').attr("stroke-width", 0);
      selection = e.id;
      d3.selectAll('circle[id="' + e.id + '"]')
        .attr("stroke", nodecolor)
        .attr("stroke-width", 5);
      onMouseOver(e);
    }
  }

  node.on('mouseover', d => {
    if (!selection) {
      onMouseOver(d);
    } else if (neighbors_nodes_id.includes(d.id)) {
      onMouseOverNeighbors(d);
    }
  });

  var last_targeted_node;
  function onMouseOver(d) {
    last_targeted_node = d;
    neighbors_nodes_id = [];
    // the hover interaction is not active if a node is selected
    hide_all_light();

    // Higlight basic links
    d3.selectAll('circle[id="' + d.id + '"]').attr('opacity', 1);

    var links_src = d3.selectAll('line[source="' + d.id + '"]');
    var links_tar = d3.selectAll('line[target="' + d.id + '"]');
    links_src.attr('stroke-opacity', dd => reset_link_opacity(dd));
    links_tar.attr('stroke-opacity', dd => reset_link_opacity(dd));

    links_src.each(e => {
      neighbors_nodes_id.push(e.target.id);
      d3.selectAll('circle[id="' + e.target.id + '"]').attr(
        'opacity',
        reset_node_opacity(e.target)
      );
    });
    links_tar.each(e => {
      neighbors_nodes_id.push(e.source.id);
      d3.selectAll('circle[id="' + e.source.id + '"]').attr(
        'opacity',
        reset_node_opacity(e.source)
      );
    });

    // Highlight selected node label
    texts_widgets.filter(w => w.id === d.id).style('opacity', 1);
    texts_insights.filter(i => i.id === d.id).style('opacity', 1);

    // Highlight neighbors labels
    neighbors_nodes_id.forEach(e =>
      texts_widgets.filter(w => w.id === e).style('opacity', 1)
    );
    neighbors_nodes_id.forEach(e =>
      texts_insights.filter(w => w.id === e).style('opacity', 1)
    );
  }

  function onMouseOverNeighbors(d) {
    var temp_neighbors = [];
    // the hover interaction is not active if a node is selected
    // Higlight basic links
    d3.selectAll('circle[id="' + d.id + '"]').attr('opacity', 1);

    var links_src = d3.selectAll('line[source="' + d.id + '"]');
    var links_tar = d3.selectAll('line[target="' + d.id + '"]');
    links_src.attr('stroke-opacity', dd => reset_link_opacity(dd));
    links_tar.attr('stroke-opacity', dd => reset_link_opacity(dd));

    links_src.each(e => {
      temp_neighbors.push(e.target.id);
      d3.selectAll('circle[id="' + e.target.id + '"]').attr(
        'opacity',
        reset_node_opacity(e.target)
      );
    });
    links_tar.each(e => {
      temp_neighbors.push(e.source.id);
      d3.selectAll('circle[id="' + e.source.id + '"]').attr(
        'opacity',
        reset_node_opacity(e.source)
      );
    });

    // Highlight selected node label
    texts_widgets.filter(w => w.id === d.id).style('opacity', 1);
    texts_insights.filter(i => i.id === d.id).style('opacity', 1);

    // Highlight neighbors labels
    temp_neighbors.forEach(e =>
      texts_widgets.filter(w => w.id === e).style('opacity', 1)
    );
    temp_neighbors.forEach(e =>
      texts_insights.filter(w => w.id === e).style('opacity', 1)
    );
  }

  node.on('mouseout', d => {
    onMouseOut(d);
  });

  function onMouseOut(d) {
    if (!selection) {
      restore_default_display();
    } else if (neighbors_nodes_id.includes(d.id)) {
      hide_all_light();
      onMouseOver(last_targeted_node);
    }
  }

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node.attr("cx", d => d.x).attr("cy", d => d.y);

    texts_widgets.attr("x", d => d.x).attr("y", d => d.y);

    texts_insights.attr("x", d => d.x).attr("y", d => d.y);
  });

  invalidation.then(() => simulation.stop());

  return svg.node();
}


function _data(FileAttachment){return(
FileAttachment("D3links.json").json()
)}

function _height(){return(
1250
)}

function _color(d3)
{
  const scale = d3.scaleOrdinal(d3.schemeCategory10);
  return d => scale(d.group);
}


function _link_width(){return(
function(label){
  if(label == 1) return 3;
  else if (label == 2) return 1.5;
  else return 1;
}
)}

function _drag(d3){return(
simulation => {
  
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}
)}

function _d3(require){return(
require("d3@5")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["D3links.json", {url: new URL("./files/10adffe6bb874f4de457d557425f9c3d9b7b008874b8be4fb5465c5c572854b48d7687ce704574c9174615c0fbe41539b6a2ed0f3e45920dc8848423a75df02a.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["data","d3","width","height","link_width","color","drag","invalidation"], _chart);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("height")).define("height", _height);
  main.variable(observer("color")).define("color", ["d3"], _color);
  main.variable(observer("link_width")).define("link_width", _link_width);
  main.variable(observer("drag")).define("drag", ["d3"], _drag);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
