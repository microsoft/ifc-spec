function decl_preview_active() {
    return $('#sidebar').hasClass('active');
}

function show_decl_preview() {
    $("#sidebar").addClass("active");
    $("#sidebar").css({"margin-left" : "0px"});
}

function hide_decl_preview() {
    $("#sidebar").removeClass("active");
    $("#sidebar").css({"margin-left" : -$("#sidebar").width()});
}

function init_decl_preview() {
    $("#sidebarCollapse").on("click", function() {
        if (decl_preview_active()) {
          hide_decl_preview();
        }
        else {
          show_decl_preview();
        }
      });
      hide_decl_preview();
}

function set_decl_preview_content(content) {
    if (!decl_preview_active())
        return;
    $('#sidebar-content')
        .html(content);
}