// D3 + HTML canvas: https://www.freecodecamp.org/news/d3-and-canvas-in-3-steps-8505c8b27444

var native_width = 1260.0;
var native_height = 800.0;

function transposed() {
    return options != null && options.transpose;
}

function height() {
    if (transposed()) {
        return native_width;
    }
    return native_height;
}

function width() {
    if (transposed())
        return native_height;
    return native_width;
}

var x = d3.scaleLinear()
          .range([0.0, native_width])
          .domain([0.0, 1.0]); // TODO

var y = d3.scaleLinear()
          .range([0.0, native_height])
          .domain([0.0, 1.0]); // TODO

function zoom_filter(event) {
    // for some reason 'event' is always undefined despite the documentation saying
    // it should be an event object: https://github.com/d3/d3-zoom/blob/v2.0.0/README.md#zoom_filter
    return true;
}

var zoom = d3.zoom()
             .filter(zoom_filter)
             .on("zoom", zoomed);

var graph_canvas = d3.select("#icicle")
                     .append("canvas")
                     .classed("graph-canvas", true)
                     .attr("width", native_width)
                     .attr("height", native_height)
                     .call(zoom)
                     .on("dblclick.zoom", null);

var backing_canvas = d3.select("#icicle")
                       .append("canvas")
                       .classed("backing-graph-canvas", true)
                       .attr("width", native_width)
                       .attr("height", native_height)
                       .attr("hidden", true);

class PartitionDataHelper
{
    constructor(root) {
        this.root = root;
    }

    partition() {
        var p = d3.partition()
                  .size([width(), height()])
                  .padding(0)
                  // Do not round results so that the graph will not truncate large sets of decls.
                  .round(false);
        p(this.root);
    }
}

var partition = null;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
    w: 150, h: 30, s: 3, t: 10
};

var total_size = 0;

var custom_data_base = document.createElement("custom");
var custom_data = d3.select(custom_data_base);

const delim = '`_';
function is_meta_name(name) {
    return name.includes(delim);
}

function append_name_meta(name, index) {
    return name + `${delim}${index.sort},${index.index}`;
}

function name_from_meta(str) {
    var parts = str.split(delim);
    return parts[0];
}

function name_and_index_from_meta(str) {
    var parts = str.split(delim);
    var name = parts[0];
    var str_index = parts[1];
    var index_parts = str_index.split(',');
    return { name: name, index: { sort: parseInt(index_parts[0]), index: parseInt(index_parts[1]) } };
}

function color_for_index(index) {
    return options.color_for_index(index);
}

function color_from_meta(str) {
    if (!is_meta_name(str)) {
        return d3.color('lightgray');
    }
    const meta = name_and_index_from_meta(str);
    return d3.color(color_for_index(meta.index));
}

function secondary_color_from_meta(str) {
    if (!is_meta_name(str))
        return 'none';
    const meta = name_and_index_from_meta(str);
    if (meta.index.sort != DeclIndex.Sort.Template)
        return 'none';
    const template_decl = sgraph.resolver.read(TemplateDecl, meta.index.index);
    // Transition for IFC version < 0.31.
    if (template_decl.entity.decl.sort == 0)
        return 'none';
    return color_for_index(template_decl.entity.decl);
}

function adjust_color_if_necessary(color, selected) {
    if (!color)
        return color;
    if (selected)
        return color;
    // Note: I tried interpolate here and it seemed to have more of an impact on perf over
    // the opacity method.  The opacity method has the issue of overlapping rects creating
    // the illusion of a selection.  Revisit later.
    //var new_color = d3.interpolate(d3.color(color), d3.color("white"))(0.75);
    var new_color = d3.color(color);
    new_color.opacity = options.deselected_opacity;
    return new_color;
}

function draw_rect(context, rect, fill, gradient_color, selected) {
    fill = adjust_color_if_necessary(fill, selected);
    if (gradient_color == null || gradient_color == 'none') {
        context.fillStyle = fill;
        context.fillRect(rect.left, rect.top, rect.width, rect.height);
        return;
    }
    const gradient_fill = adjust_color_if_necessary(d3.color(gradient_color), selected);
    const gradient = context.createLinearGradient(rect.left, rect.top, rect.left, rect.top + rect.height);
    gradient.addColorStop(0, fill);
    gradient.addColorStop(0.5, gradient_fill);
    gradient.addColorStop(1, gradient_fill);
    context.fillStyle = gradient;
    context.fillRect(rect.left, rect.top, rect.width, rect.height);
}

