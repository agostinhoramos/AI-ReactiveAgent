window.$ = window.$ || {};
window.$.sys = {
    "root_url": location.pathname.split('index.html')[0]
};
window.$.panel = {
    "warp_disp": $("#DISPLAY"),
    "warp_resl": $("#RESULT")
};
window.$.input = {
    "algrth": $("#FormControlAlgorithm"),
    "run": $("#run")
};
window.$.agent = {
    "is_running": !1,
    "have_error": !0,
    "conclude" : !1
};
window.data = {
    "select" : null
};
$(document).ready(() => {

    var select = Cookies.get('select');
    if( select !== undefined ){
        $.input.algrth.find('option[value="'+select+'"]')
        .attr('selected',!0);
    }

    $.input.algrth.on("change", function () {
        if ($.agent.is_running){
            $.input.run.click();
        }
        if (!$.agent.is_running) {
            INCLUDE.REMOVE();
            var name = $(this).val();
            if (name) {
                INCLUDE.URL('/algorithm/' + name + '/script.min.js');
                INCLUDE.URL('/algorithm/' + name + '/style.min.css');
                Cookies.set('select', name);
            }
            DOM.refresh();
        }
    });
    $.input.run.on("click", () => {
        if( !$.agent.have_error ){
            if( data.select === null ){
                if (!$.agent.is_running) {
                    $.input.run.val('PARAR');
                    $.agent.is_running = !0;
                    $.input.run.attr('active',!0);
                    auto.run();
                } else {
                    $.input.run.val('EXECUTAR');
                    $.agent.is_running = !1;
                    $.input.run.attr('active',null);
                    clearInterval(Thread.id);
                }
            }else{
                $.panel.warp_disp.click();
                data.select = null;
                $.panel.warp_disp.attr('on-edit',data.select);
                $.input.run.click();
            }
        }
    });
    $.input.algrth.change();
});

const DOM =  {
    refresh: function(){
        $.panel.warp_disp.html('');
        $.panel.warp_resl.html('');
        if( Cookies.get('page') !== Cookies.get('select') ){
            location.reload();
            Cookies.set('page', Cookies.get('select'));
        }
    }
};

function alert(d1, d2){
    $("#dialog").remove();
    if( $(".ui-dialog-titlebar-close").length == 0 ){
        d2===undefined?(d2=d1,d1='ALERT'):'';
        $("body").append(
            '<div id="dialog" title="'+d1+'">'+
            '<p>'+d2+'</p></div>'
        );
        $("#dialog").dialog();
    }
return !1;
}