function draw_rect_info(rect) {
    const threshold = 2;
    // When the graph is transposed we actually want to check the node
    // height value because nodes will be stacked, not paired side-by-side.
    if (transposed()) {
        return rect.height > threshold;
    }
    return rect.width > threshold;
}

function draw_node(context, node, rect, selected) {
    const node_fill = node.getAttribute("fill");
    const gradient_color = node.getAttribute("gradient-fill");
    draw_rect(context, rect, node_fill, gradient_color, selected);
    if (draw_rect_info(rect)) {
        context.strokeStyle = adjust_color_if_necessary("#000000", selected);
        context.strokeRect(rect.left, rect.top, rect.width, rect.height);
        context.fillStyle = adjust_color_if_necessary("#000000", selected);
        const text = node.getAttribute("node-name");
        context.fillText(text, rect.left + 2, rect.top + 14, rect.width);
    }
}

function draw_backing_rect(context, node, rect) {
    context.fillStyle = node.getAttribute("backing-fill");
    context.fillRect(rect.left, rect.top, rect.width, rect.height);
}

function simple_draw_rect(context, node, rect) {
    context.fillStyle = node.getAttribute("fill");
    context.fillRect(rect.left, rect.top, rect.width, rect.height);
}

var running_fps_average = 0;
var fps_count = 0;
function draw_fps(context, fps) {
    context.fillStyle = "#000000";
    context.fillText(`FPS: ${fps}`, 50, 50);
    if (!isNaN(fps)) {
        running_fps_average += fps;
        fps_count += 1;
    }
    var fps_avg = running_fps_average / fps_count;
    context.fillText(`FPS (average): ${fps_avg}`, 50, 70);
}

function draw(canvas, is_backing_canvas, fps) {
    var context = canvas.node().getContext("2d");

    context.clearRect(0, 0, native_width, native_height);

    context.font = "14px serif";

    var rect = { left: null, top: null, height: null, width: null };
    for (var node of custom_data) {
        rect.left = parseInt(node.getAttribute("x"));
        rect.top = parseInt(node.getAttribute("y"));
        // Take the max between the height/width and 1px so the viewer has some
        // visual indication that _something_ is in this region.
        rect.height = Math.max(parseInt(node.getAttribute("height")), 1);
        rect.width = Math.max(parseInt(node.getAttribute("width")), 1);

        const selected = node.getAttribute("selected") == "true";

        if (!is_backing_canvas)
            draw_node(context, node, rect, selected);
        // Note: we only want to draw the backing rect if the node is selected.  This
        // will prevent mouse interactivity on the 'unselected' rects.
        else if (selected)
            draw_backing_rect(context, node, rect);
    }

    if (is_backing_canvas)
        return;
    if (options != null && options.show_fps)
        draw_fps(context, fps);
}

class CanvasColorGenerator {
    constructor() {
        this.next_color = 1;
    }

    next() {
        var r = 0;
        var g = 0;
        var b = 0;
        if (this.next_color < 0xffffff) {
            r = this.next_color & 0xff;
            g = (this.next_color & 0xff00) >> 8;
            b = (this.next_color & 0xff0000) >> 16;
            this.next_color += 1;
        }
        return CanvasColorGenerator.key(r, g, b);
    }

    reset() {
        this.next_color = 1;
    }

    static key(r, g, b) {
        return `rgb(${r},${g},${b})`;
    }
}

class NodeToColorMapper {
    constructor() {
        this.map = new Map();
        this.generator = new CanvasColorGenerator();
    }

    map_node(n) {
        const key = this.generator.next();
        this.map.set(key, n);
        return key;
    }

    get(key) {
        return this.map.get(key);
    }

    reset() {
        this.generator.reset();
        this.map.clear();
    }
}

var node_mapper = new NodeToColorMapper();

var last_update_time = 0;
var timer = d3.timer(function(elapsed) {
    // Aim for 60fps.
    if (elapsed - last_update_time > 16) {
        var fps = 1000 / (elapsed - last_update_time);
        draw(graph_canvas, false, fps);
        last_update_time = elapsed;
    }
});

function map_object(o) {
    return { key: o[0], value: o[1] };
}

function node_x(d) {
    if (transposed())
        return d.y0;
    return d.x0;
}

function node_y(d) {
    if (transposed())
        return d.x0;
    return d.y0;
}

function node_width(d) {
    if (transposed())
        return d.y1 - d.y0;
    return d.x1 - d.x0;
}

function transform_node_width(d, t) {
    if (transposed())
        return t(d.y1) - t(d.y0);
    return t(d.x1) - t(d.x0);
}

function node_height(d) {
    if (transposed())
        return d.x1 - d.x0;
    return d.y1 - d.y0;
}

function transform_node_height(d, t) {
    if (transposed())
        return t(d.x1) - t(d.x0);
    return t(d.y1) - t(d.y0);
}

function init_graph(root) {
    root = d3.hierarchy(Object.entries(root).map(map_object)[0], function(d) {
            return Object.entries(d.value).map(map_object);
        })
        .sum(function(d) { return d.value })
        .sort(function(a, b) { return b.value - a.value; });

    partition = new PartitionDataHelper(root);

    partition.partition();
    init_breadcrumb_trail();
    var percentage = 100;
    var percentageString = percentage + "%";

    d3.select("#percentage")
      .text(percentageString);

    d3.select("#explanation")
      .style("visibility", "");

    var sequenceArray = root.ancestors().reverse();
    update_breadcrumbs(sequenceArray, percentageString);

    custom_data = custom_data.selectAll("custom.rect")
                             .data(root.descendants())
                             .enter()
                             .append("custom")
                             .attr("class", "rect")
                             .attr("x", function(d) { return node_x(d); })
                             .attr("y", function(d) { return node_y(d); })
                             .attr("width", function(d) { return node_width(d); })
                             .attr("height", function(d) { return node_height(d); })
                             .attr("fill", function(d) { return color_from_meta(d.data.key); })
                             .attr("gradient-fill", function(d) { return secondary_color_from_meta(d.data.key); })
                             .attr("node-name", function(d) { return name_from_meta(d.data.key); })
                             .attr("backing-fill", function(d) { return node_mapper.map_node(d); })
                             .attr("selected", function(d) { return true; });

    //get total size from rect
    total_size = custom_data.node().__data__.value;

    // Center the view on the top-most node.
    reset_view();
}

function zoomed(e) {
    var new_x = e.transform.rescaleX(x);
    var new_y = e.transform.rescaleY(y);

    custom_data.transition()
               .duration(750)
               .attr("x", function(d) { return new_x(node_x(d)); })
               .attr("y", function(d) { return new_y(node_y(d)); })
               .attr("width", function(d) { return transform_node_width(d, new_x); })
               .attr("height", function(d) { return transform_node_height(d, new_y); });
}

d3.select(".graph-canvas")
  .on("click", function(e) {
    // Render the backing canvas to get the correct color.
    draw(backing_canvas, true);

    const mouse_x = e.layerX || e.offsetX;
    const mouse_y = e.layerY || e.offsetY;

    const backing_canvas_context = backing_canvas.node().getContext("2d");
    const color = backing_canvas_context.getImageData(mouse_x, mouse_y, 1, 1).data;
    const key = CanvasColorGenerator.key(color[0], color[1], color[2]);

    const node = node_mapper.get(key);
    if (node == null)
        return;
    clicked(node);
});

function clicked(d) {
    if (transposed()) {
        x.domain([d.y0, height()]).range([d.depth ? 20 : 0, height()]);
        y.domain([d.x0, d.x1]);
    }
    else {
        x.domain([d.x0, d.x1]);
        y.domain([d.y0, height()]).range([d.depth ? 20 : 0, height()]);
    }

    // Adjust the zoom transform so that zooming will work smoothly around the newly
    // centered node.  Solution from: https://github.com/d3/d3-zoom/issues/107.
    zoom.transform(graph_canvas, d3.zoomIdentity);

    custom_data.transition()
               .duration(750)
               .attr("x", function(d) { return x(node_x(d)); })
               .attr("y", function(d) { return y(node_y(d)); })
               .attr("width", function(d) { return transform_node_width(d, x); })
               .attr("height", function(d) { return transform_node_height(d, y); });

    // code to update the BreadcrumbTrail();
    var percentage = (100 * d.value / total_size).toPrecision(3);
    var percentageString = percentage + "%";
    if (percentage < 0.1) {
        percentageString = "< 0.1%";
    }

    d3.select("#percentage")
        .text(percentageString);

    d3.select("#explanation")
        .style("visibility", "");

    var sequenceArray = d.ancestors().reverse();
    update_breadcrumbs(sequenceArray, percentageString);

    // We only want to fire the handler when a node is actually clicked (in this handler).
    decl_selected(sequenceArray);
}

function init_breadcrumb_trail() {
    // Add the svg area.
    var trail = d3.select("#breadcrumb")
                  .append("svg")
                  .attr("width", native_width)
                  .attr("height", 50)
                  .attr("id", "trail");
    // Add the label at the end, for the percentage.
    trail.append("text")
         .attr("id", "endlabel")
         .style("fill", "#000");

    // Make the breadcrumb trail visible, if it's hidden.
    d3.select("#trail")
      .style("visibility", "");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumb_points(d, i) {
    var points = new Array();
    points.push("0,0");
    points.push(b.w + ",0");
    points.push(b.w + b.t + "," + (b.h / 2));
    points.push(b.w + "," + b.h);
    points.push("0," + b.h);
    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
        points.push(b.t + "," + (b.h / 2));
    }
    return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function update_breadcrumbs(nodeArray, percentageString) {
    // Data join; key function combines name and depth (= position in sequence).
    var trail = d3.select("#trail")
                  .selectAll("g")
                  .data(nodeArray, function(d) { return name_from_meta(d.data.key) + d.depth; });

    // Remove exiting nodes.
    trail.exit().remove();

    // Add breadcrumb and label for entering nodes.
    var entering = trail.enter().append("g");

    entering.append("polygon")
            .attr("points", breadcrumb_points)
            .style("fill", function(d) { return color_from_meta(d.data.key); });

    entering.append("text")
            .attr("x", (b.w + b.t) / 2)
            .attr("y", b.h / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(function(d) { return name_from_meta(d.data.key); });

    // Merge enter and update selections; set position for all nodes.
    entering.merge(trail).attr("transform", function(d, i) {
        return "translate(" + i * (b.w + b.s) + ", 0)";
    });

    // Now move and update the percentage at the end.
    d3.select("#trail")
      .select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(percentageString);
}

function decl_selected(nodes) {
    if (nodes == null)
        return;
    const selected_node = nodes[nodes.length - 1];
    if (selected_node == null)
        return;
    on_decl_selected(selected_node.data.key);
}

// See filter.js.
function filtered_by_property(property_filter, index) {
    const symbolic = symbolic_for_decl_sort(index.sort);
    const symbolic_decl = sgraph.resolver.read(symbolic, index.index);
    if (!has_property(symbolic_decl, "basic_spec"))
        return false;
    if (implies(symbolic_decl.basic_spec.value, BasicSpecifiers.Values.C)
        && implies(property_filter, PropertyFilters.OnlyCLinkage))
        return true;
    if (implies(symbolic_decl.basic_spec.value, BasicSpecifiers.Values.NonExported))
        return implies(property_filter, PropertyFilters.NonExported);
    return implies(property_filter, PropertyFilters.Exported);
}

function apply_graph_filter(filter) {
    if (filter.empty()) {
        custom_data.attr("selected", function(d) { return true; });
        return;
    }
    custom_data.attr("selected", function(d) {
        var meta = null;
        if (is_meta_name(d.data.key))
            meta = name_and_index_from_meta(d.data.key);
        if (filter.filter_sort()) {
            if (meta == null)
                return false;
            if (meta.index.sort != filter.sort)
                return false;
        }

        if (filter.filter_name()) {
            var name = meta != null ? meta.name : name_from_meta(d.data.key);
            if (filter.name != name)
                return false;
        }

        if (filter.filter_props() != PropertyFilters.None && meta != null) {
            return !filtered_by_property(filter.filter_props(), meta.index);
        }
        return true;
    });
}

function reset_view() {
    clicked(custom_data.node().__data__);
}

// See options.js
function color_updated() {
    custom_data.attr("fill", function(d) { return color_from_meta(d.data.key); })
               .attr("gradient-fill", function(d) { return secondary_color_from_meta(d.data.key); });
}

function transpose_updated() {
    // According to https://github.com/d3/d3-selection/blob/v2.0.0/README.md#selection_data the data bound to the
    // D3 graph is cached by reference (not copied) so all we need to do if a transpose is requested is re-partition
    // the data blob and ask the data element to perform layout over the values.
    partition.partition();
    custom_data.transition()
               .duration(750)
               .attr("x", function(d) { return node_x(d); })
               .attr("y", function(d) { return node_y(d); })
               .attr("width", function(d) { return node_width(d); })
               .attr("height", function(d) { return node_height(d); });
    reset_view();
}